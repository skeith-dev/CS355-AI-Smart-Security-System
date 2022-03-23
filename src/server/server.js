const http = require('http');
const express = require('express');
const path = require('path');
const ws = require('ws');
const mysql = require('mysql2');
const { unescape, escape } = require('querystring');


//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//
//*****//       imports ▲ ▲ ▲        web sockets setup ▼ ▼ ▼
//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//


const socketServer = new ws.Server({ noServer: true });

socketServer.on('connection', socket => {
    socket.on('message', message => console.log(decodeUTF8(message)));
    socket.send( JSON.stringify( {action: 'stream', payload: true} ) );  //FIX LATER, MESSAGE IS CURRENTLY STATIC
});


//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//
//*****//       web sockets setup ▲ ▲ ▲     database connection setup ▼ ▼ ▼
//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//


const db = mysql.createConnection({

    host: 'alfred.cs.uwec.edu',
    user: 'KEITHSE2556',
    password: 'WYQ5S334',
    database: 'KEITHSE2556'

});

db.connect((err) => {

    if(err) {
        throw err;
    }
    console.log('Successfully connected to database!')

});


//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//
//*****//       database connection setup ▲ ▲ ▲           web server setup ▼ ▼ ▼
//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//


//declare Express app, specify port
const app = express();
const port = process.env.PORT || 8080;


//main (default) website path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/index.html'));
});

//user livestream website path
app.get('/live/keithse2556', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/views/live-cam.html'))
});


//enable server listening
const server = app.listen(port, function() {
    console.log('Server started at localhost:' + port);
});


//enable socket server for Raspberry Pi connection
server.on('upgrade', (request, socket, head) => {
    socketServer.handleUpgrade(request, socket, head, socket => {
        socketServer.emit('connection', socket, request);
    })
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
