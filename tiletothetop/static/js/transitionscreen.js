// This is the code for the transtion screen object.

/* Creates a modal popup that displays the given score and
 * allows the user to restart the game.
 */
function TransitionScreen(won, score) {
    // go ahead an push game data
    if (won) {
	var definitions = window.board.definitions.getDefinitions(),
	words = window.board.workspace.getSolutions();
	messenger.pushGameData(score, definitions, words, window.board.mode);
    }

    timer.pause();
    
    // Show the drag blocker
    $('#drag-blocker').css({'display':'visible', 'z-index':'100'});
    
    // remove click/keyboard events
    resetEvents();
    
    // Make it so no spaces are highlighted.
    var prevClicked = $(".clicked");
    $.each(prevClicked, function(index) {
	prevClicked.toggleClass("clicked");
    });
    
    // add the message and score to the transition screen
    $('#transition-message').text(won ? "Congratulations, you won!" : "Game over");
    $('#score-final').text(score);

    // show the transition screen, and load words in the background
    $('#transition-screen').css({'display':'visible', 'z-index':'100'});
    // if we call this immediately, it likely won't get the updated user data
    setTimeout(messenger.getUserData, 2000);
    // manually set height of transition screen's parent
    $('#game-area').css({'height':'611px'});
    $('#play').css({'padding':'0px'});

    showGameOverButtons();
}
