var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	res.sendFile(__dirname+'/index.html');
});

io.on('connection', function(socket){
	socket.on('message', function(){
		console.log('index.js');
	});
	console.log('a user connected');
	socket.on('chat message', function(msg){
		console.log(msg);
		// var data = msg.name + ": " + msg.my;
		io.emit('chat message', msg);
	});
	socket.on('disconnect', function(){
		io.emit('user disconnected');
	});
});

http.listen(3000, function(){
	console.log('listening in *:3000');
});