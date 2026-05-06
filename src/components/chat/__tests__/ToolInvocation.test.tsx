import { describe, test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocation, getToolLabel } from "../ToolInvocation";

afterEach(() => {
  cleanup();
});

describe("getToolLabel — str_replace_editor", () => {
  test("create command names the file being created", () => {
    expect(
      getToolLabel("str_replace_editor", {
        command: "create",
        path: "/components/Counter.jsx",
      }),
    ).toBe("Creating Counter.jsx");
  });

  test("str_replace command reads as 'Editing'", () => {
    expect(
      getToolLabel("str_replace_editor", {
        command: "str_replace",
        path: "/components/Counter.jsx",
      }),
    ).toBe("Editing Counter.jsx");
  });

  test("insert command also reads as 'Editing'", () => {
    expect(
      getToolLabel("str_replace_editor", {
        command: "insert",
        path: "/App.jsx",
      }),
    ).toBe("Editing App.jsx");
  });

  test("view command reads as 'Viewing'", () => {
    expect(
      getToolLabel("str_replace_editor", {
        command: "view",
        path: "/App.jsx",
      }),
    ).toBe("Viewing App.jsx");
  });

  test("undo_edit command spells out the action", () => {
    expect(
      getToolLabel("str_replace_editor", {
        command: "undo_edit",
        path: "/App.jsx",
      }),
    ).toBe("Undoing edit in App.jsx");
  });

  test("unknown command falls through to the generic 'Editing' label", () => {
    expect(
      getToolLabel("str_replace_editor", {
        command: "wat",
        path: "/App.jsx",
      }),
    ).toBe("Editing App.jsx");
  });

  test("missing command (e.g. mid-stream partial-call) defaults to 'Editing'", () => {
    expect(
      getToolLabel("str_replace_editor", { path: "/App.jsx" }),
    ).toBe("Editing App.jsx");
  });

  test("missing path falls back to a generic label", () => {
    expect(getToolLabel("str_replace_editor", { command: "create" })).toBe(
      "Editing files",
    );
  });

  test("missing args entirely is handled gracefully", () => {
    expect(getToolLabel("str_replace_editor", undefined)).toBe(
      "Editing files",
    );
  });

  test("strips the directory portion of the path", () => {
    expect(
      getToolLabel("str_replace_editor", {
        command: "create",
        path: "/a/b/c/d/Form.tsx",
      }),
    ).toBe("Creating Form.tsx");
  });
});

describe("getToolLabel — file_manager", () => {
  test("delete command names the file", () => {
    expect(
      getToolLabel("file_manager", {
        command: "delete",
        path: "/components/Stale.jsx",
      }),
    ).toBe("Deleting Stale.jsx");
  });

  test("rename command names both old and new files", () => {
    expect(
      getToolLabel("file_manager", {
        command: "rename",
        path: "/components/Old.jsx",
        new_path: "/components/New.jsx",
      }),
    ).toBe("Renaming Old.jsx to New.jsx");
  });

  test("rename without new_path (mid-stream) still produces a label", () => {
    expect(
      getToolLabel("file_manager", {
        command: "rename",
        path: "/components/Old.jsx",
      }),
    ).toBe("Renaming Old.jsx");
  });

  test("falls back to a prettified tool name when path is missing", () => {
    expect(getToolLabel("file_manager", { command: "delete" })).toBe(
      "File Manager",
    );
  });

  test("unknown command with a known path falls back to the prettified tool name", () => {
    expect(
      getToolLabel("file_manager", {
        command: "shred",
        path: "/components/X.jsx",
      }),
    ).toBe("File Manager");
  });
});

describe("getToolLabel — unknown tools", () => {
  test("prettifies snake_case tool names", () => {
    expect(getToolLabel("some_other_tool", {})).toBe("Some Other Tool");
  });

  test("prettifies kebab-case tool names", () => {
    expect(getToolLabel("kebab-cased-tool", {})).toBe("Kebab Cased Tool");
  });

  test("handles missing args", () => {
    expect(getToolLabel("custom_thing", undefined)).toBe("Custom Thing");
  });
});

describe("getToolLabel — path basename edge cases", () => {
  test("a bare filename with no leading slash is preserved", () => {
    expect(
      getToolLabel("str_replace_editor", {
        command: "create",
        path: "App.jsx",
      }),
    ).toBe("Creating App.jsx");
  });

  test("trailing slashes on the path are ignored", () => {
    expect(
      getToolLabel("str_replace_editor", {
        command: "create",
        path: "/components/foo/",
      }),
    ).toBe("Creating foo");
  });

  test("non-string args values are treated as missing", () => {
    expect(
      getToolLabel("str_replace_editor", {
        command: "create",
        path: 42,
      }),
    ).toBe("Editing files");
  });
});

describe("<ToolInvocation />", () => {
  test("shows the loading indicator while in 'call' state", () => {
    render(
      <ToolInvocation
        toolName="str_replace_editor"
        state="call"
        args={{ command: "create", path: "/App.jsx" }}
      />,
    );

    expect(screen.getByTestId("tool-status-loading")).toBeDefined();
    expect(screen.queryByTestId("tool-status-done")).toBeNull();
    expect(screen.getByText("Creating App.jsx")).toBeDefined();
  });

  test("shows the loading indicator during a 'partial-call'", () => {
    render(
      <ToolInvocation
        toolName="str_replace_editor"
        state="partial-call"
        args={{ path: "/App.jsx" }}
      />,
    );

    expect(screen.getByTestId("tool-status-loading")).toBeDefined();
    // No command yet — defaults to the generic 'Editing' label.
    expect(screen.getByText("Editing App.jsx")).toBeDefined();
  });

  test("shows the success indicator once a result is present", () => {
    render(
      <ToolInvocation
        toolName="str_replace_editor"
        state="result"
        args={{ command: "create", path: "/App.jsx" }}
        result="File created: /App.jsx"
      />,
    );

    expect(screen.getByTestId("tool-status-done")).toBeDefined();
    expect(screen.queryByTestId("tool-status-loading")).toBeNull();
    expect(screen.getByText("Creating App.jsx")).toBeDefined();
  });

  test("a 'result' state with no result body still reads as in-progress", () => {
    render(
      <ToolInvocation
        toolName="str_replace_editor"
        state="result"
        args={{ command: "create", path: "/App.jsx" }}
        result={undefined}
      />,
    );

    expect(screen.getByTestId("tool-status-loading")).toBeDefined();
    expect(screen.queryByTestId("tool-status-done")).toBeNull();
  });

  test("renders the file_manager rename label", () => {
    render(
      <ToolInvocation
        toolName="file_manager"
        state="result"
        args={{
          command: "rename",
          path: "/components/Old.jsx",
          new_path: "/components/New.jsx",
        }}
        result={{ success: true }}
      />,
    );

    expect(screen.getByText("Renaming Old.jsx to New.jsx")).toBeDefined();
    expect(screen.getByTestId("tool-status-done")).toBeDefined();
  });

  test("falls back to the prettified tool name for unknown tools", () => {
    render(
      <ToolInvocation
        toolName="future_tool"
        state="call"
        args={{}}
      />,
    );

    expect(screen.getByText("Future Tool")).toBeDefined();
  });
});
