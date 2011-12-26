function Item(weight,value){
	this.weight = weight;
	this.value = value;
}

//config object used to set the parameters of the game. This object is passed to the worker thread to initialize it
var config = new Object();
config.popSize = 10;
config.maxGenerations = 20;
config.maxRuns = 1;
config.mutateProb = 0.02;
config.selection = "rank";
config.fitness_order = "asc";
config.unique_chromosomes = true;
config.items = [{weight:4,value:3},{weight:3,value:4},{weight:2,value:1}]
var worker;

function init(){
	worker = new Worker("ga-worker.js");
	worker.onerror = function(error) {  
		console.log(error.message);
	};
	list_items();
}


function knapsack_init(){
	stop();
	if(isNaN(parseInt($('#max_weight').val()))){
		$('#max_weight').val('15');
	}
	config.max_weight = parseInt($('#max_weight').val());
	if(isNaN(parseInt($('#bound').val()))){
		$('#bound').val('1');
	}
	config.bound = parseInt($('#bound').val());
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

function list_items(){
	var str = "";
	for(var i = 0;i<config.items.length;i++){
		str+="<li>"+config.items[i].weight+"kg: "+config.items[i].value+"$<button onclick=\"remove_item('"+i+"')\">Remove</button></li>";
	}
	$('#items_list').html(str);
}

function remove_item(removeItem){
	console.log('r');
	config.items.splice(removeItem,1);
	list_items();
}

function show_add_item(){
	$('#add_item_form').show();
}

function add_item(){
	$('#add_item_form').hide();
	if(isNaN(parseInt($('#add_weight').val())) || isNaN(parseInt($('#add_value').val()))){
		return false;
	}
	var item = new Item(parseInt($('#add_weight').val()),parseInt($('#add_value').val()));
	config.items.push(item);
	$('#add_weight').val('')
	$('#add_value').val('')
	list_items();
}

//pause the game
function stop(){
	var message = new Object();
	message.act = "pause";
	worker.postMessage(JSON.stringify(message));
}