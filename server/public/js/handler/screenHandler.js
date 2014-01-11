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