var ctx;

//config object used to set the parameters of the game. This object is passed to the worker thread to initialize it
var config = new Object();
config.popSize = 50;
config.maxGenerations = 35;
config.maxRuns = 1;
config.mutateProb = 0.02;
config.selection = "rank";
config.fitness_order = "asc";
config.unique_chromosomes = false;
var worker;


function init(){
	worker = new Worker("ga-worker.js");
	worker.onerror = function(error) {  
		console.log(error.message);
	};
	
}


function knapsack_init(){
	stop();
	config.fitness_order = "asc";
	config.unique_chromosomes = true;
	config.chars = new Array();
	config.items = new Object();
	config.popSize = 250;
	config.maxGenerations = 1000;
	config.selection = $('#selection').val();
	
	$('#result').empty();
	draw();
	
	worker.onmessage = function(event) {
		handle_worker_message(event.data);
	};
	var message = new Object();
	message.act = "init";
	message.data = config;
	worker.postMessage(JSON.stringify(message));
}


function handle_worker_message(data){
	var resultObj = JSON.parse(data);
	if(resultObj.act == "debug"){
		console.log(resultObj.data);
		return false;
	}
	if(resultObj.act == "generation"){
		$('#status').html("Fitness: "+resultObj.data.fitness+"<br>");
		draw(resultObj.data.chromosome);
		return true;
	}
	if(resultObj.act == "answer"){
		$('#status').html("Done: Fitness: "+resultObj.data.fitness+"<br>");
		draw(resultObj.data.chromosome);
		return true;
	}
}

function draw(result){
	$('#result').html(result);
}

//pause the game
function stop(){
	var message = new Object();
	message.act = "pause";
	worker.postMessage(JSON.stringify(message));
}