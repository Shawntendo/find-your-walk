const Marker = require("../models/Marker");

module.exports = {
  getMap: async (req, res) => {
    try {
      let markers = await Marker.find().sort()
      let markersArr = []
      for(let i=0; i<markers.length; i++){
        markersArr.push(markers[i])
      }
      console.log('MARKERS RETRIEVED, RENDERING MAP, SENDING MARKERS')
      console.log(markersArr)
      res.render("map.ejs", {markers: markersArr, isItAuth: req.isAuthenticated(), profileName: req.user ? req.user.userName : null});
    } catch (err) {
      console.log(err);
    }
  },
};