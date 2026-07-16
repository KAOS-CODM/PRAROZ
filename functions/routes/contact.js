const express = require("express");
const router = express.Router();

const Contact = require("../models/Contact");
const storage = require("../services/storage");

router.post("/contact", express.json(), async (req, res) => {

    try {

        const contact = {
            id: crypto.randomUUID(),

            name: req.body.name,

            email: req.body.email,

            subject: req.body.subject,

            message: req.body.message,

            created_at: new Date().toISOString(),

            status: req.body.status
        };

        await storage.createContact(contact);

        res.json({
            success: true,
            message: "Message sent successfully."
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Unable to send message."
        });

    }

});

module.exports = router;