



angular.module('webtail', []).controller('webtailController', function($scope) {


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

		$scope.$apply();
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
	});


	function log(str){
		console.log(str)
	}
	
	socket.on('err', log);

	socket.on('message', log);


});