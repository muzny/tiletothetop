// game-specific js
// This file contains the javascript classes Board, DefinitionsArea,
// Workspace, and TilesArea. Instantiating the Board creates and populates
// all of the subcomponents.
// Right now, this is what loads the game.

var board = null;
var tileSize = 60;

$(window).load(function() {
    new StartScreen();
});

function GetWords() {
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
}

var StartScreen = function() {
	var screen = $("<div>").attr("id", "start-screen");
	var textBox = $("<p>").attr({
		"width" : "100%",
		"height": "100%",
		"align" : "center"
	});
	textBox.html("Click anywhere to start!");
	screen.append(textBox);
	
	// Clicking anywhere on the start screen should start the game
	// by clearing out the game area and creating a new board
	// with the Ajax data passed down.
	screen.click(function () {
		$("#game-area").html("");
		GetWords();
	});
	
	$("#game-area").append(screen);
}

/* Creates a modal popup that displays the given score and
 * allows the user to restart the game.
 */
function TransitionScreen(score) {
	// Create a new div with the score inside it.
	var div1 = $("<div>").html("<h1>SCORE: " + score + "</h1>");
	div1.attr({
		"class"  : "score-box",
		"height" : "100px",
		"width"  : "100px"
	});
	
	// Add a link to the score div that allows the user to
	// restart the game.
	var clickToRestart = $("<a>");
	clickToRestart.attr("href", "");
	
	var scoreP = $("<p>").html("Click to restart");
	scoreP.attr("align", "center")
	clickToRestart.append(scoreP);
	
	div1.append(clickToRestart);
	div1.modal();
}

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
	tilesArea.attr({
		"ondrop" : "dropTileInTileArea(event)",
		"ondragover" : "dragTileOverTileArea(event)",
		"ondraglevae" : "leaveTileArea(event)"
	});
	
    $("#game-area").append(tilesArea);
    // Can't go get these until we've added it to the page.
    var areaWidth = tilesArea.width();
    var off = tilesArea.offset();
    var numInRow = parseInt(areaWidth / (tileSize + 10));
    this.shuffle(letters);
    var numRows = Math.max(2, Math.ceil(letters.length / numInRow));
    var row;
    for(var i = 0; i < numRows * numInRow; i++) {
	var rowNum = parseInt(i / numInRow);
	var colNum = i % numInRow;
	if (colNum == 0) {
	    row = $("<div>").addClass("tile-row");
	    tilesArea.append(row);
	}
	var tileBox = $("<div>");
	tileBox.attr("id", "tileBox" + rowNum + "_" + colNum);
	tileBox.addClass("tile-box");
	row.append(tileBox);
    }
    $.each(letters, function(index) {
	var tile = $("<div>");
	tile.addClass("tile");
	tile.addClass("inTileArea");
	tile.text(letters[index]);
	//Setting the tile's id and making it draggable
	tile.attr("id", "tile" + index);
	tile.attr("draggable", "true");
	tile.attr("ondragstart", "dragTile(event)");
	var row = parseInt(index / numInRow);
	var col = index % numInRow;
	var boxId = "#tileBox" + row + "_" + col;
	$(boxId).append(tile)
    });
};

//Called every time the tile is dragged
function dragTile(ev) {
	//Saves the id of the currently dragged tile inside the dataTransfer so we can get it later in the dropTile(ev)
	ev.dataTransfer.setData("Text", ev.target.id);
}

//We can do special effects when the tile is hovered over the TileArea
function dragTileOverTileArea(ev) {
	ev.preventDefault();
}

//This should cancel the special effects added in dragTileOverTileArea()
function leaveTileArea(ev) {
	
}

//Drops the tile into the TileArea
function dropTileInTileArea(ev) {
    ev.preventDefault();
    var data=ev.dataTransfer.getData("Text");
    var tile = document.getElementById(data)
    ev.target.appendChild(tile);
    if (!$(tile).hasClass("inTileArea")) {
	$(tile).addClass("inTileArea");
    }
}

//We can do special effects when the tile is hovered over the EmptyTile
function dragTileOverEmptyTile(ev) {
	//Check to make sure there are no tiles on this EmptyTile
	var id = ev.target.id;
	var numChildren = $("#" + id).children().length;
	//This is broken currently...the ev.target will be the Tile on top of the EmptyTile, not the EmptyTile itself...
	if(numChildren == 0) {
		ev.preventDefault();
	}
}

//This should cancel the special effects added in dragTileOverEmptyTile()
function leaveEmptyTile(ev) {
	
}

