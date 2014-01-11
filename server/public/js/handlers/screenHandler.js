var app = {};

app.sW = window.innerWidth;
app.sH = window.innerHeight;
app.load = function() {
	window.addEventListener('load', function() {
		app.sW = window.innerWidth;
		app.sH = window.innerHeight;
	});
};
app.resize = function() {
	window.addEventListener('resize', function() {
		app.sW = window.innerWidth;
		app.sH = window.innerHeight;
	});
};

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

function numberToColor(x) {
		switch (x) {
		case 1:
			return '#990000';
		case 2:
			return '#fc1d4c';
		case 3:
			return '#fd3aa8';
		case 4:
			return '#fe701e';
		case 5:
			return '#fcba0a';
		case 6:
			return '#9bed00';
		case 7:
			return '#14c431';
		case 8:
			return '#0ccbcb';
		case 9:
			return '#1e89c7';
		case 10:
			return '#103ba1';
		case 11:
			return '#4329a1';
		case 12:
			return '#9f26bd';
		case 13:
			return '#560369';
	}
}