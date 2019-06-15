var User = require("../models/user_model.js");
var Challenge = require("../models/challenge_model.js");
var Entry = require("../models/entry_model.js");

var ObjectID = require("mongodb").ObjectID;
const saltRounds = 5;
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const events = require("../client/events/events.json");
const fs = require("fs");
const { check, validationResult } = require("express-validator/check");

// Gets all users.
exports.getUsers = function(req, res) {
  // Check that the user has logged in.
  if (req.session.user.role == 1) {
    // Find all users.
    User.find()
      .exec()
      .then(user => {
        if (!user) {
          res.sendStatus(404).json({ message: "Cannot find users." });
        } else {
          res.status(200).json({
            user
          });
        }
      });
  } else {
    // If the requesting user is basic user, only return basic users.
    User.find({ role: 0 })
      .exec()
      .then(user => {
        if (!user) {
          res.sendStatus(404).json({ message: "Cannot find users." });
        } else {
          // Return founds users in json format.
          res.status(200).json({
            user
          });
        }
      });
  }
};

// Gets specific user
exports.getUser = function(req, res) {
  User.findOne({ userId: req.params.id }, function(err, user) {
    if (err) {
      res.status(404).json({ error: err });
      // Check that the requesting user is either admin or they're requesting for themselves.
    } else if (
      req.session.user.role == 1 ||
      user.userId == req.session.user.userId
    ) {
      return res.status(200).json(user);
    } else {
      return res.status(401).json({
        message: "Authorization failed"
      });
    }
  });
};

// Updates the given user
exports.updateUser = [
  check("email").isEmail(),
  check("password").isLength({ min: 5 }),
  check("paid").isBoolean(),
  check("role").isIn([0, 1]),
  (req, res) => {
    // Check for validation errors.
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      // Check that the new email hasn't been taken.
      User.find({ email: req.body.email })
        .exec()
        .then(result => {
          var emailFree = true;
          // If there was a result when searching with the email, check if the email is their old one. If not, set email as taken.
          if (result[0]) {
            emailFree = false;
            // If the found email was their own, set the email as free.
            if (result[0].userId == req.body.userId) {
              emailFree = true;
            }
          }
          // If the chosen email is acceptable, continue.
          if (emailFree) {
            // Find the editable user
            User.findOne({ _id: req.body._id })
              .exec()
              .then(result => {
                var passwordEdited = false;
                // If the password hasn't remained the same, change it.
                if (req.body.password !== result.password) {
                  passwordEdited = true;
                }
                // Hashing password.
                bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                  if (err) {
                    res
                      .status(400)
                      .json({ message: "Error when editing user" });
                  } else {
                    //Set email into an object
                    var user = { email: req.body.email };
                    // If the password has been edited, set the new hashed password to replace the old one.
                    if (passwordEdited) {
                      user.password = hash;
                    }
                    // If the editing user is an admin, allow role to be set also.
                    if (req.session.user.role) {
                      user.role = req.body.role;
                    }
                  }

                  // Updating the user and returning the updated user.
                  User.findOneAndUpdate(
                    { _id: req.body._id },
                    { $set: user },
                    { new: true },
                    function(err, user) {
                      if (err) {
                        return res.status(400).json({
                          user: req.session.user,
                          message: "Error when editing user."
                        });
                      }
                      // If the user edited themselves, set session as the new user.
                      else if (req.body._id === req.session.user._id) {
                        req.session.user = user;
                      }
                      // Return the new user
                      return res.status(200).json({
                        message: "User successfully updated",
                        user: user
                      });
                    }
                  );
                });
              });
          } else {
            res.status(400).json({
              user: req.session.user,
              message: "Email already in use"
            });
          }
        });
    } else {
      res
        .status(401)
        .json({ user: req.session.user, message: "Invalid format" });
    }
  }
];

