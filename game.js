var io;
var gameSocket;

exports.initGame = function(sio, socket){
	io = sio;
	gameSocket = socket;
	gameSocket.emit('connected', { message: "You are connected"});

	gameSocket.on('hostCreateNewGame', hostCreateNewGame);
	gameSocket.on('hostRoomFull', hostPrepareGame);
	gameSocket.on('hostCountdownFinished', hostStartGame);
	gameSocket.on('hostRoundOver', hostRoundOver);
	gameSocket.on('hostNextRound', hostNextRound);

	gameSocket.on('playerJoinGame', playerJoinGame);
	gameSocket.on('playerChoseOption', playerChoseOption);
}


function hostCreateNewGame() {

	var thisGameId = ( Math.random() * 100000 ) | 0;

	this.emit('newGameCreated', {gameId: thisGameId, mySocketId: this.id});

	this.join(thisGameId.toString());

};

function hostPrepareGame(gameId) {
	var sock = this;
	var data = {
		mySocketId: sock.id,
		gameId: gameId
	};

	io.sockets.in(data.gameId).emit('beginNewGame', data);
}

function hostStartGame(gameId) {
	console.log('Game Started');
	startRound(0, gameId);
}

function hostRoundOver(data) {
	var sock = this;
	data.playerId = sock.id;
	io.sockets.in(data.gameId).emit('hostCheckAnswer', data);
}

function hostNextRound(data) {
	console.log('host next round');
	console.log(data);
	if (data.round < 3){
		startRound(data.round, data.gameId);
	}
	else
	{
		console.log('gameOver');
	}
}

function playerJoinGame(data) {
	var sock = this;

	var room = gameSocket.manager.rooms["/" + data.gameId];
	console.log("room - ");
	console.log(room);

	if(room != undefined){
		data.mySocketId = sock.id;

		sock.join(data.gameId);

		io.sockets.in(data.gameId).emit('playerJoinedRoom', data);
	} 
	else{
		this.emit('error', {message: "this room doen not exist"});
	}
}

function playerChoseOption(data) {
	var sock = this;

	var room = gameSocket.manager.rooms["/" + data.gameId];

	if (room != undefined){
		sock.join(data.gameId);
		io.sockets.in(data.gameId).emit('playerChosenOption', data);
	}
	else{
		this.emit('error', {message: "this room doen not exist"});
	}
}

function startRound(roundNo, gameId) {
	var data = {round: roundNo, list: ["rock", "paper", "scissor"]};
	console.log(gameId);
	io.sockets.in(gameId).emit('beginNewRound', data);
}
