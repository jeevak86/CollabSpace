# Computer Networks Integration

## Implemented concepts
- Client-server architecture: React browser is the client; Node/Express is the server.
- HTTP: JSON REST endpoints use GET, POST, PUT and DELETE.
- TCP/IP: HTTP and Socket.IO connections are carried over TCP in the normal deployment.
- Application protocols: HTTP REST and Socket.IO/WebSocket communication.
- Network status: the editor reports Socket.IO connected/disconnected status.
- Real-time communication: authenticated Socket.IO connections join authorized document rooms and receive broadcasts.

## OSI mapping
| OSI layer | Example in this application |
|---|---|
| 7 Application | HTTP, REST, Socket.IO events |
| 6 Presentation | JSON serialization and UTF-8 text |
| 5 Session | Socket.IO connection and document room membership |
| 4 Transport | TCP |
| 3 Network | IP addressing and routing |
| 2 Data Link | Ethernet/Wi-Fi frames |
| 1 Physical | Copper, fiber or radio transmission |

The lower layers are provided by the operating system and network hardware; the application uses their services rather than implementing Ethernet framing or IP routing itself.

## Practical demonstration
1. Open the same shared document in two browser profiles.
2. Observe Live/Offline status.
3. Edit from one browser and observe the second browser update.
4. Inspect browser DevTools Network tab to observe HTTP and WebSocket traffic.
5. Stop the backend temporarily and observe disconnection.
