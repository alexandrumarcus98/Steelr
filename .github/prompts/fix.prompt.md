---
name: fix
description: Diagnose and fix a bug with the smallest safe patch
---

Follow:
- [repo instructions](../copilot-instructions.md)
- [client rules](../instructions/client.instructions.md)
- [server rules](../instructions/server.instructions.md)

Rules:
- Identify likely root cause first.
- Patch the smallest relevant area.
- Avoid broad cleanup.
- Suggest one verification step.

Issue: ${input:bug}
