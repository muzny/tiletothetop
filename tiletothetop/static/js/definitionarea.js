// This file contains the code for the definition area, which is the
// place where the definitions are displayed to the user. This is also
// the place where the hint buttons are located.

var DefinitionArea = function(definitions) {
    this.getDefinitions = function() {
	return definitions;
    }
    var left = $("<div>").addClass("left-col");

    var hintClicked = function(e) {
	//get corresponding workspace element
	var id = $(this).attr("id");
	var idNum = parseInt(id.charAt(id.length - 1),10);
	displayHintForWord(idNum);
    }
    
    function displayHintForWord(idNum){
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
    
    this.displayHint = function(idNum) {
	return displayHintForWord(idNum);
    }
    
    $.each(definitions, function(index) {
	var def = $("<div>");
	def.addClass("definition");
	def.addClass("jtextfill");
	def.attr("id", "def_" + index);

	var hint = $("<div>");
	hint.addClass("hint-box");
	hint.attr("id", "hint_" + index);
	hint.attr({
	    "type" : "button",
	    "rel" : "tooltip",
	    "data-title" : "Reveals a random letter at the cost of " + HINT_PENALTY + " points.",
	    "data-placement" : "left"});
	hint.bind('click', hintClicked);
	hint.append("Hint");
	hint.disableSelection();

	def.append(hint);
	var span = $("<span>");
	span.text(definitions[index]);
	def.append(span);
	left.append(def);
    });
    $("#definitions-answers-area").append(left);
};
