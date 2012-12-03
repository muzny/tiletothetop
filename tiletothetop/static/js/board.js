var Board = function(data) {
	//reset score
	score = 0;
    var definitions = new Array();
    var words = new Array();
    $.each(data.words, function(index) {
		definitions[index] = data.words[index]["definition"]
		words[index] = data.words[index]["word"]
    });
    this.mode = data.mode;
    var defAnsArea = $("<div>").attr("id", "definitions-answers-area");
    $("#game-area").append(defAnsArea);
    this.definitions = new DefinitionArea(definitions);
    this.workspace = new Workspace(words);
    var letters = new Array();
    for (var i = 0; i < words.length; i++) {
		letters = letters.concat(words[i].split(""));
    }
    this.tileArea = new TileArea(letters);
    
    // Turn off the old timer, if a previous game was just ended.
    if (timer) {
	timer.pause();
    }
    
    // Start the new timer.
    timer = new Timer(1000);
    //hideGameElements();
};
