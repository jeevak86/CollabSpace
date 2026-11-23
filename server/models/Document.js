import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  content: { type: String, default: "", maxlength: 200000 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  state: { type: String, enum: ["VIEWING", "EDITING", "SAVING", "SAVED", "LOCKED"], default: "VIEWING" },
  lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  version: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("Document", documentSchema);
