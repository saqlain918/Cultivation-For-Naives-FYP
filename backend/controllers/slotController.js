import Slot from "../models/Slotmodel.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "f219255@cfd.nu.edu.pk",
    pass: "fqtb kujh yaak bqfd",
  },
});

// Test transporter setup
transporter.verify((error, success) => {
  if (error) {
    console.error("Transporter verification failed:", error);
  } else {
    console.log("Email transporter is ready");
  }
});

// Add a new free slot
export const addSlot = async (req, res) => {
  try {
    const { date, startTime, endTime, id } = req.body;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const existingSlot = await Slot.findOne({
      expertId: id,
      date,
      $or: [{ startTime: { $lte: endTime }, endTime: { $gte: startTime } }],
    });

    if (existingSlot) {
      return res.status(400).json({
        success: false,
        message: "This time slot overlaps with an existing slot",
      });
    }

    const newSlot = new Slot({
      expertId: id,
      date,
      startTime,
      endTime,
    });

    await newSlot.save();

    res.status(201).json({
      success: true,
      data: newSlot,
      message: "Slot added successfully",
    });
  } catch (error) {
    console.error("Error adding slot:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get all free slots for an expert (expert side)
export const getFreeSlots = async (req, res) => {
  try {
    const expertId = req.query.id || req.user?.id;

    const slots = await Slot.find({
      expertId,
      isBooked: false,
    }).sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      data: slots,
    });
  } catch (error) {
    console.error("Error fetching slots:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update an existing slot
export const updateSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { date, startTime, endTime, id: expertId } = req.body;

    if (!date || !startTime || !endTime || !expertId) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Slot not found",
      });
    }

    const overlappingSlot = await Slot.findOne({
      expertId,
      date,
      _id: { $ne: slotId },
      $or: [{ startTime: { $lte: endTime }, endTime: { $gte: startTime } }],
    });

    if (overlappingSlot) {
      return res.status(400).json({
        success: false,
        message: "This time slot overlaps with an existing slot",
      });
    }

    slot.date = date;
    slot.startTime = startTime;
    slot.endTime = endTime;
    slot.expertId = expertId;
    await slot.save();

    res.status(200).json({
      success: true,
      data: slot,
      message: "Slot updated successfully",
    });
  } catch (error) {
    console.error("Error updating slot:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Delete a slot
export const deleteSlot = async (req, res) => {
  try {
    const { slotId } = req.params;

    const slot = await Slot.findByIdAndDelete(slotId);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Slot not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Slot deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting slot:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getExpertFreeSlots = async (req, res) => {
  try {
    const { expertId } = req.params;

    console.log(`Fetching slots for expertId: ${expertId}`);

    // Set start of current day (00:00:00 UTC)
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const slots = await Slot.find({
      expertId,
      isBooked: false,
      date: { $gte: startOfDay }, // Include slots from today onward
    }).sort({ date: 1, startTime: 1 });

    console.log(`Fetched ${slots.length} slots for expert ${expertId}:`, slots);
    if (slots.length === 0) {
      console.log("No slots found. Checking all slots in DB for this expert:");
      const allSlots = await Slot.find({ expertId });
      console.log(`All slots for expert ${expertId}:`, allSlots);
    }

    res.status(200).json({
      success: true,
      data: slots,
    });
  } catch (error) {
    console.error("Error fetching expert slots:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const bookSlot = async (req, res) => {
  try {
    const { slotId, userId, expertId, userEmail, expertEmail, slotTime } =
      req.body;

    if (
      !slotId ||
      !userId ||
      !expertId ||
      !userEmail ||
      !expertEmail ||
      !slotTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const slot = await Slot.findById(slotId);
    if (!slot || slot.isBooked) {
      return res.status(400).json({
        success: false,
        message: "Slot not available",
      });
    }

    slot.isBooked = true;
    slot.bookedBy = userId;
    await slot.save();

    console.log(`Updated slot ${slotId} to booked:`, slot); // Debug log

    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "Consultation Booking Confirmation",
      text: `Your consultation with Expert ID ${expertId} has been booked for ${slotTime}.`,
    };

    const expertMailOptions = {
      from: process.env.EMAIL_USER,
      to: expertEmail,
      subject: "New Consultation Booking",
      text: `A user (ID: ${userId}) has booked a consultation with you for ${slotTime}.`,
    };

    await Promise.all([
      transporter.sendMail(userMailOptions).catch((err) => {
        throw new Error(`Failed to send email to user: ${err.message}`);
      }),
      transporter.sendMail(expertMailOptions).catch((err) => {
        throw new Error(`Failed to send email to expert: ${err.message}`);
      }),
    ]);

    res.status(200).json({
      success: true,
      message: "Booking confirmed and emails sent",
      data: slot, // Return updated slot
    });
  } catch (error) {
    console.error("Error booking slot:", error);
    res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};
