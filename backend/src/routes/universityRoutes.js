import express from "express";
import { auth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import {
  createInstitute,
  createInstituteAdmin,
  getUniversityInstitutes,
  getUniversities,
  getUniversityById
} from "../controllers/universityController.js";
import University from "../models/University.js";

const router = express.Router();

// Public routes
router.get("/universities", getUniversities); // Changed to public
router.get("/:id/institutes", getUniversityInstitutes); // Changed to public

// Protected routes
router.post("/institutes", auth, requireRole("super","university"), createInstitute);
router.post("/institute-admins", auth, requireRole("super"), createInstituteAdmin);

// Add to universityRoutes.js
router.get('/:id', async (req, res) => {
  try {
    const university = await University.findById(req.params.id)
      .populate('institutes')
      .populate('visitors');
    if (!university) return res.status(404).json({ message: 'University not found' });
    res.json(university);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', auth, getUniversityById);


export default router;