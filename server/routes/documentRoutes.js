import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  listDocuments, createDocument, getDocument, updateDocument,
  deleteDocument, transitionDocument, shareDocument, listActivities
} from "../controllers/documentController.js";

const router = Router();
router.use(requireAuth);
router.get("/", listDocuments);
router.post("/", createDocument);
router.get("/:id", getDocument);
router.put("/:id", updateDocument);
router.delete("/:id", deleteDocument);
router.post("/:id/transition", transitionDocument);
router.post("/:id/share", shareDocument);
router.get("/:id/activities", listActivities);
export default router;
