// game-specific js
// This file contains the javascript classes Board, DefinitionsArea,
// Workspace, and TilesArea. Instantiating the Board creates and populates
// all of the subcomponents.
// Right now, this is what loads the game.

var board = null;
var messenger = null;
var score = 0;
var tileSize = 60;

$(window).load(function() {
    createStartScreen();
	messenger = new Messenger();
    messenger.getWords();
    GetAccountData();
});

function createStartScreen() {
    var startscreen = $('#start-screen');
    startscreen.click(function() {
        // hide the start screen
        startscreen.css({'visibility':'hidden', 'z-index':'-1'});
        showGameElements();
        // startGame() is called once all elements are visible
    });
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
            startGame();
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

function startGame() {
    // user has closed start screen
    // all game elements are now visible
    // need to start timer, score tracking logic, etc
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
	messenger.getWords(); // the getWords success callback inserts, but hides definitions and tiles

	transitionScreen.click(function () {
        transitionScreen.css({'display':'hidden', 'z-index':'-1'});
        showGameElements(); // animated display of definitions / tiles
	});
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
		$(boxId).append(tile)
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
		var tile = document.getElementById(data)
		ev.currentTarget.appendChild(tile);
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

		// Tile is no longer in the tile area
		$(tile).removeClass("inTileArea");
		//Check to see if game has been won
		var gameWon = window.board.workspace.winCheck();
		if(gameWon) {
			TransitionScreen(score);
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
				var t = getTileFromChar((String.fromCharCode(num)).toUpperCase());
				if (t) {
					//Check if any children exist on the clicked box
					var numChildren = clicked.children().length;
					if(numChildren == 0) {
						$(t).appendTo($(clicked[0]));
						$(t).removeClass("inTileArea");
						$(clicked[0]).removeClass("clicked");
						// TODO: check if the game has been won
						var gameWon = window.board.workspace.winCheck();
						if(gameWon) {
							TransitionScreen(score);
						}
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
	i += 1
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

