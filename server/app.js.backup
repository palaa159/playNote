// DO SUDO NODE APP.JS to run app in port 80

var connect = require('connect'),
	fs = require('fs'),
	util = require('util'),
	moment = require('moment'),
	io = require('socket.io').listen(9001), // WS port
	port = 80; // HTTP port

connect.createServer(
	connect.static(__dirname + '/public') // two underscores
).listen(port);

util.log('the server is running on port: ' + port);
//
var currSong = {
	name: null,
	currSeq: 0,
	seq: []
};

var app = {
	players: [],
	display: null,
	possibleNotes: [], // also equals player capacity
	availableNotes: [],
	isDisplayOn: false, // gotta check everytime
	showPlayers: function() {
		util.log('total players: ' + app.players.length);
		util.log(JSON.stringify(app.players));
		util.log('Available Notes: ' + app.availableNotes.toString());
		// return app.players.length;
	},
	updatePlayer: function() {
		util.log('######## update player #########');
		app.showPlayers();
		// // should start game or should terminate game
		// if (app.players.length >= 2) {
		// 	util.log('enough player');
		// 	// you can start game
		// 	io.sockets.socket(app.display).emit('two or more');
		// } else if(app.players.length <= 1) {
		// 	// oops, terminate
		// 	util.log('not enough player');
		// 	io.sockets.socket(app.display).emit('not enough');
		// }
		// util.log('update to display');
		io.sockets.socket(app.display).emit('update player', {
			players: app.players
		});
	},
	assignNote: function(name) {
		util.log('Before assigning availableNotes: ' + app.availableNotes);
		var rand = (Math.floor(Math.random() * app.availableNotes.length));
		var x = app.availableNotes[rand];
		// report the resultx
		util.log('Assigning note: ' + x + ' to ' + name);
		// remove
		app.availableNotes.splice(rand, 1);
		util.log('After assigning availableNotes: ' + app.availableNotes.toString());
		return x;
	},
	startGame: function() {
		var songLength = currSong.seq.length;
			currSong.currSeq = 0;
			to = app.players[findIndexWithAttr(app.players, 'note', currSong.seq[currSong.currSeq])];
		// first seq
		if (to !== undefined) { // if hasPlayer
			io.sockets.socket(app.display).emit('note to display', {
				hasPlayer: true,
				note: currSong.seq[currSong.currSeq]
			});
			io.sockets.socket(to.id).emit('player turn');
		} else { // if not hasPlayer
			io.sockets.socket(app.display).emit('note to display', {
				hasPlayer: false,
				note: currSong.seq[currSong.currSeq]
			});
		}
		// util.log('sending note: ' + currSong.seq[currSong.currSeq] + ' to ' + to.name);
		// socket.on('player success', function() {
		// 	seq++;
		// 	io.sockets.socket(to.id).emit('player turn');
		// 	util.log('sending note: ' + currSong.seq[currSong.currSeq] + ' to ' + to.name);
		// });
		// socket.on('player fail', function() {
		// 	seq++;
		// 	io.sockets.socket(to.id).emit('player turn');
		// 	util.log('sending note: ' + currSong.seq[currSong.currSeq] + ' to ' + to.name);
		// });
		return false;
	},
	nextTurn: function() {
		currSong.currSeq++;
		// 
		var to = app.players[findIndexWithAttr(app.players, 'note', currSong.seq[currSong.currSeq])];
		console.log('next note is: ' + currSong.seq[currSong.currSeq]);
		if (to !== undefined) { // if hasPlayer
			io.sockets.socket(app.display).emit('note to display', {
				hasPlayer: true,
				note: currSong.seq[currSong.currSeq]
			});
			io.sockets.socket(to.id).emit('player turn');
		} else { // if not hasPlayer
			io.sockets.socket(app.display).emit('note to display', {
				hasPlayer: false,
				note: currSong.seq[currSong.currSeq]
			});
		}
		return false;
	},
	displayDisconnect: function() {
		// do the reset
		// reset every players to intro
		app.display = null;
		app.isDisplayOn = false;
		app.possibleNotes = [];
		app.players = [];
		io.sockets.emit('reset player');
	},
	isStarted: false
};

