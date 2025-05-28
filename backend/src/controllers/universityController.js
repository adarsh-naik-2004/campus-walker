import Institute from '../models/Institute.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import University from '../models/University.js';

export const createInstitute = async (req, res) => {
  try {
    const institute = new Institute({
      name: req.body.name,
      university: req.body.universityId
    });

    await institute.save();
    
    // Update university's institutes array
    await University.findByIdAndUpdate(
      req.body.universityId,
      { $push: { institutes: institute._id } }
    );

    res.status(201).json(institute);
  } catch (err) {
    res.status(400).json({ message: 'Error creating institute' });
  }
};

export const createInstituteAdmin = async (req, res) => {
  try {
    const { email, password, instituteId } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      role: 'institute',
      institute: instituteId
    });

    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUniversityInstitutes = async (req, res) => {
  try {
    const institutes = await Institute.find({ 
      university: req.params.id 
    });
    res.json(institutes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUniversities = async (req, res) => {
  try {
    const universities = await University.find().select('name logo');
    res.json(universities);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};