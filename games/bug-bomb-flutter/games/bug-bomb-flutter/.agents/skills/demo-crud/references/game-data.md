# Game save data guide

Use versioned keys such as `saveVersion`, `unlocked`, `stars_<level>`.
For game profile records, include unique stable ID, level, display name, timestamp, inventory arrays, and progression.
CRUD invariants: don't lose unlocked levels when stars decrease; never accept negative score or unknown level IDs; migrations should preserve best achieved progress.
Use an atomic structured store before adding multiple save slots or purchases. Test reinstall vs ordinary app restart separately.
