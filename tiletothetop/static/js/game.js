// game-specific js
// This file contains the javascript classes Board, DefinitionsArea,
// Workspace, and TilesArea. Instantiating the Board creates and populates
// all of the subcomponents.
// Right now, this is what loads the game.

var board = null;
var messenger = null;
var score = 0;
var numberHintsUsed = 0;
var HINT_PENALTY = 100;
var TILE_SIZE = 60;

// difficulty constants - maybe not the right place for this
var NUM_DIFFICULTIES = 3;
var MAX_DIFFICULTY = 150; // [0,150)
var INCR_DIFFICULTY = MAX_DIFFICULTY / NUM_DIFFICULTIES;
var NUM_LEVELS = 10; // [0,10)
var INCR_LEVEL = INCR_DIFFICULTY / NUM_LEVELS;

// game settings
var NUM_WORDS = 4;
var MAX_WORDLEN = 10;
var difficulty = 0;
var level = 0;
var tag_filter = 0;
var custom_list = "";

$(window).load(function() {
    initializeMenuButtons();
    
    messenger = new Messenger();
    GetAccountData();
    
    //startGame();    // uncomment this to bypass main menu
});


/** Begin Menu / Navigation stuff */

// Start menu and game menu button event handlers, etc.
function initializeMenuButtons() {
    $('#play.carousel').carousel({
        interval: false
    });
    $('#play.carousel').bind('slid', function() {
        showGameElements();
    });
    
    $('#start-button').click(startGame);
    $('#return-button').click(returnToGame);
    
    $('#new-game').click(returnToStart);
    $('#quit-game').click(quitGame);
    $('#game-menu').tooltip({
        selector: '[rel="tooltip"]'
    });
}

// Return to game from start menu
function returnToGame() {
    $('#play.carousel').carousel('next');
    $('#start-menu').hide();
}

// Return to start menu from game
function returnToStart() {
    if (board != null) {
        // allow user to return to current game
        // board should never be empty after starting first game
        $('#start-game-inprogress').show();
    }
    $('#start-menu').show();
    $('#play.carousel').carousel('prev');
}

function startGame() {
    // user has started the game from main menu
    // initialize game elements with user settings
    // need to start timer, score tracking logic, etc

    // TODO make use of level advancement
    level =  parseInt($('#setting-level').val()) - 1;
    if (isNaN(level)) {
        level = 0;
    }
    difficulty = parseInt($('#setting-difficulty input[name="setting-difficulty"]:checked').val());
    if (!isNaN(difficulty)) {
        // calculate value to pass to getWords
        difficulty += level * INCR_LEVEL;
    }
    tag_filter = parseInt($('#setting-tag').val());
    if (isNaN(tag_filter)) {
        tag_filter = 0;
    }
    custom_list = $('#setting-custom').val();

    messenger.getWords(initializeBoard);

    returnToGame();
}

// Show transition screen and reveal solution
function quitGame() {
    // TODO
}

/** End Menu / Navigation stuff */


function initializeBoard(data) {
    if (board != null) {
        board.workspace.cleanUp();
        $('#definitions-answers-area').remove();
        $('#tiles-area').remove();
    }
    board = new Board(data);
    
    // hide start menu, show board
    //returnToGame(); // Firefox doesn't like having this here for some reason
}

// called during board creation
function hideGameElements() {
    var defs = $('#game-area').find('.definition');
    var empty = $('#game-area').find('.emptyTileLoc');
    var tiles = $('#game-area').find('.tile');

    var elements = $.merge(defs, $.merge(empty, tiles));
    $.each(elements, function() {
        $(this).hide();
    });
}

function showGameElements() {
    var defs = $('#game-area').find('.definition');
    var empty = $('#game-area').find('.emptyTileLoc');
    var tiles = $('#game-area').find('.tile');

    var elements = $.merge(defs, $.merge(empty, tiles));

    // can't call each b/c we want to wait for each to show
    function showRecursive(rest) {
        if (rest.length === 0) {
            return;
        }

        var next = rest.splice(0,1);
        var time = 50;
        if ($(next).hasClass('definition'))
            time = 400;
        $(next).show(time, function() {
            showRecursive(rest);
        });
    }

    showRecursive(elements.toArray());
}

