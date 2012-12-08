// This file contains the code that defines the Workspace class
// as well as the code to support typing controls for tile manipulation
// in the workspace area.
//
// The workspace is the place where tiles are dropped to form the words
// for each definition that is displayed.

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
                var correctLetter = solutions[index][i].toLowerCase();
                if(letter != correctLetter) {
                    gameWon = false;
                }
            }
        }
        var holder = gameWon;
        return gameWon;
    };

    // Typing controls for the empty boxes
    $(document).on('keydown', function(e) {
	var active = document.activeElement;
	//Hack to stop IE9 from getting keydown events when focus is on address bar
	if(active.tagName.toUpperCase() == "HTML") {
	    return;
	}

	var num = e.keyCode;
	// Stop space bar from moving the scroll bar down the page.
	if (num == 32) {
	    e.preventDefault();
	}	
	// If not in the "play" tab, the game should be paused
	// and keypresses should not trigger anything.
	if (!isPaused()) {
	    // In firefox, e.which gets set instead of e.keypress
	 
	    //if (num == 0) {
	    //	num = e.which;
	    //}
	    // 65 - 90: One of the keys a - z was pressed.
	    // 32: space
	    // 48 - 57 digits
	    if ((num >= 65 && num <= 90) || num == 32 || (num <= 57 && num >= 48)) {
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

			    checkGameWon();

			    // If there is a next empty tile in this answer area, make it "clicked"
			    var next = getNextEmpty($(clicked[0]).attr("id"));
			    if (next) {
				$(clicked[0]).removeClass("clicked");
				$(next).addClass("clicked")
			    }
			}
		    }
		}
	    }

	    // If ` is pressed, show the solutions
	    if(num == 192 && ANSWER_CHEAT_ON) {
		alert(self.getSolutions());
	    }
	}
    });

    // Handle arrow keys being pressed. Note that arrow keys
    // are only triggered using 'keydown', not 'keypress'.
    $(document).on('keydown', function(e) {
	// In firefox, e.which gets set instead of e.keypress
	var num = e.keyCode;
	if (num == 0) {
	    num = e.which;
	}
	if (num == 9) {
	    e.preventDefault(); // Stop tab from selecting elements on the screen.
	}
	
	var active = document.activeElement;
	//Hack to stop IE9 from getting keydown events when focus is on address bar
	if(active.tagName.toUpperCase() == "HTML") {
	    return;
	}
	
	// User pressed backspace
	if (num == 8 && !isPaused()) {
	    e.preventDefault();
	    var clicked = $(".clicked");
	    if (clicked.length == 1) {
		deleteBoxAt($(clicked[0]).attr("id"));
	    }
	    return false;
	}
	
	// The user pressed the left or right arrow keys.
	if ((num == 37 || num == 39) && !isPaused()) {
	    var clicked = $(".clicked");
	    
	    // If a box is "clicked", move which box is "clicked"
	    // based on the arrow key.
	    if (clicked.length == 1) {
		var nextBox;
		// Left Arrow
		if (num == 37) {
		    nextBox = getBoxAtOffset($(clicked[0]).attr("id"), -1);
		} else { // Right Arrow
		    nextBox = getBoxAtOffset($(clicked[0]).attr("id"), 1);
		}
		
		if (nextBox) {
		    $(clicked[0]).removeClass("clicked");
		    $(nextBox).addClass("clicked");
		}
	    }
	}
	
	// The user pressed the up or down arrow keys, or the tab key.
	if ((num == 38 || num == 40 || num == 9) && !isPaused()) {
	    
	    var clicked = $(".clicked");
	    
	    // If a box is "clicked", move which box is "clicked"
	    // based on the arrow key.
	    if (clicked.length == 1) {
		var prevId = $(clicked).attr("id");
		var answerNum = parseInt(prevId.split("_")[1]);
		var boxNum = parseInt(prevId.split("_")[2]);
		
		var nextAnswerArea;
		
		// User pressed up arrow
		if (num == 38) {
		    nextAnswerArea = $("#emptyTile_" + (answerNum - 1) + "_0");
		} else if (num == 40) { // User pressed down arrow
		    nextAnswerArea = $("#emptyTile_" + (answerNum + 1) + "_0");
		} else {
		    nextAnswerArea = $("#emptyTile_" + ((answerNum + 1) % NUM_WORDS) + "_0");
		}
		
		// If there was a previous answer area to move to, find
		// the first empty box in it and highlight that box.
		if (nextAnswerArea.length != 0) {
		    var emptyNext = getNextEmpty($(nextAnswerArea).attr("id"));
		    
		    // If there was no empty box in this row, just
		    // get the last box in the row.
		    if (!emptyNext) {
			emptyNext = getLastInRow($(nextAnswerArea).attr("id"));
		    }
		    
		    //prevAnswerArea = emptyPrev ? emptyPrev : prevAnswerArea;
		    $(clicked[0]).removeClass("clicked");
		    $(emptyNext).addClass("clicked");
		}
	    }
	}
    });
    
    //Helper for solutions
    this.getSolutions = function() {
	return solutions;
    };
};

