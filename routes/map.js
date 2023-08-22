const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const mapController = require("../controllers/map");
const { ensureAuth } = require("../middleware/auth");

//Map Routes
router.get("/", mapController.getMap);

//Marker Routes


module.exports = router