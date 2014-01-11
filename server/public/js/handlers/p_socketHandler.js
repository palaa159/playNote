var socket = io.connect('http://apon.local:9001');
socket.on('init', function(data) {
	console.log(data.msg);
	if (data.status !== undefined) {
		$('#playerCount').html(data.status);
	} else {
		$('#playerCount').html('server down!');
	}
	if (data.reset == true) {
		console.log('### you have been reset');
		bringToFront('pageLogin');
		player = {
			name: null,
			socketId: null,
			faults: 0
		};
	}
});