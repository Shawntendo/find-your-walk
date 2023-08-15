module.exports = {
  getIndex: (req, res) => {
    console.log('keys are here: \n' + Object.keys(req))
    console.log('req is here: \n' + req.user)
    // console.log('req is here: \n' + Object.keys(req.client))
    res.render("index.ejs", {isItAuth: req.isAuthenticated(), profileName: req.user ? req.user.userName : null});
  },
  getMap: (req, res) => {
    res.render("map.ejs", {isItAuth: req.isAuthenticated(), profileName: req.user ? req.user.userName : null});
  },
};
