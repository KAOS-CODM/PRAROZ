const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const commentSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: randomUUID,
    },
    recipe_slug: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'comments',
    timestamps: false,
  }
);

module.exports = mongoose.models.Comment || mongoose.model('Comment', commentSchema);
