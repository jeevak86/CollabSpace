import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Document from "../models/Document.js";
import { canAccess } from "../utils/access.js";

export function configureSockets(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.userId).select("_id name email");
      if (!user) return next(new Error("User not found"));
      socket.user = user;
      next();
    } catch {
      next(new Error("Invalid socket token"));
    }
  });

  io.on("connection", socket => {
    socket.on("document:join", async ({ documentId } = {}) => {
      try {
        const doc = await Document.findById(documentId);
        if (!doc || !canAccess(doc, socket.user._id)) {
          socket.emit("document:error", { message: "Document not found or access denied" });
          return;
        }
        socket.join(String(doc._id));
        socket.emit("document:joined", { documentId: String(doc._id), state: doc.state, version: doc.version });
        socket.to(String(doc._id)).emit("user:joined", { user: socket.user.name });
      } catch {
        socket.emit("document:error", { message: "Could not join document room" });
      }
    });

    socket.on("document:edit", async ({ documentId, content, version } = {}) => {
      try {
        const doc = await Document.findById(documentId);
        if (!doc || !canAccess(doc, socket.user._id)) throw new Error("Access denied");
        if (!socket.rooms.has(String(doc._id))) throw new Error("Join the document room first");
        if (doc.lockedBy && String(doc.lockedBy) !== String(socket.user._id)) throw new Error("Document is locked");
        if (Number(version) !== doc.version) throw new Error("Version conflict; reload the document");
        if (typeof content !== "string" || content.length > 200000) throw new Error("Invalid document content");
        doc.content = content;
        doc.version += 1;
        doc.state = "SAVED";
        await doc.save();
        io.to(String(doc._id)).emit("document:changed", {
          document: {
            id: doc._id, title: doc.title, content: doc.content, state: doc.state,
            version: doc.version, lockedBy: doc.lockedBy, updatedAt: doc.updatedAt
          },
          changedBy: socket.user.name
        });
      } catch (error) {
        socket.emit("document:error", { message: error.message || "Live update failed" });
      }
    });

    socket.on("document:typing", ({ documentId, isTyping } = {}) => {
      if (documentId && socket.rooms.has(String(documentId))) {
        socket.to(String(documentId)).emit("document:typing", { user: socket.user.name, isTyping: Boolean(isTyping) });
      }
    });

    socket.on("disconnect", () => {
      // Socket.IO automatically leaves all rooms on disconnect.
    });
  });
}
