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

- Read more files in your project
- Create a detailed implementation plan
- Show you exactly what it intends to do
- Wait for your approval before proceeding

This gives you the opportunity to review the plan and redirect Claude if it missed something important or didn't consider a particular scenario.

Tip: when reviewing the plan, you can press Ctrl+G to open it in your text editor. You can precise edits before approving the plan, and Claude will see the final version you submit.

**_Effort level: how hard Claude thinks_**

By default, Claude reasons through problems before answering. You'll see hints like "still thinking" while it works. If you want to see Claude's reasoning process, press Ctrl+O to expand the actual reasoning steps.

You can control is how Claude reasons through a problem by setting an effort level. Run /effort to see your current level and adjust it: low is faster and cheaper, max reasons longest on hard problems. The default depends on your model and plan — /effort shows you what yours is.

If you want to signal to Claude that it should do extra thinking on a single prompt, use the keyword ultrathink in your prompt. This signals to Claude that it should reason more on this turn, but doesn't adjust the session's effort level.

**_When to Use Planning vs Effort_**

These two features handle different types of complexity:

Planning Mode is best for:

- Tasks requiring broad understanding of your codebase
- Multi-step implementations
- Changes that affect multiple files or components

Adjusting to a higher effort level is best for:

- Complex logic problems
- Debugging difficult issues
- Algorithmic challenges

You can combine both modes for tasks that require both breadth and depth. Just keep in mind that both features consume additional tokens, so there's a cost consideration for using them.

**_Thinking Modes_**

![alt text](thinking_modes.png)

# Controlling context

When working with Claude on complex tasks, you'll often need to guide the conversation to keep it focused and productive. There are several techniques you can use to control the flow of your conversation and help Claude stay on track.

**_Interrupting Claude with Escape_**

Sometimes Claude starts heading in the wrong direction or tries to tackle too much at once. You can press the Escape key to stop Claude mid-response, allowing you to redirect the conversation.

This is particularly useful when you want Claude to focus on one specific task instead of trying to handle multiple things simultaneously. For example, if you ask Claude to write tests for multiple functions and it starts creating a comprehensive plan for all of them, you can interrupt and ask it to focus on just one function at a time.

**_Combining Escape with Memories_**

One of the most powerful applications of the escape technique is fixing repetitive errors. When Claude makes the same mistake repeatedly across different conversations, you can:

- Press Escape to stop the current response
- Run /memory (or edit CLAUDE.md directly) to add a note about the correct approach
- Continue the conversation with the corrected information

  This prevents Claude from making the same error in future conversations on your project.

**_Rewinding Conversations_**
During long conversations, you might accumulate context that becomes irrelevant or distracting. For instance, if Claude encounters an error and spends time debugging it, that back-and-forth discussion might not be useful for the next task.

You can rewind the conversation by pressing Escape twice or typing /rewind. This shows you all the messages you've sent, allowing you to jump back to an earlier point and continue from there. This technique helps you:

- Maintain valuable context (like Claude's understanding of your codebase)
- Remove distracting or irrelevant conversation history
- Keep Claude focused on the current task

**_Context Management Commands_**

Claude provides several commands to help manage conversation context effectively:

/compact
The /compact command summarizes your entire conversation history while preserving the key information Claude has learned. This is ideal when:

- Claude has gained valuable knowledge about your project
- You want to continue with related tasks
- The conversation has become long but contains important context

Use compact when Claude has learned a lot about the current task and you want to maintain that knowledge as it moves to the next related task.

/clear
The /clear command starts a new conversation with fresh context. This is most useful when:

- You're switching to a completely different, unrelated task
- The current conversation context might confuse Claude for the new task
- You want to start over without any previous context

You can still go back to the previous conversation later with /resume. The /clear command does not remove the conversation from your session history.

**_When to Use These Techniques_**
These conversation control techniques are particularly valuable during:

- Long-running conversations where context can become cluttered
- Task transitions where previous context might be distracting
- Situations where Claude repeatedly makes the same mistakes
- Complex projects where you need to maintain focus on specific components

By using escape, double-tap escape, /compact, and /clear strategically, you can keep Claude focused and productive throughout your development workflow. These aren't just convenience features—they're essential tools for maintaining effective AI-assisted development sessions.
