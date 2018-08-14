const io = require('socket.io-client');
const socket = io('http://142.93.200.15:3000'); // SSH Server
//const socket = io('http://192.168.0.128:3000'); // Local Server


socket.on('connect', function(socekt){
    console.log('Connected');
});


// Incoming Message
socket.on('message', function(data){
    console.log(message);
});

// // Send Message
// function sendMessage(message){
//     socket.emit('message', message);
// }