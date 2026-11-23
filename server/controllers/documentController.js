import mongoose from "mongoose";
import Document from "../models/Document.js";
import Activity from "../models/Activity.js";
import User from "../models/User.js";
import { transition } from "../automata/documentDFA.js";
import { canAccess } from "../utils/access.js";

const safeDoc = doc => ({
  id: doc._id, title: doc.title, content: doc.content, owner: doc.owner,
  collaborators: doc.collaborators, state: doc.state, lockedBy: doc.lockedBy,
  version: doc.version, updatedAt: doc.updatedAt
});

export async function listDocuments(req, res) {
  const docs = await Document.find({
    $or: [{ owner: req.user._id }, { collaborators: req.user._id }]
  }).sort({ updatedAt: -1 });
  res.json({ documents: docs.map(safeDoc) });
}

export async function createDocument(req, res) {
  const title = String(req.body.title || "").trim();
  if (!/^[a-zA-Z0-9 _-]{3,100}$/.test(title)) {
    return res.status(400).json({ message: "Title must be 3–100 characters and use letters, numbers, spaces, _ or -" });
  }
  const doc = await Document.create({ title, owner: req.user._id, state: "VIEWING" });
  await Activity.create({ document: doc._id, user: req.user._id, action: "CREATE", toState: "VIEWING" });
  res.status(201).json({ document: safeDoc(doc) });
}

export async function getDocument(req, res) {
  const doc = await Document.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Document not found" });
  if (!canAccess(doc, req.user._id)) return res.status(403).json({ message: "No access to this document" });
  res.json({ document: safeDoc(doc) });
}

export async function updateDocument(req, res) {
  const doc = await Document.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Document not found" });
  if (!canAccess(doc, req.user._id)) return res.status(403).json({ message: "No access to this document" });
  if (doc.lockedBy && String(doc.lockedBy) !== String(req.user._id)) return res.status(423).json({ message: "Document is locked by another user" });
  const expectedVersion = Number(req.body.version);
  if (!Number.isInteger(expectedVersion) || expectedVersion !== doc.version) {
    return res.status(409).json({ message: "Version conflict. Reload the latest document before saving.", currentVersion: doc.version });
  }
  const content = String(req.body.content ?? "");
  if (content.length > 200000) return res.status(413).json({ message: "Document is too large (maximum 200,000 characters)" });
  doc.content = content;
  if (req.body.title !== undefined) {
    const title = String(req.body.title).trim();
    if (!/^[a-zA-Z0-9 _-]{3,100}$/.test(title)) return res.status(400).json({ message: "Invalid document title" });
    doc.title = title;
  }
  doc.version += 1;
  doc.state = "SAVED";
  await doc.save();
  await Activity.create({ document: doc._id, user: req.user._id, action: "SAVE", fromState: "EDITING", toState: "SAVED" });
  req.app.get("io").to(String(doc._id)).emit("document:changed", { document: safeDoc(doc), changedBy: req.user.name });
  res.json({ document: safeDoc(doc), message: "Document saved" });
}

export async function deleteDocument(req, res) {
  const doc = await Document.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Document not found" });
  if (String(doc.owner) !== String(req.user._id)) return res.status(403).json({ message: "Only the owner can delete this document" });
  await Activity.deleteMany({ document: doc._id });
  await doc.deleteOne();
  req.app.get("io").to(String(req.params.id)).emit("document:deleted");
  res.json({ message: "Document deleted" });
}

export async function transitionDocument(req, res) {
  const doc = await Document.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Document not found" });
  if (!canAccess(doc, req.user._id)) return res.status(403).json({ message: "No access to this document" });
  const action = String(req.body.action || "");
  if (action === "LOCK" && String(doc.owner) !== String(req.user._id)) {
    return res.status(403).json({ message: "Only the owner can lock this document" });
  }
  if (action === "UNLOCK" && String(doc.lockedBy) !== String(req.user._id) && String(doc.owner) !== String(req.user._id)) {
    return res.status(403).json({ message: "Only the lock holder or owner can unlock this document" });
  }
  if (doc.lockedBy && String(doc.lockedBy) !== String(req.user._id) && action !== "UNLOCK") {
    return res.status(423).json({ message: "Document is locked by another user" });
  }
  const result = transition(doc.state, action);
  if (!result.accepted) return res.status(400).json({ accepted: false, state: doc.state, message: result.message });
  const previous = doc.state;
  doc.state = result.state;
  if (action === "LOCK") doc.lockedBy = req.user._id;
  if (action === "UNLOCK") doc.lockedBy = null;
  await doc.save();
  await Activity.create({ document: doc._id, user: req.user._id, action, fromState: previous, toState: doc.state });
  const payload = { state: doc.state, action, accepted: true, lockedBy: doc.lockedBy };
  req.app.get("io").to(String(doc._id)).emit("document:state", payload);
  res.json(payload);
}

export async function shareDocument(req, res) {
  const doc = await Document.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Document not found" });
  if (String(doc.owner) !== String(req.user._id)) return res.status(403).json({ message: "Only the owner can share this document" });
  const email = String(req.body.email || "").trim().toLowerCase();
  const person = await User.findOne({ email });
  if (!person) return res.status(404).json({ message: "No registered user found with that email" });
  if (String(person._id) === String(req.user._id)) return res.status(400).json({ message: "You already own this document" });
  if (!doc.collaborators.some(id => String(id) === String(person._id))) {
    doc.collaborators.push(person._id);
    await doc.save();
  }
  res.json({ message: `${person.name} added as a collaborator`, document: safeDoc(doc) });
}

export async function listActivities(req, res) {
  const doc = await Document.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Document not found" });
  if (!canAccess(doc, req.user._id)) return res.status(403).json({ message: "No access to this document" });
  const activities = await Activity.find({ document: doc._id }).populate("user", "name email").sort({ createdAt: -1 }).limit(100);
  res.json({ activities });
}
