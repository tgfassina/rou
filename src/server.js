var app = require('http').createServer(handler);
var io = require('socket.io').listen(app, {log: false});
var fs = require('fs');
var players = {};

app.listen(3000);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {
	socket.on('defeat', function(data) {
		console.log('player defeated');
	});
	
	socket.on('position', function(data) {
		if (players[data.name] == undefined) {
			return;
		}
		players[data.name].x = data.x;
		players[data.name].y = data.y;
		players[data.name].timeout = new Date().getTime();
	});
	
	socket.on('make-player', function(data) {
		console.log('made');
		players[data.name] = {
			timeout: new Date().getTime()
		};
	});
});

setInterval(function() {
	var x = Math.random()*(960 - 2*50 - 200) + 50 + 200/2
	io.sockets.emit('create-platform', {x: x});
	
	for (i in players) {
		if ((new Date().getTime() - players[i].timeout) > 2000) {
			delete players[i];
			console.log('timeoutou');
		}
	};
}, 550);

setInterval(function() {
	io.sockets.emit('sync-all', players);
}, 50);

/*
var http = require('http');
var fs = require('fs');

var onRequest = function(req, res) {
	if (fs.existsSync(req.url.substring(1))) {
		res.write(fs.readFileSync(req.url.substring(1)).toString());
	}
};

var app = http.createServer(onRequest).listen(666);

var io = require('socket.io').listen(app);
io.sockets.on('connection', function() {
	console.log('CONECXION');
});
*/