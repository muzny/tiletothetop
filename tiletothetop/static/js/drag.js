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
    ev.preventDefault();
    var id = ev.currentTarget.id;
    var numChildren = $("#" + id).children().length;
    //Check if there are any children
    if(numChildren == 0) {
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
    ev.preventDefault();
    var id = ev.currentTarget.id;
    var numChildren = $("#" + id).children().length;
    //Check if any children exist
    if(numChildren == 0) {
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
