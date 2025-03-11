import Ad from "../models/adModel.js"; // Import the Ad model

// Controller function to create a new ad
// Controller function to create a new ad
export const createAd = async (req, res) => {
  try {
    const { title, description } = req.body;
    const image = req.file ? req.file.path.replace("\\", "/") : null; // Adjust path for URL

    if (!image) {
      return res
        .status(400)
        .json({ success: false, message: "Image is required" });
    }

    console.log("Uploaded file path:", image); // Log the image path to verify

    const newAd = new Ad({
      title,
      description,
      image, // Ensure this field contains the correct image path
    });

    await newAd.save();
    res.status(201).json({
      success: true,
      message: "Ad created successfully",
      ad: newAd,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Controller function to get all ads
export const getAllAds = async (req, res) => {
  try {
    const ads = await Ad.find();

    // Dynamically determine backend URI
    const backendUri =
      process.env.BACKEND_URI || `${req.protocol}://${req.get("host")}`;

    const formattedAds = ads.map((ad) => {
      const imageUrl = `${backendUri}/${ad.image}`;
      console.log("Image URI:", imageUrl); // Debugging log
      return {
        _id: ad._id,
        title: ad.title,
        description: ad.description,
        image: imageUrl,
      };
    });

    res.status(200).json({ success: true, advertisements: formattedAds });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAd = async (req, res) => {
  const { id } = req.params;

  try {
    // Find and delete the ad from MongoDB
    const ad = await Ad.findByIdAndDelete(id);

    if (!ad) {
      return res.status(404).json({ success: false, message: "Ad not found" });
    }

    res.status(200).json({ success: true, message: "Ad deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const updateAd = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const image = req.file ? req.file.path.replace("\\", "/") : null;

  try {
    const ad = await Ad.findById(id);
    if (!ad) {
      return res.status(404).json({ success: false, message: "Ad not found" });
    }

    // Update only the fields that were changed
    if (title) ad.title = title;
    if (description) ad.description = description;
    if (image) ad.image = image;

    await ad.save();
    res
      .status(200)
      .json({ success: true, message: "Ad updated successfully", ad });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
