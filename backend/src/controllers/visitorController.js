import Visitor from '../models/Visitor.js';
import University from '../models/University.js';
import Institute from '../models/Institute.js';
export const createVisitor = async (req, res) => {
  try {
    const requiredFields = ['name', 'email', 'mobile', 'purposeType', 'university'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate custom purpose if type is 'Other'
    if (req.body.purposeType === 'Other' && !req.body.customPurpose) {
      return res.status(400).json({ 
        message: 'Custom purpose is required when purpose type is Other' 
      });
    }

    // Verify university exists
    const university = await University.findById(req.body.university);
    if (!university) {
      return res.status(400).json({ message: 'Invalid university' });
    }

    // Verify institute belongs to university if provided
    if (req.body.institute) {
      const institute = await Institute.findOne({
        _id: req.body.institute,
        university: req.body.university
      });
      if (!institute) {
        return res.status(400).json({ message: 'Invalid institute for selected university' });
      }
    }

    // Combine purpose fields
    const { purposeType, customPurpose, ...rest } = req.body;
    const purpose = purposeType === 'Other' ? customPurpose : purposeType;

    // Create visitor with combined purpose
    const visitor = new Visitor({
      ...rest,
      purpose
    });

    await visitor.save();

    // Update university's visitors array
    await University.findByIdAndUpdate(
      req.body.university,
      { $push: { visitors: visitor._id } }
    );

    res.status(201).json(visitor);
  } catch (err) {
    res.status(400).json({ 
      message: 'Validation error',
      errors: err.errors 
    });
  }
};

export const getVisitors = async (req, res) => {
  try {
    let query = {};
    
    // For university admins, show only their university's visitors
    if (req.user.role === 'university') {
      query.university = req.user.university;
    }

    const visitors = await Visitor.find(query)
      .populate('university', 'name logo')
      .populate('institute', 'name')
      .sort({ createdAt: -1 });
      
    res.json(visitors);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update deleteVisitor to handle university reference
export const deleteVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndDelete(req.params.id);
    
    if (visitor) {
      await University.findByIdAndUpdate(
        visitor.university,
        { $pull: { visitors: visitor._id } }
      );
    }
    
    res.json({ message: 'Visitor deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getVisitorsByUniversity = async (req, res) => {
  try {
    const { universityId } = req.params;
    const visitors = await Visitor.find({ university: universityId })
      .populate('university')
      .populate('institute');
    res.json(visitors);
  } catch (err) {
    console.error('Error fetching visitors by university:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getInstituteVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find({
      institute: req.params.id
    }).populate('institute', 'name').populate('university', 'name');
    
    res.json(visitors);
  } catch (err) {
    console.error('Error fetching institute visitors:', err);
    res.status(500).json({ message: 'Server error' });
  }
};