// This file contains the code for the TileArea class and for adding
// and removing tiles from the tile area via typing.
//
// The TileArea is the grid where the tiles start. The tiles in a
// TileArea begin their lives in a random configuration.

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

/* Functions for adding/removing tiles from the TileArea via typing.*/

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

// Adds the tile t to the tile area.
function addToTileArea(t) {
    var tileArea = $(".tile-box");
    for (var i = 0; i < tileArea.length; ++i) {
	var tileBox = $(tileArea.get(i));
	if (tileBox.children().length == 0) {
	    tileBox.append(t);
	    break;
	}
    }
    $(t).addClass("inTileArea");
    $(t).centerOnParent();
}
