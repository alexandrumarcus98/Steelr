---
name: test
description: Add or update tests that match existing project patterns
argument-hint: describe the behavior or file to test
agent: ask
---

Create or update tests following:
- [repo instructions](../copilot-instructions.md)
- [client rules](../instructions/client.instructions.md)
- [server rules](../instructions/server.instructions.md)

Rules:
- Match the existing test style and tooling in the relevant app.
- Test behavior, not implementation details.
- Keep tests focused and readable.
- Add coverage for loading, error, and empty states where relevant.
- For server code, cover validation, service behavior, and response behavior where relevant.

Return:
1. Changed test files
2. Test code
3. Brief explanation of covered cases

Task: ${input:test_task}
