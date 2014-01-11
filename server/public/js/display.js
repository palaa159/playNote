// playNote 0.1 by Noa, Elizabeth, and Apon
// for Screen
console.log('loading main.js');

var app = {
	w: window.innerWidth,
	h: window.innerHeight,
	players: [],
	prevPlayers: [],
	playable: false,
	init: function() {
		// setup the display
		//
		socket.emit('displayStart'); // display is started
		socket.on('display ok', function() {
			$.ajax({
				dataType: 'script',
				url: '../compos.js',
				success: function(data) {
					console.log('compos loaded');
					// let's loop
					// random song
					var randSong = (Math.floor(Math.random() * compos.length));
					app.checkMinimumPlayer(randSong);
				}
			});
		});
		socket.on('duplicate display', function() {
			// if you're duplicating the display
			// alert('CLOSE ANOTHER DISPLAY! YOU CANT HAVE MORE THAN ONE DISPLAY');
		});
		console.log('init app');
		// load all compos from a json file
	},
	checkMinimumPlayer: function(songSeq) {
		console.log('checking for minimum player . . . . ');
		console.log('the first song is gonna be ###### ' + compos[songSeq].name);
		// Send the song
		socket.emit('send song', {
			song: compos[songSeq]
		});

		goToByScroll('d_intro');
		// update player
		socket.on('update player', function(data) {
			app.prevPlayers = app.players;
			app.players = data.players;
			console.log('received player info');
			// update song + player
			$('#currSong').html(compos[songSeq].name);
			$('#currPlayers').html(JSON.stringify(app.players));
			// update player needed
			$('#d_intro_waiting_number').html(2 - app.players.length);
			if(app.players.length == 2) {
				console.log('Hooray! let us play');
				playable = true;
				// if prev == app.players.length
				// only if prev app.players.length == 1
				if(app.prevPlayers.length == 1) {
					app.countdown(songSeq);
				}
			} else if(app.players.length < 2) {
				playable = false;
				goToByScroll('d_intro');
			}
		});
		socket.on('add walker', function(data) {
			new walker(data.name);
			// addWalker(data);
		});
		socket.on('remove walker', function(data) {
			$('#' + data.name).remove();
			// removeWalker(data);
		});
	},
	countdown: function(songSeq) {
		$('.d_lobby_p_nextSong').html(compos[songSeq].name);
		var timer = 1;
		$('#d_lobby_countdown').html(timer);
		goToByScroll('d_lobby');
		// init counter
		var countFive = new Countdown({
			seconds: timer, // number of seconds to count down
			onUpdateStatus: function(sec) {
				$('#d_lobby_countdown').html(sec);
				console.log(sec);
			}, // callback for each second
			onCounterEnd: function() {
				setTimeout(function() {
					app.game(songSeq);
				}, 1000);
			}
		});
		countFive.start();
	},
	game: function(song) {
		goToByScroll('d_game');
		centerObj('#d_playingNote_container');
		var n = 0;
		var songPlay = 0;
		var songTotal = compos.length;
		// let's start
		socket.emit('start game');
		//testing
		socket.on('test note', function(data) {
			$('#d_playingNote').html(data.note + '-> ' + data.nextNote);
		});
		// end of testing
		socket.on('note to play', function(data){ // only to display on the screen
			var note = data.note,
				hasPlayer = data.hasPlayer;
				if(!hasPlayer) { // if doesn't have player
					// auto play
					console.log('auto play: ' + data.note);
					audio.play(data.note, 1, 1, 1);
					// next turn
					setTimeout(function() {
						socket.emit('next turn');
					}, 300);
				}
		});
		socket.on('play audio', function(data) { // from player
			console.log(data);
			d('playing note: ' + numberToNote(data.note.note));
			audio.play(data.note.note, 1, 1, 1);
			setTimeout(function() {
				socket.emit('next turn');
			}, 300);
			return false;
		});
		socket.on('play oink', function() {
			d('### OINK OINK');
			audio.play(15, 1, 1, 1);
			return false;
		});
	}
};

var audio = {
	play: function(note, multiplier, panX, panY) {
		playSound(note, multiplier, panX, panY);
	}
};

// init playNote
app.init();


// Helpers //////////////////////////////////////////////////////////////////////////////
function d(x) {
	console.log('### ' + x);
}

function centerObj(a) {
	$(a).css({
		position: 'absolute',
		top: app.h/2,
		left: app.w/2
	});
}

function goToByScroll(id) {
	// Remove "link" from the ID
	id = id.replace("link", "");
	// Scroll
	$('html,body').animate({
			scrollTop: $("#" + id).offset().top
		},
		'slow');
	return 'scrolling to ' + id;
}

function Countdown(options) {
	var timer,
		instance = this,
		seconds = options.seconds || 10,
		updateStatus = options.onUpdateStatus || function() {},
		counterEnd = options.onCounterEnd || function() {};

	function decrementCounter() {
		updateStatus(seconds);
		if (seconds === 0) {
			counterEnd();
			instance.stop();
		}
		seconds--;
	}

	this.start = function() {
		clearInterval(timer);
		timer = 0;
		seconds = options.seconds;
		timer = setInterval(decrementCounter, 1000);
	};

	this.stop = function() {
		clearInterval(timer);
	};
}

function numberToNote(x) {
	switch (x) {
		case 1:
			return 'C';
		case 2:
			return 'C#';
		case 3:
			return 'D';
		case 4:
			return 'D#';
		case 5:
			return 'E';
		case 6:
			return 'F';
		case 7:
			return 'F#';
		case 8:
			return 'G';
		case 9:
			return 'G#';
		case 10:
			return 'A';
		case 11:
			return 'A#';
		case 12:
			return 'B';
		case 13:
			return 'C2';
	}
}