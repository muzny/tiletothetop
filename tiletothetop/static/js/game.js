// game-specific js
// This file contains the javascript classes Board, DefinitionsArea,
// Workspace, and TilesArea. Instantiating the Board creates and populates
// all of the subcomponents.
// Right now, this is what loads the game.

var board = null;

$(window).load(function() {
    var DEBUG = true;
    $.ajax({
        url: "/random-words/",
        type: "GET",
        dataType: "json",
        data: {"word_count" : 4},
        success: function(data) {
	    board = new Board(data);
        },
        error: function(data) {
            if (DEBUG)
                alert("ajax error");
        }
    });
});

var Board = function(data) {
    var definitions = new Array();
    var words = new Array();
    $.each(data, function(index) {
	definitions[index] = data[index]["definition"]
	words[index] = data[index]["word"]
    });
    var defAnsArea = $("<div>").attr("id", "definitions-answers-area");
    $("#game-area").append(defAnsArea);
    this.definitions = new DefinitionArea(definitions);
    this.workspace = new Workspace(words);
    var letters = new Array();
    for (var i = 0; i < words.length; i++) {
	letters = letters.concat(words[i].split(""));
    }
    this.tileArea = new TileArea(letters);
};

var TileArea = function(letters) {
    var tilesArea = $("<div>").attr("id", "tiles-area");
    $("#game-area").append(tilesArea);
    // Can't go get these until we've added it to the page.
    var areaWidth = tilesArea.width();
    var off = tilesArea.offset();
    var numInRow = parseInt(areaWidth / (60));
    this.shuffle(letters);
    $.each(letters, function(index) {
	var tile = $("<div>");
	tile.addClass("tile");
	tile.text(letters[index]);
	tile.css({position: "absolute"});
	var row = parseInt(index / numInRow);
	var widthOff = (index % numInRow);
	var heightOff = (10 + tile.height()) * row + 10;
	tile.offset({top: off.top + heightOff, left: off.left + 10 + (widthOff * (tile.width() + 10))});
	tilesArea.append(tile);
    });
};


// Credit: http://sedition.com/perl/javascript-fy.html
TileArea.prototype.shuffle = function(myArray){
    var i = myArray.length;
    if ( i == 0 ) return false;
    while ( --i ) {
	var j = Math.floor( Math.random() * ( i + 1 ) );
	var tempi = myArray[i];
	var tempj = myArray[j];
	myArray[i] = tempj;
	myArray[j] = tempi;
   }
};

var DefinitionArea = function(definitions) {
    var left = $("<div>").addClass("left-col");
    $.each(definitions, function(index) {
	left.append("<div class='definition'>" +
		definitions[index] + "</div>");
    });
    $("#definitions-answers-area").append(left);
};

var Workspace = function(words) {
    var right = $("<div>").addClass("right-col");
    $.each(words, function(index) {
	var ans = $("<div>");
	ans.addClass("answer");
	ans.text(words[index]);
	right.append(ans);
    });
    $("#definitions-answers-area").append(right);
};