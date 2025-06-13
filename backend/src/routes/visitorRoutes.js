import express from "express";
import {
  getVisitors,
  deleteVisitor,
  createVisitor,
  getVisitorsByUniversity, 
  getInstituteVisitors
} from "../controllers/visitorController.js";
import { auth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
const router = express.Router();

// Public route for visitor registration
router.post("/", createVisitor);

// Protected routes
router.get("/", auth, requireRole("super", "university","institute"), getVisitors);
router.get("/university/:universityId", auth, requireRole("super", "university","institute"), getVisitorsByUniversity); 
// Add this new route at the top or after other GETs
router.get("/institute/:id", auth, requireRole("super", "university", "institute"), getInstituteVisitors);
// Add this route
router.delete("/:id", auth, deleteVisitor);

export default router;