import express from 'express';
import {
  addIndoorLocation,
  getIndoorLocations,
  addIndoorPath,
  getBuildingData,
  deleteIndoorLocation,
  deleteIndoorPath
} from '../controllers/indoorController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/locations', auth, addIndoorLocation);
router.get('/locations/:instituteId', getIndoorLocations);
router.delete('/locations/:id', auth, deleteIndoorLocation);

router.post('/paths', auth, addIndoorPath);
router.delete('/paths/:id', auth, deleteIndoorPath);

router.get('/building/:building', getBuildingData);

export default router;