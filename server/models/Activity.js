import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  document: { type: mongoose.Schema.Types.ObjectId, ref: "Document", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true },
  fromState: String,
  toState: String,
  details: String
}, { timestamps: true });

export default mongoose.model("Activity", activitySchema);
