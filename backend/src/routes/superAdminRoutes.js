import express from "express";
import { auth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import {
  createUniversity,
  createUniversityAdmin,
  getUniversities,
    getUniversityAdmins,
  deleteUniversity,
  deleteUniversityAdmin
} from "../controllers/superAdminController.js";
import upload from "../utils/upload.js";

const router = express.Router();

router.get("/universities", auth, requireRole("super"), getUniversities);

router.post(
  "/universities",
  auth,
  requireRole("super"),
  upload.single("logo"),
  createUniversity
);

router.post(
  "/university-admins",
  auth,
  requireRole("super"),
  createUniversityAdmin
);

router.get('/university-admins', auth, requireRole('super',"university"), getUniversityAdmins)

router.delete(
  "/universities/:id",
  auth,
  requireRole("super"),
  deleteUniversity
);

router.delete(
  "/university-admins/:id",
  auth,
  requireRole("super"),
  deleteUniversityAdmin
);

export default router;
