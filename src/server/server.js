const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const fs = require('fs');
const mysql = require('mysql2');
const { unescape, escape } = require('querystring');
const path = require('path');


//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//
//*****//       imports ▲ ▲ ▲        web sockets setup ▼ ▼ ▼
//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//


//functions when client is connected
io.on('connection', function (socket) {

    io.emit('start_stream');

    //when receiving message 'data'...
    socket.on('data', function (data) {
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


//main (default) website path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/index.html'));
});

//user livestream website path
app.get('/live', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/live-cam.html'))
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


//declare Express app, get address, specify port
const address = 'localhost';
const port = 5000;

//run app on address:port
http.listen(port, function () {
    console.log('Listening on ' + address + ':' + port);
})
