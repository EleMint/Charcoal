const express = require('express');
const keys = require('./keys');
const firebase = require('firebase');
const app = express();
var server = app.listen(3000, '127.0.0.1');
const socket = require('socket.io');
var io = socket(server);
app.use(express.static('public'));

console.log('Server is now running....');

// Initialize Firebase
var config = {
    apiKey: keys.FirebaseAPIKey,
    authDomain: keys.FirebaseAuthDomain,
    databaseURL: keys.FirebaseURL,
    projectId: keys.FirebaseProjectId,
    storageBucket: keys.FirebaseStoragebucket,
    messagingSenderId: keys.FirebaseMessagingSenderId
};
firebase.initializeApp(config);
var database = firebase.database();
var auth = firebase.auth();

io.on('connection', function(socket){
    io.emit('user:connected');
    console.log('A User Has Joined');
    socket.on('request:APIKeys', function(){
        socket.emit('requested:APIKeys', keys);
    });
    socket.on('user:loggedIn', function(username){
        io.emit('user:loggedin', username);
    });
    socket.on('user:loggedOut', function(){
        io.emit('user:loggedout');
    });
    socket.on('message:outboundMessage', function(messageData){
        socket.emit('message:inboundMessage', messageData);
    });
    socket.on('group:newGroup', function(){
        socket.emit('group:servernewGroup');
    });
    socket.on('database:requestdatabaseandauth', function(){
        console.log('requested database', database);
        socket.emit('database:requesteddatabaseandauth', auth);
    });
    socket.on('disconnect', function(){
        io.emit('user:disconnected');
        console.log('A User Has Disconnected');
    });
});