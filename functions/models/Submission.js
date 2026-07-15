const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const submissionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: randomUUID,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    image: String,
    description: String,
    instructions: String,
    instructions_array: [String],
    ingredients: [String],
    prep_time: String,
    cook_time: String,
    servings: String,
    calories: String,
    protein: String,
    carbs: String,
    fat: String,
    chef_tips: String,
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'submissions',
    timestamps: false,
  }
);

module.exports = mongoose.models.Submission || mongoose.model('Submission', submissionSchema);
