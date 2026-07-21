const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

const subscriberSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            default: randomUUID,
            unique: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        subscribed_at: {
            type: Date,
            default: Date.now,
        },
    },
    {
        collection: "subscribers",
        timestamps: false,
    }
);

module.exports =
    mongoose.models.Subscriber ||
    mongoose.model("Subscriber", subscriberSchema);
