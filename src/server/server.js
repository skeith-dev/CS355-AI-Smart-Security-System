const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const fs = require('fs');
const mysql = require('mysql2');
const { unescape, escape } = require('querystring');
const path = require('path');


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
//*****//       web sockets setup ▲ ▲ ▲     database connection setup ▼ ▼ ▼
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
//*****//       database connection setup ▲ ▲ ▲           paths specification ▼ ▼ ▼
//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('views'));
app.use('/static', express.static('views'));

//main (default) website path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/log-out', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'log-out.html'));
});

app.get('/change-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'change-password.html'));
});

app.get('/live', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'live-feed.html'));
});

app.get('/past-feed', (req, res) => {
    db.query('SELECT footage_ID, account_ID, time_stamp FROM footage', function(err, result) {
        if(err) throw err;
        res.render('past-feed', { data: result});
        console.log(result);
    });
});

app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'settings.html'));
});


//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//
//*****//       web server setup ▲ ▲ ▲      UTF-8 encode/decode functions ▼ ▼ ▼
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
