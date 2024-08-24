require('dotenv').config();

const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');

const User = require('../src/models/user');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.PASSPORT_SECRET;

passport.use(
  new JwtStrategy(opts, (async (jwt_payload, done) => {
    try {
      // console.log(jwt_payload.user_id);
      // const foundUser = await User.findUserById(jwt_payload.user_id);
      const foundUser = await User.findUserByPublicId(jwt_payload.user_id);
      if (foundUser) {
        return done(null, foundUser); // req.user <= foundUser
      }
      return done(null, false);
    } catch (e) {
      return done(e, false);
    }
  })),
);

module.exports = passport;
