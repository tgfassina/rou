var socket = io.connect('127.0.0.1:3000');

var conf = {
	platformW: 200,
	screenW: 960,
	hPadding: 50
};

var canvas = document.getElementById('screen');
var c = canvas.getContext('2d');

var turn = 0;

var losses = 0;

var keyL = 0;
var keyR = 0;

var pos = {
	x: 480,
	y: 100,
	s: 0.5,
};

var players = {};

var platforms = [];

document.onkeydown = function(e) {
	if (e.keyCode === 37 && !keyL) {
		keyL = 0.1;
	}
	
	if (e.keyCode === 39 && !keyR) {
		keyR = 0.1;
	}
	
	if (e.keyCode === 81) {
		console.log(pos);
	}
};

document.onkeyup = function(e) {
	if (e.keyCode === 37) {
		keyL = 0;
	}
	
	if (e.keyCode === 39) {
		keyR = 0;
	}
};

function handleFall() {
	for (i in platforms) {
		if (
		pos.x > (platforms[i].x - conf.platformW/2)
		&&
		pos.x < (platforms[i].x + conf.platformW/2)
		) {
			if (pos.y+10 > platforms[i].y && pos.y+10 < platforms[i].y+25) {
				pos.y = platforms[i].y-8;
				pos.s = 0.5;
				return;
			}
		}
	}
	
	pos.y += pos.s;
	if (pos.s < 9) {
		pos.s *= 1.2;
	}
}

function handleDefeat() {
	if (pos.y > 550 || pos.y < -5) {
		pos.x = 480;
		pos.y = 200;
		pos.s = 0.5;
		
		losses++;
		console.log('DEFEATS: '+losses);
		socket.emit('defeat');
	}
}

function handlePlatforms() {
	if (!platforms.length) {
		return;
	}

	var last = platforms[platforms.length-1];
	if (last.y < -20) {
		platforms.pop();
	}
	
	for (i in platforms) {
		platforms[i].y -= 6;
	}
};

function handleSync() {
	turn++;
	
	if (turn >= 3) {
		turn = 0;
		socket.emit('position', {
			x: pos.x,
			y: pos.y,
			name: document.getElementById('nome').value
		});
	}
};

function drawOthers()	{
	for (i in players) {
		if (i != document.getElementById('nome').value) {
			c.fillStyle = '#AAA';
			c.fillRect(players[i].x-5, players[i].y-25, 10, 10);
		}
	}
};

function blit() {
	c.clearRect(0, 0, 960, 540);
	c.strokeRect(0.5, 0.5, 959, 539);
	
	//player
	c.fillStyle = '#F00';
	c.fillRect(pos.x-5, pos.y-5, 10, 10);
	
	drawOthers();
	
	//platforms
	c.fillStyle = '#222';
	for (i in platforms) {
		c.fillRect(platforms[i].x - conf.platformW/2, platforms[i].y, conf.platformW, 15);
	}
};

function loop() {
	setInterval(function() {
		if (keyL) {
			pos.x -= 6*keyL;
			if (keyL < 1) {
				keyL += 0.07;
			}
		}
		
		if (keyR) {
			pos.x += 6*keyR;
			if (keyR < 1) {
				keyR += 0.07;
			}
		}

		handleFall();
		handleDefeat();
		handlePlatforms();
		handleSync();
		
		blit();
	}, 20);
};

function start() {
	socket.emit('make-player', {name: document.getElementById('nome').value});
	socket.on('create-platform', function(data) {
		platforms.unshift({
			y: 540,
			x: data.x
		});
	});

	socket.on('sync-all', function(data) {
		players = data;
	});

	loop();
};