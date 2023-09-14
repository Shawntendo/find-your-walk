const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const mapController = require("../controllers/map");
const { ensureAuth } = require("../middleware/auth");

//Map Routes
router.get("/", mapController.getMap);

//Marker Routes
// router.get("/getMyMarkerID/:lat/:lng", mapController.getMyMarkerID);
router.post("/createMarker", mapController.createMarker);
// router.put("/updateMarker/:id", mapController.updateMarker);
router.put("/flagMarker/:id", mapController.flagMarker);
router.delete("/removeMarker/:id", mapController.removeMarker);

module.exports = router;