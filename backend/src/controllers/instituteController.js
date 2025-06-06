import Location from "../models/Location.js";
import User from "../models/User.js";
import Institute from "../models/Institute.js";
import Path from "../models/Path.js";
import cloudinary from "../config/cloudinary.js";

export const getInstituteById = async (req, res) => {
  try {
    const institute = await Institute.findById(req.params.id).populate(
      "university"
    );
    if (!institute)
      return res.status(404).json({ message: "Institute not found" });
    res.json(institute);
  } catch (err) {
    console.error("Error fetching institute:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const addLocation = async (req, res) => {
  try {
    const { name, description, floor, category, instituteId, coordinates } =
      req.body;
    let imageUrl = "";

    if (req.file) {
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString(
          "base64"
        )}`,
        { folder: "ar-nav/locations" }
      );
      imageUrl = result.secure_url;
    }

    const institute = await Institute.findById(instituteId).populate(
      "university"
    );
    if (!institute)
      return res.status(404).json({ message: "Institute not found" });

    const location = new Location({
      name,
      description,
      image: imageUrl,
      floor: Number(floor),
      category,
      coordinates: {
        latitude: parseFloat(coordinates.y),
        longitude: parseFloat(coordinates.x),
        altitude: parseFloat(coordinates.z || 0),
      },
      university: institute.university._id,
      institute: instituteId,
    });

    await location.save();
    res.status(201).json(location);
  } catch (err) {
    console.error("Error adding location:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const addPath = async (req, res) => {
  try {
    const {
      from,
      to,
      instituteId,
      waypoints,
      distance,
      estimatedTime,
      accessibilityFriendly,
    } = req.body;

    const institute = await Institute.findById(instituteId).populate(
      "university"
    );
    if (!institute)
      return res.status(404).json({ message: "Institute not found" });

    const fromLocation = await Location.findById(from);
    const toLocation = await Location.findById(to);
    if (!fromLocation || !toLocation) {
      return res.status(404).json({ message: "Location not found" });
    }

    const path = new Path({
      from,
      to,
      institute: instituteId,
      university: institute.university._id,
      waypoints,
      distance,
      estimatedTime,
      accessibilityFriendly,
    });

    await path.save();
    res.status(201).json(path);
  } catch (err) {
    console.error("Error adding path:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLocations = async (req, res) => {
  try {
    const locations = await Location.find().populate("institute");
    res.json(locations);
  } catch (err) {
    console.error("Error fetching locations:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getInstitutePaths = async (req, res) => {
  try {
    const paths = await Path.find({ institute: req.params.id }).populate(
      "from to institute university"
    );

    const filteredPaths = paths.map((path) => ({
      _id: path._id,
      from: path.from?._id || null,
      to: path.to?._id || null,
      fromName: path.from?.name || "Location not found",
      toName: path.to?.name || "Location not found",
      distance: path.distance,
      estimatedTime: path.estimatedTime,
      accessibilityFriendly: path.accessibilityFriendly,
      createdAt: path.createdAt,
      updatedAt: path.updatedAt,
    }));

    res.json(filteredPaths);
  } catch (err) {
    console.error("Error fetching institute paths:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getInstituteAdmins = async (req, res) => {
  try {
    const admins = await User.find({
      role: "institute",
      institute: req.params.id,
    });
    res.json(admins);
  } catch (err) {
    console.error("Error fetching institute admins:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getInstituteLocations = async (req, res) => {
  try {
    const locations = await Location.find({
      institute: req.params.id,
    }).populate("institute");
    res.json(locations);
  } catch (err) {
    console.error("Error fetching institute locations:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteInstitute = async (req, res) => {
  try {
    const institute = await Institute.findByIdAndDelete(req.params.id);
    if (!institute)
      return res.status(404).json({ message: "Institute not found" });

    await Location.deleteMany({ institute: req.params.id });
    await User.deleteMany({ institute: req.params.id, role: "institute" });
    await Path.deleteMany({ institute: req.params.id });

    res.json({ message: "Institute deleted successfully" });
  } catch (err) {
    console.error("Delete institute error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteInstituteAdmin = async (req, res) => {
  try {
    const admin = await User.findOneAndDelete({
      _id: req.params.id,
      role: "institute",
    });
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json({ message: "Admin deleted successfully" });
  } catch (err) {
    console.error("Delete institute admin error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location)
      return res.status(404).json({ message: "Location not found" });

    await Path.deleteMany({
      $or: [{ from: req.params.id }, { to: req.params.id }],
    });
    res.json({ message: "Location deleted successfully" });
  } catch (err) {
    console.error("Delete location error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deletePath = async (req, res) => {
  try {
    const path = await Path.findByIdAndDelete(req.params.id);
    if (!path) return res.status(404).json({ message: "Path not found" });
    res.json({ message: "Path deleted successfully" });
  } catch (err) {
    console.error("Delete path error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
