import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "@/hooks/use-auth";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/actions", () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("@/lib/anon-work-tracker", () => ({
  getAnonWorkData: vi.fn(),
  clearAnonWork: vi.fn(),
}));

vi.mock("@/actions/get-projects", () => ({
  getProjects: vi.fn(),
}));

vi.mock("@/actions/create-project", () => ({
  createProject: vi.fn(),
}));

import { signIn as signInAction, signUp as signUpAction } from "@/actions";
import { getAnonWorkData, clearAnonWork } from "@/lib/anon-work-tracker";
import { getProjects } from "@/actions/get-projects";
import { createProject } from "@/actions/create-project";

const mockSignIn = vi.mocked(signInAction);
const mockSignUp = vi.mocked(signUpAction);
const mockGetAnonWorkData = vi.mocked(getAnonWorkData);
const mockClearAnonWork = vi.mocked(clearAnonWork);
const mockGetProjects = vi.mocked(getProjects);
const mockCreateProject = vi.mocked(createProject);

beforeEach(() => {
  vi.clearAllMocks();
  mockGetAnonWorkData.mockReturnValue(null);
  mockGetProjects.mockResolvedValue([]);
  mockCreateProject.mockResolvedValue({ id: "new-project-id" } as any);
});

describe("useAuth", () => {
  describe("initial state", () => {
    test("isLoading starts as false", () => {
      const { result } = renderHook(() => useAuth());
      expect(result.current.isLoading).toBe(false);
    });

    test("exposes signIn, signUp, and isLoading", () => {
      const { result } = renderHook(() => useAuth());
      expect(typeof result.current.signIn).toBe("function");
      expect(typeof result.current.signUp).toBe("function");
      expect(typeof result.current.isLoading).toBe("boolean");
    });
  });

  describe("signIn", () => {
    test("calls signInAction with provided credentials", async () => {
      mockSignIn.mockResolvedValue({ success: true });
      mockGetProjects.mockResolvedValue([{ id: "proj-1" } as any]);

      const { result } = renderHook(() => useAuth());
      await act(() => result.current.signIn("user@test.com", "password123"));

      expect(mockSignIn).toHaveBeenCalledWith("user@test.com", "password123");
    });

    test("sets isLoading to true during sign-in and resets to false after", async () => {
      let resolveSignIn!: (v: any) => void;
      mockSignIn.mockReturnValue(
        new Promise((res) => { resolveSignIn = res; })
      );
      mockGetProjects.mockResolvedValue([]);

      const { result } = renderHook(() => useAuth());

      act(() => { result.current.signIn("user@test.com", "pass"); });
      expect(result.current.isLoading).toBe(true);

      await act(async () => { resolveSignIn({ success: true }); });
      expect(result.current.isLoading).toBe(false);
    });

    test("returns the result from signInAction", async () => {
      mockSignIn.mockResolvedValue({ success: false, error: "Invalid credentials" });

      const { result } = renderHook(() => useAuth());
      let returnValue: any;
      await act(async () => {
        returnValue = await result.current.signIn("user@test.com", "wrong");
      });

      expect(returnValue).toEqual({ success: false, error: "Invalid credentials" });
    });

    test("resets isLoading to false even when signInAction throws", async () => {
      mockSignIn.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useAuth());
      await act(async () => {
        await result.current.signIn("user@test.com", "pass").catch(() => {});
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("does not call handlePostSignIn when sign-in fails", async () => {
      mockSignIn.mockResolvedValue({ success: false, error: "Invalid credentials" });

      const { result } = renderHook(() => useAuth());
      await act(() => result.current.signIn("user@test.com", "wrong"));

      expect(mockGetProjects).not.toHaveBeenCalled();
      expect(mockCreateProject).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("signUp", () => {
    test("calls signUpAction with provided credentials", async () => {
      mockSignUp.mockResolvedValue({ success: true });
      mockGetProjects.mockResolvedValue([{ id: "proj-1" } as any]);

      const { result } = renderHook(() => useAuth());
      await act(() => result.current.signUp("new@test.com", "password123"));

      expect(mockSignUp).toHaveBeenCalledWith("new@test.com", "password123");
    });

    test("sets isLoading to true during sign-up and resets to false after", async () => {
      let resolveSignUp!: (v: any) => void;
      mockSignUp.mockReturnValue(
        new Promise((res) => { resolveSignUp = res; })
      );
      mockGetProjects.mockResolvedValue([]);

      const { result } = renderHook(() => useAuth());

      act(() => { result.current.signUp("new@test.com", "pass"); });
      expect(result.current.isLoading).toBe(true);

      await act(async () => { resolveSignUp({ success: true }); });
      expect(result.current.isLoading).toBe(false);
    });

    test("returns the result from signUpAction", async () => {
      mockSignUp.mockResolvedValue({ success: false, error: "Email already registered" });

      const { result } = renderHook(() => useAuth());
      let returnValue: any;
      await act(async () => {
        returnValue = await result.current.signUp("existing@test.com", "pass");
      });

      expect(returnValue).toEqual({ success: false, error: "Email already registered" });
    });

    test("resets isLoading to false even when signUpAction throws", async () => {
      mockSignUp.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useAuth());
      await act(async () => {
        await result.current.signUp("user@test.com", "pass").catch(() => {});
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("does not call handlePostSignIn when sign-up fails", async () => {
      mockSignUp.mockResolvedValue({ success: false, error: "Email already registered" });

      const { result } = renderHook(() => useAuth());
      await act(() => result.current.signUp("existing@test.com", "pass"));

      expect(mockGetProjects).not.toHaveBeenCalled();
      expect(mockCreateProject).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("handlePostSignIn — anonymous work exists", () => {
    test("creates a project from anon work and redirects to it", async () => {
      const anonWork = {
        messages: [{ role: "user", content: "hello" }],
        fileSystemData: { "/App.jsx": "export default () => <div />" },
      };
      mockGetAnonWorkData.mockReturnValue(anonWork);
      mockSignIn.mockResolvedValue({ success: true });
      mockCreateProject.mockResolvedValue({ id: "anon-project-id" } as any);

      const { result } = renderHook(() => useAuth());
      await act(() => result.current.signIn("user@test.com", "pass"));

      expect(mockCreateProject).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: anonWork.messages,
          data: anonWork.fileSystemData,
        })
      );
      expect(mockClearAnonWork).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/anon-project-id");
    });

    test("does not call getProjects when anon work exists", async () => {
      mockGetAnonWorkData.mockReturnValue({
        messages: [{ role: "user", content: "hello" }],
        fileSystemData: {},
      });
      mockSignIn.mockResolvedValue({ success: true });
      mockCreateProject.mockResolvedValue({ id: "anon-project-id" } as any);

      const { result } = renderHook(() => useAuth());
      await act(() => result.current.signIn("user@test.com", "pass"));

      expect(mockGetProjects).not.toHaveBeenCalled();
    });

    test("project name includes a time string", async () => {
      mockGetAnonWorkData.mockReturnValue({
        messages: [{ role: "user", content: "make a button" }],
        fileSystemData: {},
      });
      mockSignIn.mockResolvedValue({ success: true });
      mockCreateProject.mockResolvedValue({ id: "p" } as any);

      const { result } = renderHook(() => useAuth());
      await act(() => result.current.signIn("user@test.com", "pass"));

      const callArgs = mockCreateProject.mock.calls[0][0];
      expect(callArgs.name).toMatch(/^Design from /);
    });
  });

  describe("handlePostSignIn — no anonymous work, existing projects", () => {
    test("redirects to the most recent project (first in list)", async () => {
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([
        { id: "recent-project" } as any,
        { id: "older-project" } as any,
      ]);
      mockSignIn.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useAuth());
      await act(() => result.current.signIn("user@test.com", "pass"));

      expect(mockPush).toHaveBeenCalledWith("/recent-project");
      expect(mockCreateProject).not.toHaveBeenCalled();
    });
  });

  describe("handlePostSignIn — no anonymous work, no existing projects", () => {
    test("creates a new project and redirects to it", async () => {
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([]);
      mockSignIn.mockResolvedValue({ success: true });
      mockCreateProject.mockResolvedValue({ id: "brand-new-id" } as any);

      const { result } = renderHook(() => useAuth());
      await act(() => result.current.signIn("user@test.com", "pass"));

      expect(mockCreateProject).toHaveBeenCalledWith(
        expect.objectContaining({ messages: [], data: {} })
      );
      expect(mockPush).toHaveBeenCalledWith("/brand-new-id");
    });

    test("new project name matches expected pattern", async () => {
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([]);
      mockSignIn.mockResolvedValue({ success: true });
      mockCreateProject.mockResolvedValue({ id: "p" } as any);

      const { result } = renderHook(() => useAuth());
      await act(() => result.current.signIn("user@test.com", "pass"));

      const callArgs = mockCreateProject.mock.calls[0][0];
      expect(callArgs.name).toMatch(/^New Design #\d+$/);
    });
  });

  describe("handlePostSignIn — anon work with empty messages", () => {
    test("skips anon work branch when messages array is empty", async () => {
      mockGetAnonWorkData.mockReturnValue({ messages: [], fileSystemData: {} });
      mockGetProjects.mockResolvedValue([{ id: "existing-proj" } as any]);
      mockSignIn.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useAuth());
      await act(() => result.current.signIn("user@test.com", "pass"));

      expect(mockCreateProject).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/existing-proj");
    });
  });

  describe("signUp triggers the same post-sign-in flow", () => {
    test("uses anon work after successful sign-up", async () => {
      const anonWork = {
        messages: [{ role: "user", content: "make a card" }],
        fileSystemData: {},
      };
      mockGetAnonWorkData.mockReturnValue(anonWork);
      mockSignUp.mockResolvedValue({ success: true });
      mockCreateProject.mockResolvedValue({ id: "signup-proj" } as any);

      const { result } = renderHook(() => useAuth());
      await act(() => result.current.signUp("new@test.com", "pass"));

      expect(mockCreateProject).toHaveBeenCalled();
      expect(mockClearAnonWork).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/signup-proj");
    });

    test("redirects to new project when no anon work and no existing projects after sign-up", async () => {
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([]);
      mockSignUp.mockResolvedValue({ success: true });
      mockCreateProject.mockResolvedValue({ id: "fresh-proj" } as any);

      const { result } = renderHook(() => useAuth());
      await act(() => result.current.signUp("new@test.com", "pass"));

      expect(mockPush).toHaveBeenCalledWith("/fresh-proj");
    });
  });
});
