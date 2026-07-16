const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const recipeSchema = new mongoose.Schema(
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

    instructions: {
      type: [String],
      default: [],
    },

    ingredients: {
      type: [String],
      default: [],
    },

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
    collection: 'recipes',
    timestamps: false,
  }
);

module.exports = mongoose.models.Recipe || mongoose.model('Recipe', recipeSchema);
