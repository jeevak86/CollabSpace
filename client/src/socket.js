import { io } from "socket.io-client";

let socket;
export function getSocket() {
  if (!socket) {
    socket = io("http://localhost:5000", {
      autoConnect: false,
      auth: { token: localStorage.getItem("collabspace_token") }
    });
  }
  socket.auth = { token: localStorage.getItem("collabspace_token") };
  return socket;
}
export function disconnectSocket() {
  if (socket) socket.disconnect();
  socket = undefined;
}
