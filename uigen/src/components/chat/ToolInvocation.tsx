"use client";

import { Loader2 } from "lucide-react";

export interface ToolInvocationProps {
  toolName: string;
  state: "partial-call" | "call" | "result";
  args?: unknown;
  result?: unknown;
}

export function getToolLabel(toolName: string, args: unknown): string {
  const path = readString(args, "path");
  const command = readString(args, "command");
  const filename = path ? basename(path) : null;

  if (toolName === "str_replace_editor") {
    if (!filename) return "Editing files";
    switch (command) {
      case "create":
        return `Creating ${filename}`;
      case "view":
        return `Viewing ${filename}`;
      case "undo_edit":
        return `Undoing edit in ${filename}`;
      case "str_replace":
      case "insert":
      default:
        return `Editing ${filename}`;
    }
  }

  if (toolName === "file_manager") {
    if (!filename) return prettifyToolName(toolName);
    if (command === "delete") return `Deleting ${filename}`;
    if (command === "rename") {
      const newPath = readString(args, "new_path");
      const newFilename = newPath ? basename(newPath) : null;
      return newFilename
        ? `Renaming ${filename} to ${newFilename}`
        : `Renaming ${filename}`;
    }
    return prettifyToolName(toolName);
  }

  return prettifyToolName(toolName);
}

function readString(args: unknown, key: string): string | null {
  if (!args || typeof args !== "object") return null;
  const value = (args as Record<string, unknown>)[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function basename(path: string): string {
  const trimmed = path.replace(/\/+$/, "");
  const idx = trimmed.lastIndexOf("/");
  if (idx === -1) return trimmed || path;
  const tail = trimmed.slice(idx + 1);
  return tail || trimmed || path;
}

function prettifyToolName(toolName: string): string {
  return toolName
    .split(/[_-]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function ToolInvocation({
  toolName,
  state,
  args,
  result,
}: ToolInvocationProps) {
  const label = getToolLabel(toolName, args);
  const done = state === "result" && Boolean(result);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {done ? (
        <div
          data-testid="tool-status-done"
          className="w-2 h-2 rounded-full bg-emerald-500"
        />
      ) : (
        <Loader2
          data-testid="tool-status-loading"
          className="w-3 h-3 animate-spin text-blue-600"
        />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
