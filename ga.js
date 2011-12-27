function Item(name,weight,value,bound){
	this.name = name;
	this.weight = weight;
	this.value = value;
	this.bound = bound;
}

//config object used to set the parameters of the game. This object is passed to the worker thread to initialize it
var config = new Object();
config.popSize = 100;
config.maxGenerations = 20;
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
	if(isNaN(parseInt($('#max_weight').val()))){
		$('#max_weight').val('15');
	}
	config.max_weight = parseInt($('#max_weight').val());
	if(isNaN(parseInt($('#bound').val()))){
		$('#bound').val('1');
	}
	config.bound = parseInt($('#bound').val());
	config.selection = $('#selection').val();
	
	config.items = [];
	$('#items_list tr').each(function(index,value){
		val = $(value);
		var item = new Item(
			val.children().children('.name').val(),
			parseInt(val.children().children('.weight').val()),
			parseInt(val.children().children('.value').val()),
			parseInt(val.children().children('.bound').val())
		);
		config.items.push(item);
	});
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
		$('#status').html("Fitness: "+resultObj.data.pop.fitness+"<br>");
		draw(resultObj.data);
		return true;
	}
	if(resultObj.act == "answer"){
		$('#status').html("Done: Fitness: "+resultObj.data.pop.fitness+"<br>");
		draw(resultObj.data);
		return true;
	}
}

function draw(result){
	var result_weight = 0;
	var result_str = "<table><thead><tr><td>Count</td><td>Name</td><td>Weight</td><td>Value</td></tr></thead><tbody>";
	
	for(var i = 0;i<result.items.length;i++){
		var countArray = result.pop.chromosome.filter(get_items_filter,result.items[i]);
		result_str += "<tr><td>"+countArray.length+"</td><td>"+result.items[i].name+"</td><td>"+result.items[i].weight+"kg</td><td>"+result.items[i].value+"$</td></tr>";
	}
	for(var i = 0;i<result.pop.chromosome.length;i++){
		result_weight+=result.pop.chromosome[i].weight;
	}
	result_str+="</tbody></table><p> Total Value: "+result.pop.fitness+", Total Weight: "+result_weight+"</p>"
	$('#result').html(result_str);
}

function get_items_filter(item){
	return this.name === item.name;
}

function remove_item(removeItem){
	$('#items_list tr:last').remove();
}

function add_item(){
	var itemsCount = parseInt($('#items_list tr').length)+1;
	$('#items_list').append("<tr><td><input type='text' class='name' value='x"+itemsCount+"'></td><td><input type='text' class='weight' value='"+itemsCount+"'></td><td><input type='text' class='value' value='"+(itemsCount+1)+"'></td><td><input type='text' class='bound' value='1'></td></tr>");
}

//pause the game
function stop(){
	var message = new Object();
	message.act = "pause";
	worker.postMessage(JSON.stringify(message));
}