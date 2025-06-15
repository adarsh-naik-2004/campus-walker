import IndoorLocation from "../models/IndoorLocation.js";
import IndoorPath from "../models/IndoorPath.js";
import Institute from "../models/Institute.js";

export const addIndoorLocation = async (req, res) => {
  try {
    const { name, nodeId, building, floor, x, y, category, instituteId } =
      req.body;

    const institute = await Institute.findById(instituteId);
    if (!institute)
      return res.status(404).json({ message: "Institute not found" });

    const location = new IndoorLocation({
      name,
      nodeId,
      building,
      floor,
      x,
      y,
      category,
      institute: instituteId,
    });

    await location.save();
    res.status(201).json(location);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const addIndoorPath = async (req, res) => {
  try {
    const {
      from,
      to,
      distance,
      isStair,
      isElevator,
      floorChange,
      instituteId,
    } = req.body;

    const path = new IndoorPath({
      from,
      to,
      distance,
      isStair,
      isElevator,
      floorChange,
      institute: instituteId,
    });

    await path.save();
    res.status(201).json(path);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getIndoorLocations = async (req, res) => {
  try {
    const locations = await IndoorLocation.find({
      institute: req.params.instituteId,
    });
    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getIndoorPaths = async (req, res) => {
  try {
    const paths = await IndoorPath.find()
      .populate("from", "name nodeId building floor")
      .populate("to", "name nodeId building floor");
    res.json(paths);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getBuildingData = async (req, res) => {
  try {
    const buildingName = req.params.building;

    // Find all locations in the specified building
    const locations = await IndoorLocation.find({ building: buildingName });
    
    if (locations.length === 0) {
      return res.status(404).json({ message: "Building not found" });
    }

    // Get IDs of all locations in this building
    const locationIds = locations.map(loc => loc._id);

    // Find all paths between locations in this building
    const paths = await IndoorPath.find({
      $or: [
        { from: { $in: locationIds } },
        { to: { $in: locationIds } }
      ]
    })
    .populate("from", "nodeId name floor x y category")
    .populate("to", "nodeId name floor x y category");

    // Prepare response data
    const buildingData = {
      nodes: locations.map(loc => ({
        id: loc.nodeId,
        name: loc.name,
        floor: loc.floor,
        x: loc.x,
        y: loc.y,
        category: loc.category
      })),
      edges: paths.map(path => ({
        from: path.from.nodeId,
        to: path.to.nodeId,
        distance: path.distance,
        isStair: path.isStair,
        isElevator: path.isElevator,
        floorChange: path.floorChange
      }))
    };

    res.json(buildingData);
  } catch (err) {
    console.error("Error fetching building data:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteIndoorLocation = async (req, res) => {
  try {
    await IndoorLocation.findByIdAndDelete(req.params.id);
    await IndoorPath.deleteMany({
      $or: [{ from: req.params.id }, { to: req.params.id }],
    });
    res.json({ message: "Location deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteIndoorPath = async (req, res) => {
  try {
    await IndoorPath.findByIdAndDelete(req.params.id);
    res.json({ message: "Path deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
