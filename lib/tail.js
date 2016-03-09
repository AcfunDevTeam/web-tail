	


var fs = require('fs');
var path = require('path');

var backlog_size = 5000;

function streamData(fileName, start, end, socket) {

	var stream = fs.createReadStream(fileName, {
		'start': start,
		'end': end
	});

	stream.addListener("data", function(lines){

		lines = lines.toString('utf-8');
		lines = lines.slice(lines.indexOf("\n") + 1).split("\n");
		socket.emit('tail', {path: fileName, lines: lines});
	});

	return stream;
}



function getFileInfo(filePath, socket){
	
	fs.unwatchFile(filePath);

	fs.stat(filePath, function(err, stats) {

		if (err) {
			throw err;
		}

		if (stats.size === 0){
			return;
		}

		var start = (stats.size > backlog_size) ? (stats.size - backlog_size) : 0;
		
		streamData(filePath, start, stats.size, socket);

		// watch the file now
		fs.watchFile(filePath, function(curr, prev) {

			if(prev.size > curr.size) {
				return;
			}

			streamData(filePath, prev.size, curr.size, socket);

			lastFilePath = filePath;
		});
	});
}

module.exports = getFileInfo;
