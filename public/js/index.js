



angular.module('webtail', []).controller('webtailController', function($scope) {


	var el = document.getElementById("tail");

	$scope.name = "aki";

	$scope.dirs = [

	];
	$scope.logger = [];
	$scope.files = [

	];

	var socket = io.connect("http://127.0.0.1:8000",{transports: ['websocket', 'polling', 'flashsocket']});

	socket.on('connect', function() {
		log('Connected');

		socket.emit("requestdirs");
	});

	$scope.file = "";


	var currentPath = "", currentPathFile = "", append = true;
	$scope.selectfile = function(file){

		console.log($scope.file)

		append = false;

		var path = currentPath + "/" + $scope.file;


		currentPathFile = path;
			

		socket.emit("request", {path: path});
	};

	socket.on("files", function(data){

		$scope.files = data.files;
		console.log(data.files)

		$scope.$apply();

		console.log(currentPath + "/" + data.files[0])
		socket.emit("request", {path: currentPath + "/" + data.files[0]});

	});
	socket.on("dirs", function(data){

		$scope.dirs = data;
		$scope.$apply();

		var path = data[0];

		currentPath = path;


		socket.emit("requestfiles", {path: path});

	});

	socket.on("tail", function(data){

		if(data.path != currentPathFile){
			return;
		}

		if(append){
			$scope.logger = $scope.logger.concat(data.lines);
		}else{
			$scope.logger = data.lines;
		}
		append = true;
		$scope.$apply();

		document.getElementById("tail").scrollTop=20000000
	});


	function log(str){
		console.log(str)
	}
	
	socket.on('err', log);

	socket.on('message', log);


});