# Adding Context

Always open Claude in the project for the first time and run the command "/init".

**_Adding Custom Instructions_**

You can customize how Claude behaves by adding instructions to your CLAUDE.md file. For example, if Claude is adding too many comments to code, you can address this by updating the file. Edit CLAUDE.md directly in your editor, or run /memory inside Claude Code to open the file. Add an instruction like Use comments sparingly. Only comment complex code.

Claude reads this file at the start of every conversation, so changes apply to your next message.

**_File Mentions with '@'_**

When you need Claude to look at specific files, use the @ symbol followed by the file path. This automatically includes that file's contents in your request to Claude.

For example, if you want to ask about your authentication system and you know the relevant files, you can type:

How does the auth system work? @auth

Claude will show you a list of auth-related files to choose from, then include the selected file in your conversation.

**_Referencing Files in CLAUDE.md_**

You can also mention files directly in your CLAUDE.md file using the same @ syntax. This is particularly useful for files that are relevant to many aspects of your project.

For example, if you have a database schema file that defines your data structure, you might add this to your CLAUDE.md:

The database schema is defined in the @prisma/schema.prisma file. Reference it anytime you need to understand the structure of data stored in the database.
When you mention a file this way, its contents are automatically included in every request, so Claude can answer questions about your data structure immediately without having to search for and read the schema file each time.

# Making Changes

When working with Claude in your development environment, you'll often need to make changes to existing projects. This guide covers practical techniques for implementing changes effectively, including visual communication with screenshots and leveraging Claude's advanced reasoning capabilities.

**_Using Screenshots for Precise Communication_**

One of the most effective ways to communicate with Claude is through screenshots. When you want to modify a specific part of your interface, taking a screenshot helps Claude understand exactly what you're referring to.

To paste a screenshot into Claude, use Ctrl+V (not Cmd+V on macOS). This keyboard shortcut is specifically designed for pasting screenshots into the chat interface. Once you've pasted the image, you can ask Claude to make specific changes to that area of your application.

**_Planning Mode_**

For more complex tasks that require extensive research across your codebase, you can enable Planning Mode. This feature makes Claude do thorough exploration of your project before implementing changes.

Enable Planning Mode by typing /plan or by pressing Shift + Tab twice (or once if you're already auto-accepting edits). In this mode, Claude will:

Read more files in your project
Create a detailed implementation plan
Show you exactly what it intends to do
Wait for your approval before proceeding
This gives you the opportunity to review the plan and redirect Claude if it missed something important or didn't consider a particular scenario.

Tip: when reviewing the plan, you can press Ctrl+G to open it in your text editor. You can precise edits before approving the plan, and Claude will see the final version you submit.

**_Effort level: how hard Claude thinks_**

By default, Claude reasons through problems before answering. You'll see hints like "still thinking" while it works. If you want to see Claude's reasoning process, press Ctrl+O to expand the actual reasoning steps.

You can control is how Claude reasons through a problem by setting an effort level. Run /effort to see your current level and adjust it: low is faster and cheaper, max reasons longest on hard problems. The default depends on your model and plan — /effort shows you what yours is.

If you want to signal to Claude that it should do extra thinking on a single prompt, use the keyword ultrathink in your prompt. This signals to Claude that it should reason more on this turn, but doesn't adjust the session's effort level.

**_When to Use Planning vs Effort_**

These two features handle different types of complexity:

Planning Mode is best for:

Tasks requiring broad understanding of your codebase
Multi-step implementations
Changes that affect multiple files or components
Adjusting to a higher effort level is best for:

Complex logic problems
Debugging difficult issues
Algorithmic challenges
You can combine both modes for tasks that require both breadth and depth. Just keep in mind that both features consume additional tokens, so there's a cost consideration for using them.

**_Thinking Modes_**

![alt text](thinking_modes.png)
