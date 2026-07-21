const express = require("express");
const storage = require("../services/storage");

const router = express.Router();

router.post("/subscribe", express.json(), async (req, res) => {

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            error: "Email is required.",
        });
    }

    // Simple email validation
    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({
            error: "Please enter a valid email.",
        });
    }

    try {

        const existingSubscriber =
            await storage.getSubscriber(email);

        if (existingSubscriber) {

            return res.status(409).json({
                error: "You're already subscribed.",
            });

        }

        const subscriber =
            await storage.createSubscriber({
                email,
                subscribed_at: new Date(),
            });

        res.json({
            message: "Successfully subscribed!",
            subscriber,
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Unable to subscribe right now.",
        });

    }

});

module.exports = router;
