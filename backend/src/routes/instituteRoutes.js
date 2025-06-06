import express from "express";
import {
  getInstituteById,
  addLocation,
  getLocations,
  getInstituteAdmins,
  getInstituteLocations,
  deleteInstitute,
  deleteInstituteAdmin,
  deleteLocation,
  addPath,
  getInstitutePaths,
  deletePath,
  getInstituteNavData,
} from "../controllers/instituteController.js";
import { auth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import upload from "../config/upload.js"; 

const router = express.Router();

router.get('/:id', auth, getInstituteById);

router.post(
  "/locations", 
  auth, 
  requireRole("institute"), 
  upload.single('image'), 
  addLocation
);
router.get("/locations", auth, getLocations);
router.get("/:id/locations", auth, getInstituteLocations);

router.post(
  "/paths",
  auth,
  requireRole("institute"),
  addPath
);
router.get("/:id/paths", auth, getInstitutePaths);

router.get("/:id/admins", auth, getInstituteAdmins);

router.delete('/:id', auth, requireRole("super"), deleteInstitute);
router.delete('/admins/:id', auth, requireRole("super"), deleteInstituteAdmin);
router.delete('/locations/:id', auth, deleteLocation);
router.delete('/paths/:id', auth, deletePath);

router.get('/:id/nav-data', getInstituteNavData);

export default router;