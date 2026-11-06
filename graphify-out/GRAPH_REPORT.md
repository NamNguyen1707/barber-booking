# Graph Report - barber-booking  (2026-11-03)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 295 nodes · 618 edges · 10 communities (8 shown, 2 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 77 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d306e620`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 9

## God Nodes (most connected - your core abstractions)
1. `query()` - 41 edges
2. `AppError` - 37 edges
3. `parseId()` - 19 edges
4. `useAuth()` - 15 edges
5. `parseDate()` - 12 edges
6. `pick()` - 12 edges
7. `parseBookingInput()` - 10 edges
8. `App()` - 10 edges
9. `react-router-dom` - 10 edges
10. `homeFor()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `bcryptjs@^3.0.2` --declares--> `bcryptjs`  [EXTRACTED]
  server/package.json → package.json
- `jsonwebtoken@^9.0.2` --declares--> `jsonwebtoken`  [EXTRACTED]
  server/package.json → package.json
- `createBarber()` --calls--> `AppError`  [EXTRACTED]
  server/src/services/admin.service.js → server/src/services/app-error.js
- `login()` --calls--> `AppError`  [EXTRACTED]
  server/src/services/auth.service.js → server/src/services/app-error.js
- `loginWithProfile()` --calls--> `AppError`  [EXTRACTED]
  server/src/services/auth.service.js → server/src/services/app-error.js

## Import Cycles
- None detected.

## Communities (10 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.12
Nodes (39): bcrypt, createBarber(), createService(), LOAI_DV, setBarberStatus(), setServiceStatus(), TT_THO, updateBarber() (+31 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (41): getPool(), mysql, query(), withTransaction(), countOpenBookings(), createBarber(), createService(), emailExists() (+33 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (39): dependencies, axios@^1.21.0, react@^19.3.1, react-dom@^19.3.1, react-router-dom@^7.18.5, tailwindcss@^4.3.3, @tailwindcss/vite@^4.3.3, devDependencies (+31 more)

### Community 3 - "Community 3"
Cohesion: 0.15
Nodes (26): api, errMsg(), TOKEN_KEY, USER_KEY, App(), GoogleButton(), loadScript(), ProtectedRoute() (+18 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (31): dependencies, bcryptjs@^3.0.3, jsonwebtoken@^9.0.3, bcryptjs, jsonwebtoken, cors, dotenv, express (+23 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (10): ROLES, jwt, requireRole(), verifyToken(), router, router, router, router (+2 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (11): bcrypt, crypto, googleLogin(), jwt, login(), loginWithProfile(), { OAuth2Client }, register() (+3 more)

### Community 7 - "Community 7"
Cohesion: 0.20
Nodes (7): FILE, force, fs, mysql, parseStatements(), path, stripLineComment()

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `query()` connect `Community 1` to `Community 4`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.11673469387755102 - nodes in this community are weakly interconnected._
- **Why does `mysql2` connect `Community 4` to `Community 1`, `Community 7`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08418367346938775 - nodes in this community are weakly interconnected._
- **Why does `AppError` connect `Community 0` to `Community 6`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06968641114982578 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.0773109243697479 - nodes in this community are weakly interconnected._