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
		io.sockets.emit('init', {
			status: app.possibleNotes.length - app.players.length + ' seat(s) left!',
			reset: false
		});
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
	// test start
	testStart: function() {
		console.log('### TEST START ############################');
		currSong.currSeq = 0;
		// var testInterval = setInterval(function() {
		app.playNote(0);

	},
	playNote: function(seq) {
		io.sockets.socket(app.display).emit('test note', {
			note: currSong.seq[seq],
			nextNote: currSong.seq[currSong.currSeq + 1]
		});
		var to = app.players[findIndexWithAttr(app.players, 'note', currSong.seq[seq])];
		if (to !== undefined) { // if hasPlayer
			console.log('### IT IS YOUR TURN! ####');
			io.sockets.socket(to.id).emit('player turn', {
				note: currSong.seq[seq]
			});
		} else { // if not hasPlayer
			io.sockets.socket(app.display).emit('note to play', {
				hasPlayer: false,
				note: currSong.seq[seq]
			});
		}
		return false;
	},
	nextTurn: function() {
		console.log('### NEXT TURN!! ###');
		currSong.currSeq++;
		// 
		app.playNote(currSong.currSeq);
		return false;
	},
	removePlayer: function(id) {
		util.log('the user: ' + id + ' just disconnected');
		// return note
		if (app.players[findIndexWithAttr(app.players, 'id', id)] !== undefined) {
			app.availableNotes.push(app.players[findIndexWithAttr(app.players, 'id', id)].note);
		}
		// remove player
		app.players.splice(findIndexWithAttr(app.players, 'id', id), 1);
		app.updatePlayer();
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
		msg: 'hello user',
		status: app.possibleNotes.length - app.players.length + ' seat(s) left!',
		reset: true
	});
	socket.on('displayStart', function() {
		if (app.display == null) {
			app.display = socket.id;
			app.isDisplayOn = true;
			util.log('the display has join with ID: ' + app.display);
			io.sockets.emit('init', {
				msg: 'hello user',
				status: app.possibleNotes.length - app.players.length + ' seat(s) left!',
				reset: true
			});
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
			// add walker
			io.sockets.socket(app.display).emit('add walker', data);
			util.log('the player: [[' + data.name + ']] is added');
			app.updatePlayer();
		} else {
			// sorry player
			socket.emit('room full');
			util.log('sorry player, the game is full');
		}
	});
	// receive note
	socket.on('send song', function(data) {
		// pick the song
		// util.log(JSON.stringify(data.song));
		currSong.currSeq = 0;
		currSong.name = data.song.name;
		currSong.seq = data.song.seq;
		util.log('song received: ##### ' + JSON.stringify(currSong));
		// update possible notes & available note [seat for player]
		getAllNotes();
	});
	// game start
	socket.on('start game', function() {
		// app.startGame();
		app.testStart();
	});
	// next note
	socket.on('next turn', function() {
		app.nextTurn();
	});
	// player success
	socket.on('player success', function(data) {
		util.log('player SUCCESS: ' + data.note);
		// play audio
		io.sockets.socket(app.display).emit('play audio', {
			note: data
		});
		return false;
	});
	socket.on('player fail', function(data) {
		util.log('player FAIL: ' + data.note);
		io.sockets.socket(app.display).emit('play audio', {
			note: data
		});
		io.sockets.socket(app.display).emit('play oink');
		return false;
	});
	socket.on('play oink', function() {
		console.log('OINK OINK');
		io.sockets.socket(app.display).emit('play oink');
		return false;
	});
	socket.on('remove player', function() {
		app.removePlayer(socket.id);
	});
	// when something disconnect
	socket.on('disconnect', function() {
		app.removePlayer(socket.id);
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