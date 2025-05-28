// src/routes/instituteRoutes.js
import express from "express";
import {
  getInstituteById,
  addLocation,
  getLocations,
  getInstituteAdmins,
  getInstituteLocations,
  deleteInstitute,
  deleteInstituteAdmin,
  deleteLocation
} from "../controllers/instituteController.js";
import { auth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = express.Router();

// Get institute by ID
router.get('/:id', auth, getInstituteById);

// Institute locations routes
router.post("/locations", auth, requireRole("institute"), addLocation);
router.get("/locations", auth, getLocations);
router.get("/:id/locations", auth, getInstituteLocations);

// Institute admins route
router.get("/:id/admins", auth, getInstituteAdmins);

router.delete(
  '/:id',
  auth,
  requireRole("super"),
  deleteInstitute
);

router.delete(
  '/admins/:id',
  auth,
  requireRole("super"),
  deleteInstituteAdmin
);

router.delete(
  '/locations/:id',
  auth,
  deleteLocation
);

export default router;