// Logs the user in if the credentials are correct.
exports.login = [
  check("email").isEmail(),
  check("password").isLength({ min: 5 }),
  (req, res) => {
    // Checking for validation errors.
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      // Find the account from database.
      User.find({ email: req.body.email })
        .exec()
        .then(user => {
          // If account cannot be found, return error message.
          if (typeof user[0] === "undefined") {
            return res.status(401).json({
              message: "Authorization failed"
            });
          } else {
            // Compare given passwords with the password that belongs to the account.
            bcrypt.compare(
              req.body.password,
              user[0].password,
              (err, result) => {
                if (err) {
                  return res
                    .status(401)
                    .json({ message: "Authorization failed" });
                }
                // If password matched, set the found user as the session user.
                if (result) {
                  req.session.user = user[0];
                  // Sign a jsonwebtoken
                  const token = jwt.sign(
                    {
                      email: user[0].email,
                      userId: user[0]._id
                    },
                    "supermegasecret",
                    {
                      expiresIn: "1h"
                    }
                  );
                  // Return the user and the jwt token to the client.
                  return res
                    .status(200)
                    .json({ message: req.session.user, token: token });
                }
                return res
                  .status(401)
                  .json({ message: "Authorization failed" });
              }
            );
          }
        });
    } else {
      // If the input validation failed, return error message.
      res.status(400).json({ message: "Invalid format" });
    }
  }
];

// Registers an user to the system.
exports.addUser = [
  check("email").isEmail(),
  check("password").isLength({ min: 5 }),
  (req, res) => {
    console.log(req.body);
    // Validating the errors.
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      // First off, make sure the email is not duplicate.
      User.find({ email: req.body.email })
        .exec()
        .then(result => {
          // If there were result when searching with the email, return with a error message.
          if (result[0]) {
            res.status(400).json({ message: "Email already in use" });
          } else {
            var userId = 1;
            // Find the highest user id from all users.
            User.find({})
              .sort({ userId: -1 })
              .limit(1)
              .exec()
              .then(result => {
                /*// If array is not undefined or empty, go on.
                if (typeof result !== "undefined" && result.length > 0) {
                  // Add one to the result user id and save it to a variable.
                  userId = result[0].userId + 1;
                }*/
                // Create a new user.
                var user = new User();

                // Hashing password.
                bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                  // Setting the user data.
                  (user.email = req.body.email),
                    (user.password = hash),
                    (user.role = 0);

                  user.userId = ObjectID();
                  // Save user into database.
                  user.save(function(err) {
                    if (err) {
                      console.log("error when saving!");
                      res.status(401).json({ message: "Authorization failed" });
                    } else {
                      // Send status with a message and the users email.
                      res.status(200).json({
                        email: user.email,
                        message: "Account created"
                      });
                    }
                  });
                });
              });
          }
        });
    } else {
      // Validation failed.
      res.status(400).json({ message: "Check given information" });
    }
  }
];

// Return the event list in json format. Fetches the events from events.json file.
exports.getEvents = function(req, res) {
  res.status(200);
  res.json(events);
};

// Logs out the user. Sets the current session null.
exports.logout = function(req, res) {
  req.session.user = undefined;
  res.status(200).json({ message: "Logged out successfully!" });
};

// Deletes the selected user.
exports.deleteUser = function(req, res) {
  // Checks that the user is either admin or basic user who is deleting themselves.
  if (req.session.user.role == 1 || req.session.user.userId == req.params.id) {
    User.deleteOne({ userId: req.params.id })
      .exec()
      .then(result => {
        // Check if there are deleted users.
        if (result.deletedCount < 1) {
          res.status(401).json({ message: "Deletion failed" });
        } else if (result.deletedCount > 0) {
          // Return status code with a message if deletion succeeded.
          res.status(200).json({ message: "Deletion successful" });
        }
      });
  } else {
    res.status(401).json({ message: "Authorization failed" });
  }
};

// Creates a new challenge.
exports.createChallenge = [
  check("title").isString(),
  check("description").isString(),
  check("date").isLength({ min: 6 }),
  (req, res) => {
    /* Check that the user is admin. ENABLE ME WHEN FINISHED!!!!
     *if(req.session.role == 1){*/
    var challenge = new Challenge();
    challenge.title = req.body.title;
    challenge.description = req.body.description;
    challenge.date = new Date(req.body.date);
    // Generate new challenge id for the challenge.
    challenge.challengeId = ObjectID();
    challenge.save(function(err, chall) {
      if (err) {
        res.status(401).json({ message: "Challenge creation failed" });
      } else {
        // Send status with a message and the challenge.
        res.status(200).json({
          challenge: chall,
          message: "Challenge created successfully!"
        });
      }
    });
    /*} else{
    res.status(401).json({ message: "Authorization failed" });
  }*/
  }
];

