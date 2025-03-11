// equipment-controllers.js
import Equipment from "../models/Equipment.js";

export const createEquipment = async (req, res) => {
  try {
    const { name, description, price, availableForRent, vendorId } = req.body;
    const image = req.file ? req.file.path.replace("\\", "/") : null;

    if (!image) {
      return res
        .status(400)
        .json({ success: false, message: "Image is required" });
    }

    console.log("Uploaded file path:", image); // Matches ad-controllers.js logging

    const newEquipment = new Equipment({
      name,
      description,
      price: Number(price), // Ensure price is a number
      availableForRent: availableForRent === "true",
      image,
      vendorId,
    });

    await newEquipment.save();
    res.status(201).json({
      success: true,
      message: "Equipment created successfully",
      equipment: newEquipment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find();

    const backendUri =
      process.env.BACKEND_URI || `${req.protocol}://${req.get("host")}`;

    const formattedEquipment = equipment.map((item) => {
      const imageUrl = `${backendUri}/${item.image}`;
      console.log("Image URI:", imageUrl); // Matches ad-controllers.js
      return {
        _id: item._id,
        name: item.name,
        description: item.description,
        price: item.price,
        availableForRent: item.availableForRent,
        image: imageUrl,
        vendorId: item.vendorId,
      };
    });

    res.status(200).json({ success: true, equipment: formattedEquipment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteEquipment = async (req, res) => {
  const { id } = req.params;

  try {
    const equipment = await Equipment.findByIdAndDelete(id);
    if (!equipment) {
      return res
        .status(404)
        .json({ success: false, message: "Equipment not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Equipment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEquipment = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, availableForRent, vendorId } = req.body;
  const image = req.file ? req.file.path.replace("\\", "/") : null;

  try {
    const equipment = await Equipment.findById(id);
    if (!equipment) {
      return res
        .status(404)
        .json({ success: false, message: "Equipment not found" });
    }

    if (name) equipment.name = name;
    if (description) equipment.description = description;
    if (price) equipment.price = Number(price);
    if (availableForRent !== undefined)
      equipment.availableForRent = availableForRent === "true";
    if (image) equipment.image = image;
    if (vendorId) equipment.vendorId = vendorId;

    await equipment.save();
    res.status(200).json({
      success: true,
      message: "Equipment updated successfully",
      equipment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
