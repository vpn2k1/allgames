---
name: demo-crud
description: Complete create/read/update/delete and persistence feature changes for this demo game.
---

# Demo CRUD for BUG BOMB

For any gameplay data added (level progress, characters, unlocks, purchases, profiles):

1. **Spec**: define fields, defaults, ownership, input constraints, and lifecycle. Create an acceptance ID in `docs/features.md`.
2. **Plan**: map storage keys/schema, UI actions, and migration/backward compatibility.
3. **Code**: implement the whole operation path, not just a visible button. Use local SharedPreferencesAsync only for small settings/progress; choose structured storage for inventory.
4. **Review**: check invalid IDs, duplicates, concurrency, missing files, multiple sessions, and data loss after restart.
5. **Test**: write tests for create → read → update → read → delete when applicable, and reopening the app. Update `docs/verification.md` with real test output.

Source developer skill concept: `skills://plugins/xuong-app-demo/demo-crud/skill.md`.
Use `$demo-crud` in future developer sessions to apply the workflow.
See `references/game-data.md` and `references/sources.md`.
