const mongoose = require("mongoose");
const crypto = require("crypto");

const contactSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            default: () => crypto.randomUUID(),
            unique: true,
            index: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },

        subject: {
            type: String,
            required: true,
            trim: true
        },

        message: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: ["unread", "read"],
            default: "unread"
        }
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    }
);

module.exports = mongoose.model("Contact", contactSchema);