io.set('log level', 1);
io.sockets.on('connection', function(socket) {
	util.log('############ Welcome to playNote! ############');
	socket.emit('init', {
		msg: 'hello user'
	});
	socket.on('displayStart', function() {
		if (app.display == null) {
			app.display = socket.id;
			app.isDisplayOn = true;
			util.log('the display has join with ID: ' + app.display);
			socket.emit('display ok');
		} else { // now you open two display (not good), I'll give you a warning
			socket.emit('duplicate display');
		}
	});
	// When a player connected
	socket.on('playerInfo', function(data) {
		// display is on && doesn't exceed app.possibleNotes.length
		if (app.isDisplayOn && app.players.length <= app.possibleNotes.length) {
			// add this player to players array
			app.players.push({
				name: data.name,
				id: socket.id,
				note: app.assignNote(data.name) // assign random note
			});
			// send info back to user
			socket.emit('playerInfo', app.players[findIndexWithAttr(app.players, 'id', socket.id)]);
			util.log('the player: [[' + data.name + ']] is added');
			app.updatePlayer();
		} else {
			// sorry player
			util.log('sorry player, the game is full');
		}
	});
	// receive note
	socket.on('send song', function(data) {
		// pick the song
		// util.log(JSON.stringify(data.song));
		currSong.name = data.song.name;
		currSong.seq = data.song.seq;
		util.log('song received: ##### ' + JSON.stringify(currSong));
		// update possible notes & available note [seat for player]
		getAllNotes();
	});
	// game start
	socket.on('start game', function() {
		app.startGame();

		// var songPlayer = setInterval(function() {
		// 	// send to player
		// 	var to = app.players[findIndexWithAttr(app.players, 'note', currSong.seq[seq])];
		// 	if (to !== undefined) {
		// 		io.sockets.socket(to.id).emit('your turn');
		// 		util.log('sending note: ' + currSong.seq[seq] + ' to ' + to.name);
		// 	} else {
		// 		// not send to player, cuz it doesn't exist
		// 	}
		// 	// send to display
		// 	if (seq == currSong.seq.length) {
		// 		io.sockets.socket(app.display).emit('note to display', {
		// 			note: currSong.seq[seq],
		// 			nextNote: 'Finish'
		// 		});
		// 	} else {
		// 		io.sockets.socket(app.display).emit('note to display', {
		// 			note: currSong.seq[seq],
		// 			nextNote: currSong.seq[seq + 1]
		// 		});
		// 	}
		// 	// terminate if end
		// 	if (seq == currSong.seq.length) {
		// 		clearInterval(songPlayer);
		// 	} else {
		// 		seq++;
		// 	}
		// }, 1000);
	});
	// next note
	socket.on('next turn', function() {
		app.nextTurn();
	});
	// player success
	socket.on('player success', function() {
		util.log('player SUCCESS');
		// play audio
		io.sockets.socket(app.display).emit('play audio', {
			note: currSong.currSeq
		});
		setTimeout(function() {
			console.log('next note');
			app.nextTurn();
		}, 500);
		
	});
	socket.on('player fail', function() {
		util.log('player FAIL');
		setTimeout(function() {
			console.log('next note');
			app.nextTurn();
		}, 500);
	});
	// when something disconnect
	socket.on('disconnect', function() {
		util.log('the user: ' + socket.id + ' just disconnected');
		// return note
		if (app.players[findIndexWithAttr(app.players, 'id', socket.id)] !== undefined) {
			app.availableNotes.push(app.players[findIndexWithAttr(app.players, 'id', socket.id)].note);
		}
		// remove player
		app.players.splice(findIndexWithAttr(app.players, 'id', socket.id), 1);
		app.updatePlayer();
		// if display, remove display
		if (socket.id == app.display) {
			app.displayDisconnect();
		}
	});
});

/// Helpers //////////////////////////////////////////////////////////////////////////////////
/// get key by value

function getAllNotes() {
	// get all the unique values in an array
	app.possibleNotes = currSong.seq.unique().remove(0);
	util.log('all possible notes are: ' + app.possibleNotes.toString());
	app.availableNotes = app.possibleNotes;
	util.log('all available notes are: ' + app.availableNotes.toString());
}

function findIndexWithAttr(array, attr, value) {
	for (var i = 0; i < array.length; i += 1) {
		if (array[i][attr] === value) {
			return i;
		}
	}
}

Object.prototype.getKeyByValue = function(value) {
	for (var prop in this) {
		if (this.hasOwnProperty(prop)) {
			if (this[prop] === value)
				return prop;
		}
	}
};

Array.prototype.contains = function(v) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] === v) return true;
	}
	return false;
};

Array.prototype.unique = function() {
	var arr = [];
	for (var i = 0; i < this.length; i++) {
		if (!arr.contains(this[i])) {
			arr.push(this[i]);
		}
	}
	return arr;
};

Array.prototype.remove = function() {
	var what, a = arguments,
		L = a.length,
		ax;
	while (L && this.length) {
		what = a[--L];
		while ((ax = this.indexOf(what)) !== -1) {
			this.splice(ax, 1);
		}
	}
	return this;
};