/* Creates a modal popup that displays the given score and
 * allows the user to restart the game.
 */
function TransitionScreen(score) {
    // go ahead an push game data
    messenger.pushGameData(score);

	// add the score to the transition screen
    var transitionScreen = $('#transition-screen');
    var scoreElement = $("#transition-screen h1")[0];
	$(scoreElement).text("SCORE: " + score);

		// Clean up the board
    $('#definitions-answers-area').remove();
    $('#tiles-area').remove();


    // show the transition screen, and load words in the background
    transitionScreen.css({'display':'visible', 'z-index':'100'});
    // if we call this immediately, it likely won't get the updated user data
    setTimeout(messenger.getUserData, 2000);
    // the getWords success callback inserts, but hides definitions and tiles
    messenger.getWords(initializeBoard); 
    
	transitionScreen.click(function () {
        transitionScreen.css({'display':'hidden', 'z-index':'-1'});
        showGameElements(); // animated display of definitions / tiles
	});
}

var Board = function(data) {
	//reset score
	score = 0;
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
    hideGameElements();
};

var TileArea = function(letters) {
    var tilesArea = $("<div>").attr("id", "tiles-area");
	/*tilesArea.attr({
		"ondrop" : "dropTileInTileArea(event)",
		"ondragover" : "dragTileOverTileArea(event)",
		"ondragleave" : "leaveTileArea(event)"
	});*/

    $("#game-area").append(tilesArea);
    // Can't go get these until we've added it to the page.
    var areaWidth = tilesArea.width();
    var off = tilesArea.offset();
    var numInRow = parseInt(areaWidth / (TILE_SIZE + 10));
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
		tileBox.attr({
			"ondrop" : "dropTileInTileArea(event)",
			"ondragover" : "dragTileOverTileArea(event)",
			"ondragleave" : "leaveTileArea(event)"
		});
		row.append(tileBox);
    }
    $.each(letters, function(index) {
		var tile = $("<div>");
		tile.addClass("tile");
		tile.addClass("inTileArea");
		//tile.text(letters[index]);
        tile.html("<p>"+letters[index].toUpperCase()+"</p>");
		//Setting the tile's id and making it draggable
		tile.attr("id", "tile" + index);
		tile.attr("draggable", "true");
		tile.attr("ondragstart", "dragTile(event)");
		//tile.disableSelection();
		var row = parseInt(index / numInRow);
		var col = index % numInRow;
		var boxId = "#tileBox" + row + "_" + col;
		$(boxId).append(tile);
		var boxHeight = $(boxId).height();
		var boxWidth = $(boxId).width();
		tile.centerOnParent();
		//Adding check for IE9 or above
		if($.browser.msie && parseInt($.browser.version, 10) >= 9)
		{
			var container = document.getElementById(tile.attr("id"));
			if (container.dragDrop) {
				$(container).bind('mousemove', handleDragMouseMove);
			}
			//document.getElementById(tile.attr("id")).addEventListener("dragStart", dragTile, false);
		}
    });
};

//Function for IE9
function handleDragMouseMove(e) {
    var target = e.target;
    if (window.event.button === 1) {
        target.dragDrop();
    }
}

//Called every time the tile is dragged
function dragTile(ev) {
	//Saves the id of the currently dragged tile inside the dataTransfer so we can get it later in the dropTile(ev)
	ev.dataTransfer.setData("Text", ev.currentTarget.id);
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
	var id = ev.currentTarget.id;
    var numChildren = $("#" + id).children().length;
    //Check if there are any children
    if(numChildren == 0) {
		ev.preventDefault();
		var data=ev.dataTransfer.getData("Text");
		var tile = document.getElementById(data);
		ev.currentTarget.appendChild(tile);
		$(tile).centerOnParent();
		if (!$(tile).hasClass("inTileArea")) {
		$(tile).addClass("inTileArea");
		}
	}
}

//We can do special effects when the tile is hovered over the EmptyTile
function dragTileOverEmptyTile(ev) {
	//Check to make sure there are no tiles on this EmptyTile
	var id = ev.target.id;
	var numChildren = $("#" + id).children().length;
	if(numChildren == 0) {
		ev.preventDefault();
	}
}

//This should cancel the special effects added in dragTileOverEmptyTile()
function leaveEmptyTile(ev) {

}

