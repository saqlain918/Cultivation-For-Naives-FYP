import express from "express";

const router = express.Router();
import Stripe from "stripe";
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Route to create a Payment Intent
router.post("/create-payment-intent", async (req, res) => {
  try {
    console.log("ello");
    const { amount, itemName } = req.body;

    // Validate input
    if (!amount || !itemName) {
      return res
        .status(400)
        .send({ error: "Amount and itemName are required" });
    }

    // Log FRONTEND_URL for debugging (optional, as it's not used directly here)
    console.log("FRONTEND_URL:", process.env.FRONTEND_URL);

    // Create a Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert dollars to cents
      currency: "usd",
      payment_method_types: ["card"], // Add "google_pay", "apple_pay" if needed
      description: itemName,
      // Optionally, add metadata for itemName
      metadata: { itemName },
    });

    console.log("Created Payment Intent:", paymentIntent.id);
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Error creating Payment Intent:", err);
    res.status(500).send({ error: err.message });
  }
});

export default router;
