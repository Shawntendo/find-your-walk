const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const markersController = require("../controllers/markers");
const { ensureAuth } = require("../middleware/auth");

//Marker Routes

module.exports = router