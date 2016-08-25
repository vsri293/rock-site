;
jQuery(function($){
	'use strict';

	var IO = {
		init: function() {
			IO.socket = io.connect();
			IO.bindEvents();
		},

		bindEvents: function() {
			IO.socket.on('connected', IO.onConnected);
			IO.socket.on('newGameCreated', IO.onNewGameCreated);
			IO.socket.on('playerJoinedRoom', IO.playerJoinedRoom);
			IO.socket.on('beginNewGame', IO.beginNewGame );
			IO.socket.on('beginNewRound', IO.beginNewRound);
			IO.socket.on('hostCheckAnswer', IO.hostCheckAnswer);
			IO.socket.on('playerChosenOption', IO.playerChosenOption);
		},

		onConnected: function(data) {
			App.mySocketId = IO.socket.socket.sessionid;
			console.log(App.mySocketId);
		},

		onNewGameCreated: function(data) {
			App.Host.gameInit(data);
		},

		playerJoinedRoom: function(data) {
			App[App.myRole].updateWaitingScreen(data);
		},

		beginNewGame: function(data){
			console.log("begin");
			App[App.myRole].gameCountdown(data);
		},

		beginNewRound: function(data){
			console.log('begin new round');
			console.log(data);
			if (data.round == 0)
			{
				App.currentRound = data.round;
				App[App.myRole].newRound(data);
			}
			else
			{
				App.currentRound = data.round;
				App[App.myRole].nextRound(data);
			}
		},

		hostCheckAnswer: function(data){
			if (App.myRole == 'Host') {
				App.Host.roundWinner(data);
			}
		},

		playerChosenOption: function(data){
			if (App.myRole == 'Host') {
				App.Host.assignPlayerOption(data);
			}
		}
	};
	var App = {
		mySocketId: '',
		myRole: '',
		gameId: 0,
		currentRound: 0,


		init: function () {
			App.cacheElements();
			App.showInitScreen();
			App.bindEvents();

			FastClick.attach(document.body);
		},

		cacheElements: function () {
			App.$doc = $(document);

			App.$gameArea = $('#gameArea');
			App.$templateIntroScreen = $('#intro-screen-template').html();
			App.$templateNewGame = $('#create-game-template').html();
			App.$templateJoinGame = $('#join-game-template').html();
			App.$hostGame = $('#host-game-template').html();
			App.$playerGame = $('#player-game-template').html();
		},

		bindEvents: function () {
			App.$doc.on('click', '#btnCreateGame', App.Host.onCreateClick);
			App.$doc.on('click', '#btnJoinGame', App.Player.onJoinClick);
			App.$doc.on('click', '#btnStart', App.Player.onPlayerStartClick);
			App.$doc.on('click', '.btnAnswer', App.Player.onPlayerAnswerClick);
		},

		showInitScreen: function() {
			App.$gameArea.html(App.$templateIntroScreen);
			App.doTextFit('.title');
		},

		Host : {
			players : [],
			numPlayersInRoom: 0,
			isNewGame: false,
			currentRound: 0,
			player1Option: 'rock',
			player2Option: 'rock',

			onCreateClick: function () {
				console.log('create click');
				IO.socket.emit('hostCreateNewGame');
			},

			gameInit: function (data) {
				App.gameId = data.gameId;
				App.mySocketId = data.mySocketId;
				App.myRole = 'Host';
				App.Host.numPlayersInRoom = 0;

				App.Host.displayNewGameScreen();
			},

			displayNewGameScreen: function() {
				App.$gameArea.html(App.$templateNewGame);

				$('#gameURL').text(window.location.href);
				App.doTextFit('#gameURL');

				$('#spanNewGameCode').text(App.gameId);
			},

			updateWaitingScreen: function(data) {
				console.log('update host');
				console.log(data);
				if (App.Host.isNewGame){
					App.Host.displayNewGameScreen();
				}

				$('#playersWaiting')
					.append('<p/>')
					.text('Player ' + data.playerName + ' joined the game.');

				App.Host.players.push(data);
				App.Host.numPlayersInRoom += 1;

				if (App.Host.numPlayersInRoom == 2) {
					IO.socket.emit('hostRoomFull', App.gameId);
				}
			},

			gameCountdown: function(){

				App.$gameArea.html(App.$hostGame);
				App.doTextFit('#hostWord');

				var $secondsLeft = $('#hostWord');
				App.countDown($secondsLeft, 5, function(){
					console.log('game will start now');
					IO.socket.emit('hostCountdownFinished', App.gameId);
				});

				$('#player1Score')
					.find('.playerName')
					.html(App.Host.players[0].playerName);

				$('#player2Score')
					.find('.playerName')
					.html(App.Host.players[1].playerName);

				$('#player1Score').find('.score').attr('id',App.Host.players[0].mySocketId);
				$('#player2Score').find('.score').attr('id',App.Host.players[1].mySocketId);

			},

			newRound: function(data){
				$('#hostWord').text(10);
				console.log("new round");
				console.log(data);
				App.doTextFit('#hostWord');
				var $secondsLeft = $('#hostWord');

				App.countDown($secondsLeft, 10, function(){
					IO.socket.emit('hostRoundOver', data);
				});
				App.Host.currentRound = data.round;
			},

			nextRound: function(data){
				console.log('next round ');
				console.log(data.p1Option);
				console.log(data.p2Option);
				App.Host.newRound(data);
			},

			roundWinner: function(data) {
				console.log('roundWinner');
				if (data.round == App.currentRound){
					var p1option = App.Host.player1Option;
					var p2option = App.Host.player2Option;
					var winner = 0;
					if (p1option == 'rock'){
						if (p2option == 'scissor'){
							winner = 1;
						}
						else if (p2option == 'paper'){
							winner = 2;
						}
						else
						{
							winner = 0;
						}
					}
					if (p1option == 'scissor'){
						if (p2option == 'paper'){
							winner = 1;
						}
						else if (p2option == 'rock'){
							winner = 2;
						}
						else
						{
							winner = 0;
						}
					}
					if (p1option == 'paper'){
						if (p2option == 'rock'){
							winner = 1;
						}
						else if (p2option == 'scissor'){
							winner = 2;
						}
						else
						{
							winner = 0;
						}
					}

					console.log(winner);
					if (winner > 0)
					{
						var winnerId = App.Host.players[winner-1].mySocketId;
						console.log(winnerId);
						var $pScore = $('#' + winnerId);
						var curr_score = $pScore.text();
						console.log(curr_score);
						var new_score = parseInt(curr_score) + 1;
						console.log(new_score);
						$pScore.text(new_score);
						
					}
					App.currentRound += 1;
					data.round += 1;
					data.gameId = App.gameId;
					data.p1Option = p1option;
					data.p2Option = p2option;
					data.winner = winner;
					IO.socket.emit('hostNextRound', data);
				}
			},

			assignPlayerOption: function(data) {
				var pl = App.Host.players;
				// console.log(App.Host.players);
				var playerId = data.playerId;
				// console.log(data);
				if (pl[0].mySocketId == playerId)
					App.Host.player1Option = data.answer;
				else
					App.Host.player2Option = data.answer;	
				// console.log(App.Host.player1Option);
				// console.log(App.Host.player2Option);
			}
		},

		Player : {

			myName: '',
			playerOption: 'rock',

			onJoinClick: function () {
				console.log('create join');
				App.$gameArea.html(App.$templateJoinGame);
			},

			onPlayerStartClick: function() {
				var data = {
					gameId: ($('#inputGameId').val()),
					playerName: $('#inputPlayerName').val() || 'hp'
				};

				IO.socket.emit('playerJoinGame', data);

				App.myRole = 'Player';
				App.Player.myName = data.playerName;
			},

			updateWaitingScreen: function(data) {
				if (IO.socket.socket.sessionid == data.mySocketId){
					App.myRole = 'Player';
					App.gameId = data.gameId;

					$('#playerWaitingMessage')
						.append('<p>')
						.text('Joined Game ' + data.gameId + '. Please wait for game to begin.');
				}
			},

			gameCountdown: function(hostData) {
				App.Player.hostSocketId = hostData.mySocketId;
				$('#gameArea')
					.html('<div class="gameOver">Get Ready!</div>');
			},

			newRound: function(data){
				App.$gameArea.html(App.$playerGame);
				var $list = $('<ul/>').attr('id', 'ulAnswers');

				$.each(data.list, function(){
					$list
						.append( $('<li/>')
							.append( $('<button/>')
								.addClass('btnAnswer')
								.addClass('btn')
								.val(this)
								.html(this)
							)
						)
				});
				var $roundNo = '<p/>Round ' + App.currentRound;
				
				$('#roundNo').html($roundNo);
				var $secondsLeft = $('#countTime');
				var startTime = 10;
				var timer = setInterval(countItDown, 1000);
				function countItDown() {
					startTime -= 1;
					$secondsLeft.text(startTime);
					if (startTime <= 0)
					{
						clearInterval(timer);
					}
				}
				$('#playerOption').html($list);
				// $('#gameArea').html($list);

			},

			nextRound: function(data){
				console.log(data.p1Option);
				console.log(data.p2Option);
				var result = "DRAW";
				var currPlayer;
				if (data.winner == 0){

				}
				else{
					if (App.Player.playerOption == data.p1Option)
						currPlayer = 1;
					else
						currPlayer = 2;

					if (currPlayer == data.winner)
						result = "YOU WON";
					else
						result = "YOU LOSE";
				}
				var $notify = '<p class="center-text">'+result +'</p>';
				$('#playerOption').html($notify);
				console.log(result);
				App.Player.newRound(data);
			},

			onPlayerAnswerClick: function() {

				var $btn = $(this);
				var answer = $btn.val();

				var data = {
					gameId: App.gameId,
					playerId: App.mySocketId,
					answer: answer,
					round: App.currentRound
				} 
				
				console.log('answer click');
				console.log(App.mySocketId);
				$('#playerOption').html('<p class="center-text"/>You chose ' + answer);
				IO.socket.emit('playerChoseOption', data);
				// App.Host.playerOption = answer;
			}
		},

		countDown: function($el, startTime, callback) {
			$el.text(startTime);
			App.doTextFit('#hostWord');

			var timer = setInterval(countItDown, 1000);

			function countItDown(){
				startTime -= 1;
				$el.text(startTime);
				App.doTextFit('#hostWord');

				if( startTime <= 0 ){
					clearInterval(timer);
					callback();
					return;
				}
			}
		},

		doTextFit : function(el) {
            textFit(
                $(el)[0],
                {
                    alignHoriz:true,
                    alignVert:false,
                    widthOnly:true,
                    reProcess:true,
                    maxFontSize:100
                }
            );
        }
	};
	IO.init();
	App.init();
}($));