//Drops the tile into the EmptyTile
function dropTileInEmptyTile(ev) {
    var id = ev.currentTarget.id;
    var numChildren = $("#" + id).children().length;
    //Check if any children exist
    if(numChildren == 0) {
		ev.preventDefault();
		var data=ev.dataTransfer.getData("Text");
		var tile = document.getElementById(data);
		//Set location
		//Seems like the "absolute" layout will be relative to the parent's position if the parent's layout is also "absolute"
		//tile.style.top = "0";
		//tile.style.left = "0";
		ev.currentTarget.appendChild(tile);
		$(tile).centerOnParent();
		// Tile is no longer in the tile area
		$(tile).removeClass("inTileArea");
		
		checkGameWon();
    }
}

// Check to see if game has been won. If it has, then it
// calculates the score and shows the transition screen.
function checkGameWon() {
	if (window.board.workspace.winCheck()) {
		// They won!!
		
		var solutions = window.board.workspace.getSolutions();
	
		// Calculate score for correct words
		for (var i = 0; i < solutions.length; i++) {
			score += scoreFunc(solutions[i]);
		}
		
		// Show the transition screen
		TransitionScreen(score);
	}
}

// Returns the score value of the given word. Bases the score on
// the length of the word and difficulty of the current level.
function scoreFunc(word) {
	// 100 points per letter
	var baseScore = word.length * 100;
	
	// Add difficulty bonus
	var bonus = 0;
	if (!isNaN(difficulty)) {
		bonus = difficulty * 10;
	}
	
	return baseScore + bonus;
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
	
	var hintClicked = function(e) {
		//get corresponding workspace element
		var id = $(this).attr("id");
		var idNum = parseInt(id.charAt(id.length - 1),10);
		var workspaceElementId = "#answer_" + idNum;
		var workspaceElement = $(workspaceElementId);
		//count number of empty boxes in that word
		var children = workspaceElement.children();
		var count = 0;
		for (var i = 0; i < children.length; i++) {
			if ($(children[i]).text().length == 0) {
				count++;
			}
		}
		//pick random character to reveal
		if(count != 0){
			var randomIndex = parseInt(Math.random() * count, 10);
			for(var i = 0; i < children.length; i++) {
				if($(children[i]).text().length == 0) {
					randomIndex--;
				}
				if(randomIndex == -1){
					var letter = window.board.workspace.getSolutions()[idNum][i];
					$(children[i]).text(letter.toUpperCase());
					numberHintsUsed++;
					score -= HINT_PENALTY;
					break;
				}
			}
		}
	}
	
    $.each(definitions, function(index) {
		var def = $("<div>");
		def.addClass("definition");
		def.attr("id", "def_" + index);
		
		var hint = $("<div>");
		hint.addClass("hint-box");
		hint.attr("id", "hint_" + index);
		hint.bind('click', hintClicked);
		hint.append("Hint");
		hint.disableSelection();
		
		def.append(hint);
		def.append(definitions[index]);
		left.append(def);
    });
    $("#definitions-answers-area").append(left);
};

