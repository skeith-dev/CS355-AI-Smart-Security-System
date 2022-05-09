const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const fs = require('fs');
const mysql = require('mysql2');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const { unescape, escape } = require('querystring');
const path = require('path');

const initializePassport = require('./passport-config');


//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//
//*****//       imports ▲ ▲ ▲        web sockets setup ▼ ▼ ▼
//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//


//when client has connected...
io.on('connection', function (client) {

    console.log('Client ' + client.id + ' has connected!')
    io.emit('start_stream');
    io.emit('start_store');
    io.emit('start_motion_detection');
    io.emit('start_facial_recognition');

    //when receiving data from client...
    client.on('data', function (data) {
        console.log(data);
        let base64Data = data.toString()
        console.log(base64Data.substring(0, 100) + "...");
        io.emit('image', base64Data);
    });

});


//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//
//*****//       web sockets setup ▲ ▲ ▲     database setup ▼ ▼ ▼
//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//


//create MySQL connection with credentials
const db = mysql.createConnection({

    host: 'alfred.cs.uwec.edu',
    user: 'KEITHSE2556',
    password: 'WYQ5S334',
    database: 'KEITHSE2556'

});

//connect to database
db.connect((err) => {

    if(err) {
        throw err;
    }
    console.log('Successfully connected to database!');

});


//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//
//*****//       database connection setup ▲ ▲ ▲           web server setup ▼ ▼ ▼
//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//


app.set('view engine', 'ejs');

initializePassport(db, passport);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    secret: 'CS-355-AI-Smart-Security-System',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

app.use(express.static('views'));
app.use('/static', express.static('views'));


//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//
//*****//       web server setup ▲ ▲ ▲      paths specification ▼ ▼ ▼
//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//


//main (default) website path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/home', checkAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

app.post('/register', checkNotAuthenticated, async (req, res) => {

    try {
        var sql = 'INSERT INTO users (email, username, password, first_name, last_name) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [req.body.email, req.body.username, req.body.password, req.body.first_name, req.body.last_name], (err, rows) => {
            if(err) throw err;
            console.log('New tuple inserted successfully!');
        });
        res.redirect('/login');
    } catch {
        res.redirect('/register');
    }

});

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.delete('/logout', (req, res) => {
    req.logOut();
    res.redirect('/');
});

app.get('/change-password', checkAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'change-password.html'));
});

app.get('/live', checkAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'live-feed.html'));
});

app.get('/past-feed', checkAuthenticated, (req, res) => {
    db.query('SELECT footage_ID, user_ID, time_stamp FROM footage WHERE user_ID = ' + req.user.user_ID, function(err, result) {
        if(err) throw err;
        res.render('past-feed', { data: result});
        console.log(result);
    });
});

app.get('/settings', checkAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'settings.html'));
});


//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//
//*****//       paths specification ▲ ▲ ▲          authentication ▼ ▼ ▼
//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//


function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
      return res.redirect('/home');
    }
    next();
}


//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//
//*****//       authentication ▲ ▲ ▲        UTF-8 encode/decode functions ▼ ▼ ▼
//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//


function encodeUTF8(message) {
    return unescape(encodeURIComponent(message));
}

function decodeUTF8(message) {
    return decodeURIComponent(escape(message));
}


//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//
//*****//       UTF-8 encode/decode functions ▲ ▲ ▲       run app ▼ ▼ ▼
//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//


//set up server; specify address, port
const address = 'localhost';
const port = 5000;

//run app on address:port
http.listen(port, function () {
    console.log('Listening on ' + address + ':' + port);
})
