const mongoose = require("mongoose");

const MarkerSchema = new mongoose.Schema({
  markerType: {
    type: Number,
    required: true,
  },
  latitude: {
    type: Number,
    require: true,
  },
  longitude: {
    type: Number,
    require: true,
  },
  info: {
    type: String,
    required: false,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  approved: {
    type: Number,
    required: true,
  },
  flagged: {
    type: Number,
    required: true,
  },
  flagBy: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Marker", MarkerSchema);