// This is the space where the empty boxes are so that tiles can go there.
var Workspace = function(words) {
    var solutions = words;
    var self = this;

    var emptyClick = function(e) {
		var toggleSelf = !$(this).hasClass("clicked");
		var prevClicked = $(".clicked");
		$.each(prevClicked, function(index) {
			prevClicked.toggleClass("clicked");
		});
		$(this).toggleClass("clicked", toggleSelf);
    };

    var answerClick = function(e) {
		// If none of the children of this answer are clicked, then go
		// through with it
		var target = e.target;
		//Making sure that the user clicked the answer portion and not an EmptyTile
		if(target == this)
		{
			var children = $(this).children();
			for (var i = 0; i < children.length; i++) {
				if ($(children[i]).hasClass("clicked")) {
					$(children[i]).triggerHandler("click");
					return false;
				}
			}
			// Get the first empty one
			var next = getNextEmpty($(children[0]).attr("id"));
			$(next).triggerHandler("click")
		}
    }

    var right = $("<div>").addClass("right-col");
    $("#definitions-answers-area").append(right);
    $.each(words, function(index) {
		var ans = $("<div>");
		ans.addClass("answer");
		ans.attr("id", "answer_" + index);
		ans.bind('click', answerClick)
		right.append(ans);
		var word = words[index];
		for(var i = 0; i < word.length; i++) {
			var emptyTile = $("<div>");
			emptyTile.addClass("emptyTileLoc");
			emptyTile.attr({
			"id" : "emptyTile_" + index + "_" + i,
			"ondrop" : "dropTileInEmptyTile(event)",
			"ondragover" : "dragTileOverEmptyTile(event)",
			"ondragleave" : "leaveEmptyTile(event)"
			});
			ans.append(emptyTile);
			emptyTile.bind('click', emptyClick);
			var off = ans.offset();
			var widthOff = (i * (emptyTile.width() + 10));
			var heightOff = (ans.height() - emptyTile.height())/2;
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
                // letters are now wrapped in a paragraph tag as well
                var letter = $($(answerTile.children()[0]).html()).text().toLowerCase();
                var correctLetter = solutions[index][i];
                if(letter != correctLetter) {
                    gameWon = false;
                }
            }
        }
        var holder = gameWon;
        return gameWon;
    };

    // Typing controls for the empty boxes
    $(document).on('keypress', function(e) {
		// In firefox, e.which gets set instead of e.keypress
		var num = e.keyCode;
		if (num == 0) {
			num = e.which;
		}
		// One of the keys a - z was pressed.
		if (num >= 97 && num <= 122) {
			var clicked = $(".clicked");
			if (clicked.length == 1) {
				var t = getTileFromChar((String.fromCharCode(num)).toUpperCase());
				if (t) {
					//Check if any children exist on the clicked box
					var numChildren = clicked.children().length;
					if(numChildren == 0) {
						$(t).appendTo($(clicked[0]));
						$(t).removeClass("inTileArea");
						$(t).centerOnParent();
						$(clicked[0]).removeClass("clicked");

						checkGameWon();
						
						// If there is a next empty tile in this answer area, make it "clicked"
						var next = getNextEmpty($(clicked[0]).attr("id"));
						if (next) {
						$(next).addClass("clicked")
						}
					}
				}
			}
		}
		if(num == 96) {
			alert(self.getSolutions());
		}
    });

    //Helper for solutions
    this.getSolutions = function() {
		return solutions;
    };
};

// This method must be called if you are getting rid of an old workspace.
// It turns off all of the old listeners so that crazy things
// like multiple keypress events firing don't happen.
Workspace.prototype.cleanUp = function() {
    $(document).off('keypress');
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

// Gets the next empty box in an answer area
function getNextEmpty(prevId) {
    // Get the first number
    var answerNum = parseInt(prevId.split("_")[1]);
    var boxNum = parseInt(prevId.split("_")[2]);
    var i = boxNum;
    while (true) {
		var id = "#emptyTile_" + answerNum + "_" + i;
		var empty = $(id);
		if (empty.length == 1 && empty.children().length == 0) {
			return $(empty[0]);
		} else if (empty.length == 0) {
			return false;
		}
		i += 1;
    }
}

/* Gets the account data for the currently logged in user
 * clicking this button while not logged in is not currently
 * handled well
 */
function GetAccountData() {
    messenger.getUserData();
}

function insertAccountData(data) {
    if (!data.hasOwnProperty('username')) {
        return; // not what we expected
    }

    $('#username').text(data.username);
    var prettyDate = data.date_joined.split(' ')[0];
    $('#date_joined').text(prettyDate);
    prettyDate = data.last_login.split(' ')[0];
    $('#last_login').text(prettyDate);
    $('#games_played').text(data.games_played);

    // some users don't have first, last names or emails
    // associated with their accounts
    if (!data.hasOwnProperty('first_name') || data.first_name === '') {
        $('#first_name').remove();
        $('#first_name_label').remove();
    } else {
        $('#first_name').text(data.first_name);
    }

    if (!data.hasOwnProperty('last_name') || data.last_name === '') {
        $('#last_name').remove();
        $('#last_name_label').remove();
    } else {
        $('#last_name').text(data.last_name);
    }
    if (!data.hasOwnProperty('email') || data.email === '') {
        $('#email').remove();
        $('#email_label').remove();
    } else {
        $('#email').text(data.email);
    }
}

