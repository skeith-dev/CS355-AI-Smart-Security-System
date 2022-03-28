var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);


app.get('/', function (req, res) {
  res.send('running');
})

io.on('connection', function (socket) {
  socket.on('data', function (data) {
    console.log(data);
  })
})

http.listen(5000, function () {
  console.log('listening on *:5000');
})