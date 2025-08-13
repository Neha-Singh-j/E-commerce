// config/passport.js
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User'); // uses passport-local-mongoose

module.exports = function (passport) {
  // usernameField defaults to "username"; change to { usernameField: 'email' } if you log in by email
  passport.use(new LocalStrategy(User.authenticate()));

  // Provided by passport-local-mongoose on the User model
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
};