/* Functions for keyboard functionality in the Workspace*/

// Gets the next empty box in the same answer area that the
// empty tile location with id prevId.
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

// Gets the tile box that has the offset 'n' from the given ID.
// E.G. Passing -1 will get the previous box, and passing 2 will
// get the box 2 past the previous box.
//
// Returns false if no box exists at that location.
function getBoxAtOffset(prevId, n) {
    // N == 0 corresponds to box with id prevId.
    if (n == 0) return $("#" + prevId);

    var answerNum = parseInt(prevId.split("_")[1]);
    var boxNum = parseInt(prevId.split("_")[2]);
    var i = boxNum;
    var prevValidBox = null;

    // Search for the box that we're looking for by going forwards or
    // backwards (depending on the sign of n), 1 box at a time.
    while (true) {
	var id = "#emptyTile_" + answerNum + "_" + i;
	var empty = $(id);

	if (empty.length == 0) { // Have we gone off the list?
	    return prevValidBox == null ? false : prevValidBox;
	} else if (i == boxNum + n) { // Have we hit the box we're looking for?
	    return $(empty[0]);
	} else if (empty.length == 1) {// We found another valid box, so save this as our previous valid.
	    prevValidBox = empty[0];
	}

	// Increment/decrement i depending on the sign of n.
	if (n < 0) i -= 1;
	else if (n > 0) i += 1;
    }
}

// Returns the last box in the same row as the box with the given id.
function getLastInRow(prevId) {
    var answerNum = parseInt(prevId.split("_")[1]);
    var boxNum = parseInt(prevId.split("_")[2]);
    var i = boxNum;
    var prevValidBox = $("#" + prevId);
    var currentBox = $("#" + prevId);

    while (true) {
	i += 1;
	currentBox = $("#emptyTile_" + answerNum + "_" + i);

	if (currentBox.length == 0) {
	    break;
	}

	prevValidBox = currentBox[0];
    }
    return prevValidBox;
}

// Removes a box at the given location. If there is no box there,
// removed the previous box. If there is no box there, this function
// has no effect.
function deleteBoxAt(prevId) {
    var currentBox = $("#" + prevId);
    var numChildren = currentBox.children().length;
    var decrementHighlighted = false; // Do we move the highlighted box after deleting the current box?

    // If the current box is empty, look at the box behind it.
    if (numChildren == 0) {
	currentBox = getBoxAtOffset(prevId, -1);
	decrementHighlighted = true;
	numChildren = currentBox.children().length;
    }

    // If the current box has a child, remove it and throw it back
    // in the tile area.
    if(numChildren == 1) {
	var t = currentBox.children()[0];
	addToTileArea(t);
    }

    if (decrementHighlighted) {
	var clicked = $(".clicked")[0];

	var prevBox = getBoxAtOffset($(clicked).attr("id"), -1);

	if (prevBox) {
	    $(clicked).removeClass("clicked");
	    $(prevBox).addClass("clicked");
	}
    }
}