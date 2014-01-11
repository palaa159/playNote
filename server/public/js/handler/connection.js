var socket = io.connect('http://localhost:9001');
socket.on('init', function(data) {
	console.log(data.msg);
});