const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById) {

  // done is called whenever we are done authenticating our user
  const authenticateUser = async (email, password, done) => {
    const user = getUserByEmail(email);
    if (user == null) {
      return done(null, false, { message: 'No user with that email' });
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Password incorrect' });
      }
    } catch (e) {
      return done(e);
    }
  };

  // default in LocalStrategy is username and password
  // since example here is login via email and password
  // set the usernameField to 'email'
  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
  // creating session for user based on user id
  // "serializing the user"
  passport.serializeUser((user, done) => done(null, user.id)) // save user ID in session
                                              // message = null
  
  // destroying/ending session                                            
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id))
  })
}

module.exports = initialize

