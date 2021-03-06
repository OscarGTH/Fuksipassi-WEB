var User = require("../models/user_model.js");
var Challenge = require("../models/challenge_model.js");
var Entry = require("../models/entry_model.js");
var Area = require("../models/area_model");

var ObjectID = require("mongodb").ObjectID;
const saltRounds = 5;
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const fs = require("fs");
const { check, validationResult } = require("express-validator/check");

// Gets all users.
exports.getUsers = function(req, res) {
  // Check that the user has logged in.
  if (req.session.user.role == 1) {
    // Find all users in the current home area except the one who is querying it.
    User.find(
      {
        homeArea: req.session.user.homeArea,
        userId: { $ne: req.session.user.userId }
      },
      { password: 0, homeArea: 0, _id: 0 }
    )
      .exec()
      .then(result => {
        // If there aren't any result, return error.
        if (!result) {
          res.status(404).json({ message: "Cannot find users." });
        } else {
          res.status(200).json({
            users: result
          });
        }
      });
  } else {
    res.status(401).json({ message: "Authorization failed" });
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
            User.findOne({ userId: req.body.userId })
              .exec()
              .then(result => {
                var passwordEdited = false;
                var password = "bing";
                // If the password hasn't remained the same, change it.
                if (typeof req.body.password !== "undefined") {
                  if (req.body.password !== result.password) {
                    passwordEdited = true;
                    password = req.body.password;
                  }
                }
                // Hashing password.
                bcrypt.hash(password, saltRounds, function(err, hash) {
                  if (err) {
                    res.status(400).json({
                      message: "Error when editing user",
                      user: req.session.user
                    });
                  } else {
                    //Set email into an challenge
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
                    { userId: req.body.userId },
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
                  req.session.user.token = token;
                  // Creating an user challenge and setting needed return values to it.
                  var result_user = new Object();
                  result_user.email = req.session.user.email;
                  result_user.role = req.session.user.role;
                  result_user.userId = req.session.user.userId;
                  result_user.area = req.session.user.homeArea;

                  // Return the user and the jwt token to the client.
                  return res
                    .status(200)
                    .json({ user: result_user, token: token });
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
  check("area").isString(),
  (req, res) => {
    // Validating the errors.
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      Area.find({ name: req.body.area })
        .exec()
        .then(coll => {
          if (typeof coll[0] === "undefined") {
            res.status(400).json({ message: "Invalid area name." });
            return true;
          } else {
            // Promise for checking in case there is a password.
            var promise = new Promise(function(resolve, reject) {
              // If password was sent with the request, compare it with the area password.
              if (typeof req.body.areaPass !== "undefined") {
                bcrypt.compare(
                  req.body.areaPass,
                  coll[0].password,
                  (err, result) => {
                    if (err) {
                      // In case of error, resolve as failure has happened.
                      resolve(true);
                    } else if (result == false) {
                      // Password was incorrect and resolving with true, that failure has happened
                      resolve(true);
                    } else{
                      // Password was correct and resolving
                      resolve(false)
                    }
                  }
                );
                // If password wasn't set, continue normally and resolve promise.
              } else{
                resolve(false)
              }
            });
            // Doing password check before continuing
            promise.then(function(failure) {
              // If password was incorrect, return error response.
              if (failure) {
                return res
                  .status(400)
                  .json({ message: "Authorization failed" });
              } else {
                // First off, make sure the email is not duplicate.
                User.find({ email: req.body.email })
                  .exec()
                  .then(result => {
                    // If there were result when searching with the email, return with a error message.
                    if (result[0]) {
                      res.status(400).json({ message: "Email already in use" });
                    } else {
                      // Create a new user.
                      var user = new User();

                      // Hashing password.
                      bcrypt.hash(req.body.password, saltRounds, function(
                        err,
                        hash
                      ) {
                        // Setting the user data.
                        (user.email = req.body.email),
                          (user.password = hash),
                          (user.homeArea = req.body.area),
                          (user.role = 0);

                        user.userId = ObjectID();
                        // Save user into database.
                        user.save(function(err) {
                          if (err) {
                           
                            res
                              .status(401)
                              .json({ message: "Authorization failed" });
                          } else {
                            // Send status with a message and the users email.
                            res.status(200).json({
                              message: "Account created"
                            });
                          }
                        });
                      });
                    }
                  });
              }
            });
          }
        });
    } else {
      // Validation failed.
      res.status(400).json({ message: "Check given information" });
    }
  }
];
// Registers an user and an area to the database.
exports.addAdmin = [
  check("email").isEmail(),
  check("password").isLength({ min: 5 }),
  check("area").isLength({ min: 2 }),
  (req, res) => {
    // Validating the errors.
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      // Check if area name is available.
      Area.find({ name: req.body.area })
        .exec()
        .then(area => {
          if (area[0]) {
            res.status(400).json({ message: "Area name already taken." });
            return true;
          }
          // Then, make sure the email is not duplicate.
          User.find({ email: req.body.email })
            .exec()
            .then(result => {
              // If there were result when searching with the email, return with a error message.
              if (result[0]) {
                res.status(400).json({ message: "Email already in use" });
                return true;
              } else {
                // Create a new user.
                var user = new User();

                // Hashing password.
                bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                  // Setting the user data.
                  (user.email = req.body.email),
                    (user.password = hash),
                    (user.homeArea = req.body.area),
                    (user.role = 1);

                  user.userId = ObjectID();
                });

                // Create a new area
                var area = new Area();
                // Set area name
                area.name = req.body.area;
                // Encrypt possible password in a promise.
                var promise = new Promise(function(resolve, reject) {
                  if (typeof req.body.areaPass !== "undefined") {
                    bcrypt.hash(req.body.areaPass, saltRounds, function(
                      err,
                      hash
                    ) {
                      if (err) {
                        res.status(401).json({ message: "Unknown error" });
                        return true;
                      } else {
                        resolve(hash);
                      }
                    });
                  } else {
                    // Resolve null if no password was given.
                    resolve(null);
                  }
                });
                // Wait fora promise to get resolved.
                promise
                  .then(function(data) {
                    /* After promise, check if password exists.
                     *Then save the area and user into database.
                     */
                    if (data !== null) {
                      area.password = data;
                    }
                    // Save area into database.
                    area.save(function(err) {
                      if (err) {
                        res
                          .status(401)
                          .json({ message: "Authorization failed" });
                        return true;
                      } else {
                        // Save user into database.
                        user.save({});
                        res.status(200).json({
                          message: "Registering successful"
                        });
                      }
                    });
                  })
                  .catch(function(error) {
                    res.status(401).json({ message: "Authorization failed" });
                  });
              }
            });
        });
    } else {
      // Validation failed.
      res.status(400).json({ message: "Check given information" });
    }
  }
];


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
        } else {
          Entry.deleteMany({ userId: req.params.id }).exec();
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
  (req, res) => {
    //Check that the user is admin. ENABLE ME WHEN FINISHED!!!!
    if (req.session.user.role == 1) {
      var challenge = new Challenge();
      challenge.title = req.body.title;
      challenge.description = req.body.description;
      challenge.area = req.session.user.homeArea;
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
    } else {
      res.status(401).json({ message: "Authorization failed" });
    }
  }
];
exports.deleteChallenge = function(req, res) {
  if (req.session.user.role == 1) {
    Challenge.remove({ challengeId: req.params.id })
      .exec()
      .then(result => {
        // Check if there were any deleted challenges.
        if (result.ok < 1) {
          res.status(500).json({ message: "Deletion failed." });
          return true;
        } else {
          Entry.remove({ challengeId: req.params.id })
            .exec()
            .then(result => {
              // Check if there were any deleted challenges.
              if (result.ok < 1) {
                res.status(500).json({ message: "Deletion failed." });
                return true;
              } else {
                res.status(200).json({ message: "Deletion successful." });
              }
            });
        }
      });
  } else {
    res.status(401).json({ message: "Authorization failed" });
  }
};
// Completes a challenge
exports.completeChallenge = [
  check("challengeId").isLength({ min: 24 }),
  check("userId").isLength({ min: 24 }),
  (req, res) => {
    if (
      req.session.user !== "undefined" &&
      req.session.user.userId === req.body.userId
    ) {
      var entry = new Entry();
      entry.challengeId = req.body.challengeId;
      entry.userId = req.body.userId;
      entry.email = req.session.user.email;
      entry.img.data = fs.readFileSync(req.file.path);
      entry.img.contentType = "image/jpeg";
      entry.verified = false;
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

// Deletes a completed challenge
exports.deleteEntry = [
  check("challengeId").isLength({ min: 24 }),
  check("userId").isLength({ min: 24 }),
  (req, res) => {
    Entry.deleteOne({
      userId: req.params.userId,
      challengeId: req.params.challengeId
    })
      .exec()
      .then(result => {
        if (result.ok < 1) {
          res.status(401).json({ message: "Challenge deletion failed" });
        } else {
          res.status(200).json({
            message: "Entry deleted!"
          });
        }
      });
  }
];

// Verifies unverified challenges.
exports.verifyChallenge = [
  check("userId").isLength({ min: 24 }),
  check("challengeId").isLength({ min: 24 }),
  function(req, res) {
    Entry.updateOne(
      { userId: req.params.userId, challengeId: req.params.challengeId },
      { $set: { verified: true } }
    )
      .exec()
      .then(result => {
        if (result.ok < 1) {
          res.status(400).json({ message: "Updating failed" });
        } else {
          res.status(200).json({ message: "Entry verified successfully" });
        }
      });
  }
];

exports.getUndoneChallenges = [
  check("userId").isLength({ min: 24 }),
  function(req, res) {
    // Find all completed challenges by users id.
    Entry.find({ userId: req.params.id }, { challengeId: 1, _id: 0 })
      .exec()
      .then(result => {
        if (!result) {
          res.status(401).json({ message: "No completed challenges found." });
        } else {
          // Save the completed challenge's identifiers in an array.
          var ids = new Array();
          for (var i = 0; i < result.length; i++) {
            // Cast identifiers to ObjectID
            ids.push(ObjectID(result[i].challengeId));
          }
          var loggedIn = req.session.user;
          if (typeof loggedIn !== "undefined") {
            // Filter out the completed challenges and return the remaining.
            Challenge.find({
              challengeId: { $nin: ids },
              area: req.session.user.homeArea
            })
              .exec()
              .then(challenges => {
                res.status(200).json({ data: challenges });
              });
          } else {
            res.status(404).json({ message: "Invalid login." });
          }
        }
      });
  }
];
// Finds and returns all pending challenges from the users of the area.
exports.getPendingChallenges = function(req, res) {
  // Find all challenges the user has completed.
  Challenge.find({ area: req.session.user.homeArea }, { _id: 0, area: 0 })
    .exec()
    .then(result => {
      // Check if the user hasn't completed any challenges.
      if (!result) {
        res.status(401).json({ message: "No challenges found." });
      } else {
        // Save the completed challenge's identifiers in an array.
        var ids = new Array();
        for (var i = 0; i < result.length; i++) {
          // Cast identifiers to ObjectID
          ids.push(ObjectID(result[i].challengeId));
        }
        const promises = result.map((info, i) =>
          Entry.aggregate([
            { $match: { challengeId: ids[i], verified: false } },
            { $addFields: { info } }
          ]).exec()
        );

        Promise.all(promises).then(promise_results => {
          // Filter out empty rows from the array.
          var filtered = promise_results.filter(function(el) {
            return el != "";
          });
          res.status(200).json({ data: filtered });
        });
      }
    });
};

// Finds and returns the completed challenges for specific user
exports.getDoneChallenges = [
  check("userId").isLength({ min: 24 }),
  function(req, res) {
    // Find all challenges the user has completed.
    Entry.find({ userId: req.params.id, verified: true }, { _id: 0 })
      .sort({ challengeId: -1 })
      .exec()
      .then(result => {
        // Check if the user hasn't completed any challenges.
        if (!result) {
          res.status(401).json({ message: "No completed challenges found." });
        } else {
          // Save the completed challenge's identifiers in an array.
          var ids = new Array();
          for (var i = 0; i < result.length; i++) {
            // Cast identifiers to ObjectID
            ids.push(ObjectID(result[i].challengeId));
          }
          const promises = result.map((image, i) =>
            Challenge.aggregate([
              { $match: { challengeId: ids[i] } },
              { $addFields: { image } }
            ]).exec()
          );
          Promise.all(promises).then(promise_results =>
            res.status(200).json({ data: promise_results })
          );
        }
      });
  }
];
// Finds and returns the unverified but completed challenges for specific user
exports.getUnverifiedChallenges = [
  check("id").isLength({ min: 24 }),
  function(req, res) {
    // Find all challenges the user has completed.
    Entry.find({ userId: req.params.id, verified: false }, { _id: 0 })
      .sort({ challengeId: -1 })
      .exec()
      .then(result => {
        // Check if the user hasn't completed any challenges.
        if (!result) {
          res.status(401).json({ message: "No unverified challenges found." });
        } else {
          // Save the completed challenge's identifiers in an array.
          var ids = new Array();
          for (var i = 0; i < result.length; i++) {
            // Cast identifiers to ObjectID
            ids.push(ObjectID(result[i].challengeId));
          }
          const promises = result.map((image, i) =>
            Challenge.aggregate([
              { $match: { challengeId: ids[i] } },
              { $addFields: { image } }
            ]).exec()
          );
          Promise.all(promises).then(promise_results =>
            res.status(200).json({ data: promise_results })
          );
        }
      });
  }
];
// Checks the given area in case it exists and then if it is password protected.
exports.checkArea = [
  check("area").isString(),
  check("area").isLength({ min: 1 }),
  function(req, res) {
    Area.find({ name: req.params.area })
      .exec()
      .then(area => {
        if (typeof area[0] === "undefined") {
          res.status(404).json({ message: "Area not found" });
        } else {
          Area.find({ name: req.params.area, password: { $exists: true } })
            .exec()
            .then(result => {
              // If the area is not found when searching for password protection, then it is not protected.
              if (typeof result[0] === "undefined") {
                res
                  .status(200)
                  .json({ message: "Area found", password: false });
              } else {
                res.status(200).json({ message: "Area found", password: true });
              }
            });
        }
      });
  }
];
