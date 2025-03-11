// controllers/feedbackController.js
import Feedback from "../models/Feedback.js";

export const submitFeedback = async (req, res) => {
  try {
    const { expertId, userId, message, rating } = req.body;

    if (!expertId || !message) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Expert ID and message are required",
        });
    }
    if (rating && (rating < 1 || rating > 5)) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const feedback = new Feedback({
      expertId,
      userId: userId || null,
      message,
      rating: rating || null,
    });

    await feedback.save();
    res
      .status(201)
      .json({ success: true, message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getExpertFeedback = async (req, res) => {
  try {
    const { expertId } = req.params;
    console.log("Querying feedback for expertId:", expertId); // Debug log

    if (!expertId || expertId === "undefined") {
      return res
        .status(400)
        .json({ success: false, message: "Expert ID is required" });
    }

    const feedbackList = await Feedback.find({ expertId }).sort({
      createdAt: -1,
    });
    console.log("Found feedback in DB:", feedbackList); // Debug log
    res.status(200).json({ success: true, data: feedbackList });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
