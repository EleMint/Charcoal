const express = require('express');
const app = express();
var server = app.listen(3000, '192.168.0.128');
const socket = require('socket.io');
var io = socket(server);

app.use(express.static('public'));

console.log('Server is now running....');

io.sockets.on('connection', function(socket){
    console.log(socket);
});
