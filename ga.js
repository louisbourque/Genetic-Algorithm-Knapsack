function Item(weight,value){
	this.weight = weight;
	this.value = value;
}

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
	config.max_weight = 15;
	config.bound = 3;
	config.items = [{weight:4,value:3,used:0},{weight:3,value:4,used:0},{weight:2,value:1,used:0}];
	config.popSize = 50;
	config.maxGenerations = 20;
	config.selection = $('#selection').val();
	
	$('#result').empty();
	
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
		draw(resultObj.data);
		return true;
	}
	if(resultObj.act == "answer"){
		$('#status').html("Done: Fitness: "+resultObj.data.fitness+"<br>");
		draw(resultObj.data);
		return true;
	}
}

function draw(result){
	var result_weight = 0;
	var result_str = "Answer: ";
	for(var i = 0;i<result.chromosome.length;i++){
		result_weight+=result.chromosome[i].weight;
		result_str += "("+result.chromosome[i].weight+"kg,"+result.chromosome[i].value+"$)";
	}
	
	result_str+=" Total Value: "+result.fitness+", Total Weight: "+result_weight+"<br>"
	$('#result').prepend(result_str);
}

//pause the game
function stop(){
	var message = new Object();
	message.act = "pause";
	worker.postMessage(JSON.stringify(message));
}