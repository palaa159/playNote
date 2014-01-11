var socket = io.connect('http://apon.local:9001');
socket.on('init', function(data) {
	console.log(data.msg);
});