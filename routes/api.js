var express = require("express");
var api = express.Router();
const controller = require("../controller/apicontroller");
const Auth = require("../methods/auth");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function(req, res, cb) {
      cb(null, "./uploads");
    }
  });
const upload = multer({ storage: storage });

// Route for getting all users.
api.get("/user", Auth.tokenAuth, Auth.checkLogin, controller.getUsers);
// Route for getting specific user
api.get("/user/:id", Auth.tokenAuth, Auth.checkLogin, controller.getUser);
// Route for updating existing user
api.patch("/user/:id", Auth.tokenAuth, Auth.checkLogin, controller.updateUser);
// Route for adding user
api.post("/user", controller.addUser);
// Route for adding admin user
api.post("/admin", controller.addAdmin);
// Route for deleting an user
api.delete("/user/:id", Auth.tokenAuth, Auth.checkLogin, controller.deleteUser);
// Route for logging in
api.post("/login", controller.login);
// Route to get events
api.get("/events", controller.getEvents);
// Route to log out.
api.get("/logout", Auth.tokenAuth, Auth.checkLogin, controller.logout);
// Route to get all challenges
api.get("/challenge/undone/:id",controller.getUndoneChallenges);
// Route to get all challenges
api.get("/challenge/done/:id",controller.getDoneChallenges);
// Route to create a challenge
api.post("/challenge",controller.createChallenge);
// Deletes the selected challenge
api.delete("/challenge/:id",controller.deleteChallenge);
// Route to complete a challenge
api.post("/entry",upload.single('file'),controller.completeChallenge);




module.exports = api;
