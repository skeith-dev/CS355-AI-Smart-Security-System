const localStrategy = require('passport-local').Strategy;
const util = require('util');


function initialize(db, passport) {

    const query = util.promisify(db.query).bind(db);

    const authenticateUser = async (username, password, done) => {

        try {
            const [user] = await query('SELECT * FROM users WHERE username = \"' + username + '\"');
            console.log(user);

            if(user == null) {
                console.log('No user with that username!');
                return done(null, false, { message: 'No user with that username!' });
            }
            
            if(password == user.password) {
                console.log('Passwords match!');
                return done(null, user, { message: 'Passwords match!' });
            } else {
                console.log('Incorrect password (' + password + ' != ' + user.password + ')!');
                return done(null, false, { message: 'Incorrect password!' });
            }
        } catch (e) {
            return done(e);
        }
    }

    passport.use(new localStrategy({ usernameField: 'username' }, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.user_ID));
    passport.deserializeUser(async (user_ID, done) => {
        const[user] = await query('SELECT * FROM users WHERE user_ID = \"' + user_ID + '\"');
        return done(null, user);
    });

}

module.exports = initialize;