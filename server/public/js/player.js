// JS for Player

console.log('loading player.js');
// inject fastClick
$(function() {
	FastClick.attach(document.body);
});

var player = {
	name: null,
	socketId: null,
	faults: 0,
	hasClicked: false
};

var playerApp = {
	clickable: false,
	width: null,
	height: null,
	checkExistTimer: null,
	load: function(offsetFix) {
		// setting up pages
		playerApp.width = window.innerWidth;
		playerApp.height = window.innerHeight;
		$('.page').each(function(i) {
			$('.page').eq(i).css({
				'z-index': i * -1,
			});
		});
		// center page content
		$('.pageContainer').each(function(i) {
			var which = $('.pageContainer').eq(i),
				w = which.width(),
				h = which.height();
			// here is how I center the pageContainer
			which.css({
				top: playerApp.height / 2 - h / 2,
				left: playerApp.width / 2 - w / 2 + offsetFix
			});
		});
	},
	init: function() {
		bringToFront('pageLogin');
		$('#pJoinBtn').click(function() {
			// check for name length
			var pVal = $('#pNameIpt').val();
			if (pVal.length > 2) {
				// you're good
				console.log(pVal);
				// send information to server
				socket.emit('playerInfo', {
					name: pVal
				});
				socket.on('playerInfo', function(data) {
					playerApp.lobby();
					console.log('info received: ' + data.name);
					$('#userName').html(data.name);
					$('#assignedNote').html(numberToNote(data.note));
					// change bg according to note
					$('#pageLobby, #pageGame').css({
						background: numberToColor(data.note)
					});
				});
				socket.on('room full', function() {
					alert('The game is full. Try again, will ya?');
				});
			} else {
				alert('Your name is a bit too short, try again');
				// reset
				$('#pNameIpt').val('');
			}
		});
	},
	lobby: function() {
		bringToFront('pageLobby');
		console.log('loading lobby');
		// goToByScroll('pageLobby');
		$('#pJoinBtn2').click(function() {
			// player is ready
			socket.emit('join game');
			playerApp.game();
		});
		setTimeout(function() {
			socket.emit('join game');
			playerApp.game();
		}, 3000);
	},
	game: function() {
		// penalty
		playerApp.checkExistTimer = setInterval(function() {
			if(!hasClicked) {
				// kick player
				playerApp.end();
			}
		}, 20000);
		bringToFront('pageGame');
		// goToByScroll('pageGame');
		var note, timeout;
		socket.on('player turn', function(data) {
			note = data;
			console.log('### IT IS YOUR TURN ###');
			playerApp.clickable = true;
			// lower the bar
			// now!
			$('.wait').html('Now!');
			// timer need to be fixed
			var timeout = setTimeout(function() {
				if (playerApp.clickable) {
					socket.emit('player fail', note);
					$('.wait').html(':(<br>Wait for it ...');
					playerApp.clickable = false;
				}
			}, 1500);
		});
		$('#pageGame').click(function() {
			player.hasClicked = true;
			if (playerApp.clickable) {
				playerApp.clickable = false;
				// clear timeout
				clearTimeout(timeout);
				$('.wait').html(':)<br>Wait for it ...');
				socket.emit('player success', note);
			} else {
				// play OINK, you missed
				$('.wait').html('BOOOOOOO ...');
				socket.emit('play oink');
			}
		});
	},
	end: function() {
		bringToFront('end');
		clearInterval(playerApp.checkExistTimer);
		// remove player from server
		socket.emit('remove player');
	}
};
// init playerApp
playerApp.load(0);
playerApp.init();

window.addEventListener('resize', function() {
	// playerApp.load(0);
});
// helper
// note translation

function bringToFront(id) {
	$('.page').css({
		'z-index': 0
	});
	$('#' + id).css({
		'z-index': 1
	});
}

function disableListenScroll() {
	window.removeEventListener('scroll', false);
}

function goToByScroll(id) {
	var pos = $("#" + id).offset().left + 1;
	// Remove "link" from the ID
	id = id.replace("link", "");
	// Scroll
	// disable onscroll
	$('html,body').animate({
		scrollLeft: pos
	}, {
		duration: 100,
		complete: function() {
			console.log('finished');
			// window.addEventListener('scroll', function() {
			// 	window.scrollTo(pos, 0);
			// }, false);
		}
	});
	return 'scrolling to ' + id;
}

function getBgColor() {
	var h = Math.floor(Math.random() * 360) + 1,
		s = 100,
		l = 60;
	return 'hsl(' + h + ',' + s + '%,' + l + '%' + ')';
}