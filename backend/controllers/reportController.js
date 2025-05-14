import Report from "../models/Report.js";
import Advertisement from "../models/adModel.js";

export const submitReport = async (req, res) => {
  try {
    const { adId, reason, additionalInfo, reportedAt } = req.body;

    if (!adId || !reason) {
      return res
        .status(400)
        .json({ success: false, message: "Ad ID and reason are required" });
    }

    const report = new Report({
      adId,
      reason,
      additionalInfo,
      reportedAt,
    });

    await report.save();
    res
      .status(201)
      .json({ success: true, message: "Report submitted successfully" });
  } catch (error) {
    console.error("Error submitting report:", error.message, error.stack);
    res
      .status(500)
      .json({ success: false, message: "Failed to submit report" });
  }
};

export const getAllReports = async (req, res) => {
  try {
    console.log("Fetching all reports...");
    const reports = await Report.find()
      .populate("adId", "title description image") // Fetch ad details
      .sort({ reportedAt: -1 });

    if (!reports || reports.length === 0) {
      console.log("No reports found in the database.");
      return res.status(200).json({ success: true, reports: [] });
    }

    console.log("Reports fetched successfully:", reports);
    res.status(200).json({ success: true, reports });
  } catch (error) {
    console.error("Error fetching reports:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
    });
    res.status(500).json({
      success: false,
      message: `Failed to fetch reports: ${error.message}`,
    });
  }
};

export const updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;

    if (!["pending", "reviewed", "resolved"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const report = await Report.findByIdAndUpdate(
      reportId,
      { status },
      { new: true }
    );

    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    }

    res.status(200).json({ success: true, report });
  } catch (error) {
    console.error("Error updating report status:", error.message, error.stack);
    res
      .status(500)
      .json({ success: false, message: "Failed to update report status" });
  }
};

export const deleteAd = async (req, res) => {
  try {
    const { adId } = req.params;

    const ad = await Advertisement.findByIdAndDelete(adId);
    if (!ad) {
      return res
        .status(404)
        .json({ success: false, message: "Advertisement not found" });
    }

    await Report.updateMany({ adId }, { status: "resolved" });

    res
      .status(200)
      .json({ success: true, message: "Advertisement deleted successfully" });
  } catch (error) {
    console.error("Error deleting advertisement:", error.message, error.stack);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete advertisement" });
  }
};
