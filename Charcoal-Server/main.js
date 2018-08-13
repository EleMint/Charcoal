const express = require('express');
const http = require('http').Server(express);
const io = require('socket.io').apply(http);
const path = require('path');
const url = require('url');

//app.get('/', function(request, responce){
//    responce.sendFile(__dirname, 'index.html');
//});

io.on('connection', function(socket){
    console.log('A user has connected.');
});

io.on('disconnection', function(socket){
    console.log('A user has disconnected.');
});

http.listen(3000, function(){
    console.log('Listening on *:3000.');
});
