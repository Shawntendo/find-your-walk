const Marker = require("../models/Marker");

module.exports = {
  getMap: async (req, res) => {
    // console.log('GETMAP REQ: ' + Object.keys(req.headers))
    // console.log('GETMAP REQ: ' + req.headers)
    try {
      let markers = await Marker.find().sort()
      let markersArr = []
      for(let i=0; i<markers.length; i++){
        markersArr.push(markers[i])
      }
      if(req.user){
        // console.log('REQ.USER KEYS: ' + Object.keys(req.user))
      }
      // console.log('MARKERS RETRIEVED, RENDERING MAP, SENDING MARKERS')
      // console.log(markersArr)
      res.render("map.ejs", {
        markers: markersArr, 
        isItAuth: req.isAuthenticated(), 
        profileName: req.user ? req.user.userName : null, 
        userCode: req.user ? req.user.id : null
      });
    } catch (err) {
      console.log(err);
    }
  },
  // getMyMarkerID: async (req, res) => {
  //   try {
  //     console.log('GETMYMARKERID REQ: ' + Object.keys(req))
  //     console.log('GETMYMARKERID REQ: ' + Object.keys(req.headers))
  //     console.log('GET REQ.PARAMS.LAT: ' + req.params.lat)
  //     console.log('GET REQ.PARAMS.LNG: ' + req.params.lng)
  //     const response = await Marker.find({
  //       latitude: req.params.latitude,
  //       longitude: req.params.longitude,
  //       user: req.user.id || 0
  //     }).sort()
  //     console.log('GET MARKER ID: ' + Object.keys(response))
  //     res.type('text/plain')
  //     res.send('test response to getMyMarkerID')
  //     // res.send(JSON.stringify({test: 'test response to getMyMarkerID'}))
  //   } catch (err) {
  //     console.log(err)
  //   }
  // },
  createMarker: async (req, res) => {
    try {
      let copy = JSON.parse(Object.keys(req.body)[0])
      // console.log('POST REQ.BODY: ' + copy)
      // for (const [key, value] of Object.entries(copy)) {
      //   console.log(`${key}: ${value}`);
      // }
      let markerToDB = {
        markerType: copy.markerType,
        latitude: copy.latitude,
        longitude: copy.longitude,
        info: copy.info,
        user: req.user.id || 0,
        approved: copy.approved,
        flagged: copy.flagged,
        flagBy: copy.flagBy,
      }
      const response = await Marker.create(markerToDB)
      markerToDB._id = response._id
      markerToDB.createdAt = response.createdAt
      markerToDB.__v = response.__v
      // console.log('CREATE MARKER RESPONSE: ' + response)
      // console.log('CREATE MARKER RESPONSE ID: ' + response._id)
      // console.log(JSON.stringify(req.headers))
      // console.log(JSON.stringify(res.headers))
      // // for (const [key, value] of Object.entries(response)) {
      // //   console.log(`${key}: ${value}`);
      // // }
      // res.header('Accept', 'application/x-www-form-urlencoded')
      // res.setHeader('Content-Type', 'application/x-www-form-urlencoded') //'application/json')
      // console.log(JSON.stringify(res.headers))
      // // res.send(response._id + '')
      // res.send({_id: response._id})
      res.json(markerToDB)
      // res.end()
    } catch (err) {
      console.log(err)
    }
  },
  // updateMarker: async (req, res) => {
  //   try {
  //     // await Marker.findOneAndUpdate(
  //     //   { _id: req.params.id },
  //     //   {

  //     //   }
  //     // )
  //   } catch(err) {
  //     console.log(err);
  //   }
  // },
  flagMarker: async (req, res) => {
    try {
      // console.log('FLAG')
      if(req.user){
        console.log('REQ.USER.ID: ' + req.user.id)
        // await Marker.findOneAndUpdate(
        //   { _id: req.params.id },
        //   {
        //     $set: { flagged: 1 },
        //     $set: { flagBy: req.user.id },
        //   }
        // );
      }
    } catch (err) {
      console.log(err)
    }
  },
  removeMarker: async (req, res) => {
    try {
      // if(true){
      // console.log('DELETE')
      // console.log('REQ.PARAMS: ' + Object.keys(req.params))
      // console.log('REQ.PARAMS MARKER ID: ' + req.params.id)
      // console.log('REQ.USER.ID: ' + req.user.id)
      // }
      // else{
      await Marker.deleteOne( { _id: req.params.id } )
      // }
      res.status(204).end()
    } catch (err) {
      console.log(err);
    }
  },
};