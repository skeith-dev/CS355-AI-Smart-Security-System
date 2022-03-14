const http = require('http');
const express = require('express');
const path = require('path');
const ws = require('ws');
const mysql = require('mysql');
const { error } = require('console');

//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//
//*****//       imports ▲ ▲ ▲        web sockets setup ▼ ▼ ▼
//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//

const socketServer = new ws.Server({ noServer: true });
socketServer.on('connection', socket => {
    socket.on('message', message => console.log(message));
});

//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//
//*****//       web sockets setup ▲ ▲ ▲     database connection setup ▼ ▼ ▼
//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//*****//

const db = mysql.createConnection({

    host: 'alfred.cs.uwec.edu',
    user: 'keithse2556',
    password: 'WYQ5S334',
    database: 'keithse2556'

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

const app = express();
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

const server = app.listen(port, function() {
    console.log('Server started at localhost:' + port);
});

server.on('upgrade', (request, socket, head) => {

    socketServer.handleUpgrade(request, socket, head, socket => {

        socketServer.emit('connection', socket, request);

    })

});
