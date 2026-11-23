# Real-Time Collaborative Document Editing System Using Finite Automata

## Abstract
The Real-Time Collaborative Document Editing System Using Finite Automata is a web application that enables students to create, share and edit academic documents. The application uses MongoDB, Express.js, React.js and Node.js. Socket.IO provides real-time communication between authorized collaborators. Computer Networks concepts are demonstrated through client-server architecture, HTTP REST APIs, TCP-based communication and WebSocket connections. Formal Languages and Automata Theory concepts are applied through regular-expression validation and a backend deterministic finite automaton (DFA) that models document viewing, editing, saving and locking states.

## 1. Introduction
Group assignments require students to work on common documents. Separate copies and manual sharing can cause outdated versions and conflicting edits. CollabSpace provides a shared web workspace with live updates, persistence and controlled document operations.

## 2. Problem Statement
Students collaborating on academic assignments need a shared document system that supports simultaneous access, reliable saving and controlled editing. The system must prevent unauthorized access and invalid operations such as editing a document locked by another user. This project implements a MERN web application with Socket.IO collaboration and a DFA-based document lifecycle model.

## 3. Objectives
1. Build a responsive web application using React.
2. Develop backend REST services using Node.js and Express.
3. Store users, documents and activities in MongoDB.
4. Support authenticated real-time collaboration.
5. Implement document locking and version checks.
6. Use a DFA to validate lifecycle transitions.
7. Apply regular expressions to validate user input.
8. Demonstrate HTTP, TCP/IP and WebSocket communication.

## 4. Existing System
Traditional file sharing may involve manual copies, email attachments or separate editing sessions. This can lead to version confusion and overwrite risks.

## 5. Proposed System
CollabSpace provides a central document store, authenticated collaborators, live document broadcasts, version checks, locking, activity history and DFA-validated state transitions.

## 6. Requirements
### Functional
- Register and log in.
- Create, read, update and delete documents.
- Share documents with registered users.
- Synchronize changes through Socket.IO.
- Lock and unlock documents.
- View activity and DFA state.

### Non-functional
- Responsive interface.
- Maintainable modular code.
- Authenticated protected endpoints.
- Persistent storage.
- Clear error feedback.
- Version conflict detection.

## 7. Software and Hardware Requirements
Software: Windows/Linux/macOS, Node.js, npm, React, Express, MongoDB, MongoDB Compass, VS Code, browser, Git and Postman.
Hardware: modern dual-core computer, 8 GB RAM recommended, sufficient storage and network access.

## 8. Architecture
See `architecture.md`. The system has a React presentation layer, Express/Socket.IO application layer and MongoDB data layer.

## 9. Database Design
- Users: name, email, password hash.
- Documents: title, content, owner, collaborators, state, lock holder, version.
- Activities: document, user, action, from-state, to-state and timestamp.

## 10. Implementation
The frontend uses React components and React Router. The backend uses Express controllers, routes and authentication middleware. Mongoose connects the application to MongoDB. Socket.IO joins authorized users to document rooms. The backend DFA validates state transitions.

## 11. Computer Networks Integration
The browser communicates with the server using HTTP REST methods. Socket.IO provides real-time updates over WebSocket when available, with fallback transport support. These application protocols use TCP/IP services. See `cn-integration.md`.

## 12. FLAT Integration
The DFA is defined by states, alphabet, transition function, initial state and accepting states. Undefined transitions are rejected. Regular expressions validate email and document title patterns. See `dfa.md`.

## 13. Testing
Execute all cases in `test-cases.md`. Capture genuine screenshots and record actual results. Two-browser collaboration and database persistence are important demonstrations.

## 14. Conclusion
CollabSpace combines full-stack development, computer networking and automata theory in a practical student collaboration application. It demonstrates persistent CRUD operations, authenticated live communication, version checking and formal state-transition validation.

## 15. Future Enhancements
- Operational Transformation or CRDT for robust concurrent editing.
- Rich-text editing and cursor presence.
- Document version history and restore.
- PDF export and comments.
- Deployment with HTTPS/WSS and production monitoring.

## Appendix
Include API documentation, source code, genuine output screenshots and completed test results.
