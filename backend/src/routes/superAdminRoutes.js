import express from "express";
import { auth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import {
  createUniversity,
  createUniversityAdmin,
  createSuperAdmin,
  getUniversities,
  getUniversityAdmins,
  getSuperAdmins,
  deleteUniversity,
  deleteUniversityAdmin,
  deleteSuperAdmin,
} from "../controllers/superAdminController.js";
import upload from "../utils/upload.js";

const router = express.Router();

// University routes
router.get("/universities", auth, requireRole("super"), getUniversities);
router.post(
  "/universities",
  auth,
  requireRole("super"),
  upload.single("logo"),
  createUniversity
);
router.delete(
  "/universities/:id",
  auth,
  requireRole("super"),
  deleteUniversity
);

// University admin routes
router.post(
  "/university-admins",
  auth,
  requireRole("super"),
  createUniversityAdmin
);
router.get('/university-admins', auth, requireRole('super',"university"), getUniversityAdmins);
router.delete(
  "/university-admins/:id",
  auth,
  requireRole("super"),
  deleteUniversityAdmin
);

// Super admin routes (NEW)
router.post(
  "/super-admins", 
  auth, 
  requireRole("super"), 
  createSuperAdmin
);
router.get(
  "/super-admins", 
  auth, 
  requireRole("super"), 
  getSuperAdmins
);
router.delete(
  "/super-admins/:id", 
  auth, 
  requireRole("super"), 
  deleteSuperAdmin
);

export default router;