//Drops the tile into the EmptyTile
function dropTileInEmptyTile(ev) {
    var id = ev.target.id;
    var numChildren = $("#" + id).children().length;
    //This is broken currently...the ev.target will be the tile on top of the EmptyTile, not the EmptyTile itself...
    //TODO: Fix so that you cannot drop 2 tiles onto 1 EmptyTile
    if(numChildren == 0) {
		ev.preventDefault();
		var data=ev.dataTransfer.getData("Text");
		var tile = document.getElementById(data);
		//Set location
		//Seems like the "absolute" layout will be relative to the parent's position if the parent's layout is also "absolute"
		tile.style.top = "0";
		tile.style.left = "0";
		ev.target.appendChild(tile);

		// Tile is no longer in the tile area
		$(tile).removeClass("inTileArea");
		//Check to see if game has been won
		var gameWon = window.board.workspace.winCheck();
		if(gameWon) {
			alert("You Win!");
		}
    }
}

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

// This is where the definitions of the word go.
var DefinitionArea = function(definitions) {
    var left = $("<div>").addClass("left-col");
    $.each(definitions, function(index) {
	left.append("<div class='definition'>" +
		definitions[index] + "</div>");
    });
    $("#definitions-answers-area").append(left);
};

// This is the space where the empty boxes are so that tiles can go there.
var Workspace = function(words) {
    var solutions = words;
    var self = this;

    // TODO: make it so that tiles can't become clicked.
    var emptyClick = function(e) {
	var toggleSelf = !$(e.target).hasClass("clicked");
	var prevClicked = $(".clicked");
	$.each(prevClicked, function(index) {
	    prevClicked.toggleClass("clicked");
	});
	$(e.target).toggleClass("clicked", toggleSelf);
    };

    var right = $("<div>").addClass("right-col");
    $("#definitions-answers-area").append(right);
    $.each(words, function(index) {
	var ans = $("<div>");
	ans.addClass("answer");
	right.append(ans);
	var word = words[index];
	for(var i = 0; i < word.length; i++) {
	    var emptyTile = $("<div>");
	    emptyTile.addClass("emptyTileLoc");
	    emptyTile.attr({
		"id" : "emptyTile" + index + "_" + i,
		"ondrop" : "dropTileInEmptyTile(event)",
		"ondragover" : "dragTileOverEmptyTile(event)",
		"ondraglevae" : "leaveEmptyTile(event)"
	    });
	    ans.append(emptyTile);
	    emptyTile.bind('click', emptyClick);
	    var off = ans.offset();
	    var widthOff = (i * (emptyTile.width() + 10));
	    var heightOff = 10;
	    emptyTile.offset({top: off.top + heightOff, left: off.left + 10 + widthOff});
	}
    });
    
    //Checks to see if the solution has been found
    this.winCheck = function() {
	var children = right.children();
	var gameWon = true;
	for(index = 0; index < children.length; index++) {
	    var answerTiles = $(children[index]).children();
	    for(var i = 0; i < answerTiles.length; i++) {
		var answerTile = $(answerTiles[i]);
		var letter = $(answerTile.children()[0]).html();
		var correctLetter = solutions[index][i];
		if(letter != correctLetter) {
		    gameWon = false;
		}
	    }
	}
	var holder = gameWon;
	return gameWon;
    };
    
    //Cheat to get solutions
    $(document).bind('keypress', function(e) {
	// In firefox, e.which gets set instead of e.keypress
	var num = e.keyCode;
	if (num == 0) {
	    num = e.which;
	}
	// One of the keys a - z was pressed.
	if (num >= 97 && num <= 122) {
	    var clicked = $(".clicked");
	    if (clicked.length == 1) {
		var t = getTileFromChar(String.fromCharCode(num));
		if (t) {
		    $(t).appendTo($(clicked[0]));
		    $(t).removeClass("inTileArea");
		    $(clicked[0]).removeClass("clicked");
		    // TODO: check if the game has been won
			var gameWon = window.board.workspace.winCheck();
			if(gameWon) {
				alert("You Win!");
			}
		}
	    }
	}
	if(num == 13) {
	    alert(self.getSolutions());
	}
    });

    //Helper for solutions
    this.getSolutions = function() {
	return solutions;
    };
};

// Given a character, will return the first tile from the tile area
// that matches.
function getTileFromChar(tchar) {
    var tiles = $(".inTileArea");
    for (var i = 0; i < tiles.length; i++) {
	if ($(tiles[i]).text() == tchar) {
	    // return the tile in the box
	    return $(tiles[i]);
	}
    }
    return false;
}