// Completes a challenge
exports.completeChallenge = [
  check("challengeId").isLength({ min: 24 }),
  check("userId").isLength({ min: 24 }),
  (req, res) => {
    console.log(req.session.user);
    console.log(req.session.user.userId === req.body.userId);
    if (
      req.session.user !== "undefined" &&
      req.session.user.userId === req.body.userId
    ) {
      var entry = new Entry();
      entry.challengeId = req.body.challengeId;
      entry.userId = req.body.userId;
      entry.img.data = fs.readFileSync(req.file.path);
      entry.img.contentType = "image/jpeg";
      entry.save(function(err, data) {
        if (err) {
          res.status(401).json({ message: "Challenge completion failed" });
        } else {
          res.status(200).json({
            message: "Challenge completed successfully!"
          });
        }
      });
    } else {
      res.status(401).json({ message: "Authorization failed" });
    }
  }
];

exports.getUndoneChallenges = [
  check("userId").isLength({ min: 24 }),
  function(req, res) {
    // Find all completed challenges by users id.
    Entry.find({ userId: req.body.userId }, { challengeId: 1, _id: 0 })
      .exec()
      .then(result => {
        if (!result) {
          console.log("Zero completed challenges.");
          res.status(401).json({ message: "No completed challenges found." });
        } else {
          // Save the completed challenge's identifiers in an array.
          var ids = new Array();
          for (var i = 0; i < result.length; i++) {
            // Cast identifiers to ObjectID
            ids.push(ObjectID(result[i].challengeId));
          }
          // Filter out the completed challenges and return the remaining.
          Challenge.find({ challengeId: { $nin: ids } })
            .exec()
            .then(challenges => {
              console.log("Incompleted challenges: " + challenges);
              res.status(200).json({ challenges: challenges });
            });
        }
      });
  }
];
// Finds and returns the completed challenges for specific user
exports.getDoneChallenges = [
  check("userId").isLength({ min: 24 }),
  function(req, res) {
    // Find all completed challenges by users id.

    var myPromise = () =>
      new Promise((resolve, reject) => {
        Entry.find({ userId: req.params.id }, { _id: 0 })
          .sort({ challengeId: -1 })
          .exec()
          .then(result => {
            // Check if the user hasn't completed any challenges.
            if (!result) {
              console.log("Zero completed challenges.");
              res
                .status(401)
                .json({ message: "No completed challenges found." });
            } else {
              // Save the completed challenge's identifiers in an array.
              var ids = new Array();
              for (var i = 0; i < result.length; i++) {
                // Cast identifiers to ObjectID
                ids.push(ObjectID(result[i].challengeId));
              }

              // Find the completed challenge entries from the entry collection.
              Entry.find(
                { userId: req.params.id, challengeId: { $in: ids } },
                { _id: 0 }
              )
              // Sort array into ascending order by challenge id (by creation date)
                .sort({ challengeId: -1 })
                .exec()
                .then(images => {
                  var challenge_arr = new Array();
                  for (let i = 0; i < images.length; i++) {
                    // Match the corresponding challenge id's from entries to challenges and add image.
                    Challenge.aggregate([
                      { $match: { challengeId: ids[i] } },
                      { $addFields: { image: images[i] } }
                    ])
                      .exec()
                      .then(challenge => {
                        var object = new Object();
                        object.title = challenge[0].title;
                        object.challengeId = challenge[0].challengeId;
                        object.description = challenge[0].description;
                        object.date = challenge[0].image.date;
                        object.img = challenge[0].image.img;
                        
                        // Save the challenges into the challenge array.
                        challenge_arr[i] = object;
                        // If the loop is in the last round, return the filled array.
                        if (i == images.length - 1) {
                          return challenge_arr;
                        }
                      })
                      .then(challenge_arr => {
                        
                        // Check that the array isn't undefined.
                        if (typeof challenge_arr !== "undefined") {
                          // Resolve the promise.
                          resolve(challenge_arr);
                        }
                      });
                  }
                });
            }
          });
      });
      // Call promise function and send a response after resolving it.
    myPromise().then(data => {
      
      res.status(200).json({data: data });
    });
  }
];
