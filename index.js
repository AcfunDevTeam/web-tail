

var koa = require("koa");
var http = require("http");
var koastatic = require("koa-static");
var fs = require('fs');
var path = require('path');
var Router = require('koa-router');
var index = new Router();
var mount = require('koa-mount');
var co  = require("co");
var app = koa();


index.get("/dirlist", function*(){

	var files = yield readDir(this.query.dir);


	this.body = files;

});


app.use(koastatic("public/"));

app.use(mount("/", index.middleware()));


var tail = require("./lib/tail");

var dirs = require("./config.json");



var server = require('http').createServer();
var io = require('socket.io').listen(server);

// io.set('transports', ['websocket','flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']);
io.on('connection', function(socket){


	socket.on("requestdirs", function(data){


		socket.emit("dirs", dirs);
	});

	socket.on("requestfiles", function(data){

		co(function*(){

			var files = yield readDir(data.path);
			socket.emit("files", {files: files, path: data.path});

		}).catch(function(e){
			console.log(e)
		})
	});


	socket.on("request", function(data){


		tail(data.path, socket);

		console.log(data);
		
	});

})


server.listen(9999);
app.listen(9998);

// [

// 		"/Users/aki/Desktop/Lockets",
// 		"/Users/aki/Desktop/lolitaserver"
// 	];



// app.listen(9000);




function readDir(logDir){


	return function(done){
		// look up the dir for logs
		fs.readdir(logDir, function(err, files){

			if(err) {
				return done(err);
			}

			var logFiles = [];

			// Fix the Array
			files = Array.prototype.sort.apply(files,[]);

			files.forEach(function(file) {
				
				var filePath = path.join(logDir, file);
				var isFile = fs.statSync(filePath).isFile();
				
				if(file.indexOf(".") === 0) return;
				if(isFile) {
				  logFiles.push(file);
				}
			});

			done(null, logFiles);
		});
	};
}