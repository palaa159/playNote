// playNote 0.1 by Noa, Elizabeth, and Apon
// for Screen
console.log('loading main.js');

var app = {
	init: function() {
		console.log('init app');
		// load all compos from a json file
		$.ajax({
			dataType: 'script',
			url: '../compos.js',
			success: function(data) {
				console.log('compos loaded: ' + compos[0].seq);
				// let's loop
				app.checkMinimumPlayer();
			}
		});
	},
	checkMinimumPlayer: function() {
		// minimum = 2
		// call server asking for players number
		app.runtime();
	},
	runtime: function() {
		var n = 0;
		setInterval(function() {
			if (n < compos[0].seq.length)
			// load one compos
				audio.play(compos[0].seq[n], 1, 1, 1);
				n++;
		}, 500);
	}
};

var audio = {
	play: function(note, multiplier, panX, panY) {
		playSound(note, multiplier, panX, panY);
	}
};

// init playNote
app.init();