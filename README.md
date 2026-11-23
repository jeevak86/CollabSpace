# CollabSpace
**Real-Time Collaborative Document Editing System Using Finite Automata**

A college-level MERN project starter implementing:
- React + Vite frontend
- Node.js + Express REST API
- MongoDB + Mongoose persistence
- JWT authentication with bcrypt password hashing
- Socket.IO document rooms and live document updates
- Backend DFA validation for document state transitions
- Activity history and connection status

> This is a runnable MVP/starter, not a claim of production-grade Google Docs functionality. The editor synchronizes whole-document content with optimistic version checks. It does not implement Operational Transformation (OT) or CRDT conflict-free merging.

## Requirements
- Node.js 20 or newer (Node.js 18+ may also work)
- npm
- MongoDB Community Server or MongoDB Atlas
- Git (optional)

## Folder structure
```text
CollabSpace/
├── client/                 # React frontend
├── server/                 # Express, Socket.IO, DFA, MongoDB
├── database/               # Sample data guidance
├── docs/                   # Academic documentation and diagrams
├── screenshots/            # Add genuine screenshots after running
└── README.md
```

## 1. Configure MongoDB
Start your local MongoDB service, or create a MongoDB Atlas database.
The default local URI is:
`mongodb://127.0.0.1:27017/collabspace`

## 2. Configure backend
Open a terminal:
```bash
cd server
npm install
```
Copy `.env.example` to `.env` and edit values:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/collabspace
JWT_SECRET=replace_this_with_a_long_random_secret
CLIENT_ORIGIN=http://localhost:5173
```
Start the backend:
```bash
npm run dev
```
Expected message: `CollabSpace API listening on port 5000` and `MongoDB connected`.

## 3. Configure frontend
Open a second terminal:
```bash
cd client
npm install
npm run dev
```
Open the Vite URL printed in the terminal (normally `http://localhost:5173`).

## 4. Test collaboration
1. Register two separate accounts in two browser profiles (or one normal and one incognito window).
2. Log in as the first student and create a document.
3. Add the second student as a collaborator using their email from the Share panel.
4. Open the same document in both browsers.
5. Edit and save. The other browser receives a Socket.IO update.
6. Try Lock and Unlock. The backend DFA validates each state transition.
7. Refresh the page and confirm saved content is loaded from MongoDB.

## 5. REST API
All protected endpoints require:
`Authorization: Bearer <JWT>`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Server health |
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| GET | `/api/documents` | List accessible documents |
| POST | `/api/documents` | Create |
| GET | `/api/documents/:id` | Read |
| PUT | `/api/documents/:id` | Update content/title (version checked) |
| DELETE | `/api/documents/:id` | Delete owned document |
| POST | `/api/documents/:id/share` | Add collaborator by email |
| POST | `/api/documents/:id/transition` | Apply DFA operation |
| GET | `/api/documents/:id/activities` | Activity history |

## 6. Socket.IO events
Client -> server:
- `document:join` `{ documentId }`
- `document:edit` `{ documentId, content, version }`
- `document:typing` `{ documentId, isTyping }`

Server -> client:
- `document:joined`
- `document:changed`
- `document:typing`
- `document:error`
- `document:state`

Socket events are authenticated with the JWT and checked for document access. The server saves accepted edits to MongoDB and broadcasts the resulting version.

## 7. DFA used by the application
States: `VIEWING`, `EDITING`, `SAVING`, `SAVED`, `LOCKED`
Alphabet: `EDIT`, `SAVE`, `SAVE_SUCCESS`, `SAVE_FAILURE`, `LOCK`, `UNLOCK`, `CLOSE`, `CANCEL`
Initial state: `VIEWING`
Accepting/stable states: `VIEWING`, `SAVED`, `LOCKED`

The transition table and limitations are in `docs/dfa.md`. The DFA is enforced on the backend; the frontend visualizer is an explanatory view of the server's current state.

## 8. Academic deliverables
See:
- `docs/project-report.md`
- `docs/architecture.md`
- `docs/use-case.md`
- `docs/dfd.md`
- `docs/dfa.md`
- `docs/cn-integration.md`
- `docs/api-documentation.md`
- `docs/test-cases.md`

The `screenshots/` folder contains instructions only. Capture genuine screenshots from your running application; do not submit placeholder images as test evidence.

## 9. Important limitations and next improvements
- Whole-document synchronization is suitable for a classroom MVP but simultaneous overlapping edits can conflict. Version checks reject stale updates rather than silently overwriting newer content.
- No rich-text formatting, cursor-position synchronization, or OT/CRDT merge algorithm.
- Use HTTPS/WSS and a strong secret before deployment.
- Add rate limiting, email verification, password reset, stronger authorization tests and production logging before public deployment.
