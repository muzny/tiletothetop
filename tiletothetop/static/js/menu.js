// This file contains the code that corresponds to game navigation.
// This means that most of the button functionality like "start game",
// "return to game", and "quit game" is contained here.

/** Begin Menu / Navigation stuff */

// Start menu and game menu button event handlers, etc.
function initializeMenuButtons() {
    $('#play.carousel').carousel({
        interval: false
    });
    /*
      $('#play.carousel').bind('slid', function() {
      showGameElements();
      });
    */

    $('#game-help').popover();

    $('#game-options .accordion-body').on('shown', function() {
        $(this).siblings('.accordion-heading').children('.accordion-toggle').css({'opacity':'1'})
    });
    $('#game-options .accordion-body').on('hidden', function() {
        $(this).siblings('.accordion-heading').children('.accordion-toggle').css({'opacity':'.4'})
    });

    initializeDifficultyButtons();

    $('#start-button').click(function() {
        startGame();
        returnToGame();
    });
    $('#return-button').click(returnToGame);

    $('#new-game').click(returnToStart);
    $('#quit-game').click(quitGame);
    $('#restart').click(restart);
    $('#share').click(generateShareUrl);
    $('#transition-screen').click(transitionClick);
    $('#post-to-facebook').click(postToFacebook)
    $('#game-area').tooltip({
        selector: '[rel="tooltip"]'
    });
}

function initializeDifficultyButtons() {
    $('#step-less-exp').click(function() {
        if (!isPrevStepLess)
            expDifficultyStep = INCR_DIFFICULTY;
        isPrevStepLess = true;
        if (expDifficultyStep < MAX_DIFFICULTY)
            expDifficultyStep *= 2;
        incrementDifficulty(-expDifficultyStep);
    });
    $('#step-less-const').click(function() {
        incrementDifficulty(-INCR_DIFFICULTY);
    });
    $('#step-more-const').click(function() {
        incrementDifficulty(INCR_DIFFICULTY);
    });
    $('#step-more-exp').click(function() {
        if (isPrevStepLess)
            expDifficultyStep = INCR_DIFFICULTY;
        isPrevStepLess = false;
        if (expDifficultyStep < MAX_DIFFICULTY)
            expDifficultyStep *= 2;
        incrementDifficulty(expDifficultyStep);
    });
    $('#toggle-difficulty').click(function() {
        if ($(this).is(':checked')) {
            $('#difficulty-inputs .btn').removeAttr('disabled');
            $('#setting-difficulty').css('background-color', 'white')
            
        } else {
            $('#difficulty-inputs .btn').attr('disabled', 'disabled');
            $('#setting-difficulty').css('background-color', '#ddd')
        }
    });
}

function incrementDifficulty(increment) {
    var value = parseInt($('#setting-difficulty').val());
    value += increment;
    value = Math.max(0, Math.min(MAX_DIFFICULTY, value));
    $('#setting-difficulty').val(value);

    var text;
    if (value < 50) {
        text = 'Easy';
    } else if (value >= 50 && value < 100) {
        text = 'Medium';
    } else {
        text = 'Hard';
    }
    $('#difficulty-text').text(text);
}

// Return to game from start menu
function returnToGame() {
    $('#play.carousel').carousel('next');
    $('#start-menu').hide();
    inStartMenu = false;
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
    inStartMenu = true;
}

function startGame() {
    // user has started the game from main menu
    // initialize game elements with user settings
    // need to start timer, score tracking logic, etc

    if(gameIsStarted) {
	resetEvents();
    }
    gameIsStarted = true;

    // Hide the drag blocker
    $("#drag-blocker").css({'z-index':'-1'});

    var selectedGroup = $('#game-options .accordion-body.in');

    if (selectedGroup.size() == 0) {
        // don't use any extra parameters
        messenger.getWords(initializeBoard, null, null);
    } else if (selectedGroup[0].id == 'dict-game') {
        var difficulty = parseInt($('#setting-difficulty').val());
        if (!$('#toggle-difficulty').is(':checked')) {
            difficulty = null;
        }
        var tagFilter = parseInt($('#setting-tag').val());
        if (isNaN(tagFilter)) {
            tagFilter = null;
        }
        messenger.getWords(initializeBoard, difficulty, tagFilter);
    } else { // (selectedGroup[0].id == 'dict-custom')
        custom_list = $('#setting-custom').val();
        messenger.getCustomWords(initializeBoard, custom_list);
    }
    showGameButtons();
}

// Show transition screen and reveal solution
function quitGame() {
    // Fill in answers
    var answers = window.board.definitions.getDefinitions();
    for(var i = 0; i < answers.length; i++) {
        for(var j = 0; j < answers[i].length; j++) {
            window.board.definitions.displayHint(i);
        }
    }
    // Show transition screen
    $('#score-breakdown').hide();
    TransitionScreen(false, 0);
}

// Starts a game with the same settings as the previous game.
function restart() {
    resetEvents();
    startGame();
}

// This method must be called if you are getting rid of an old workspace.
// It turns off all of the old listeners so that crazy things
// like multiple keypress events firing don't happen.
function resetEvents() {
    $(document).off('keydown');
    $(document).off('shown');
    $(document).off('hidden');
    $(document).off('keypress');
}

function showGameButtons() {
    // Show "Return to start menu" and "Quit game" buttons

    $("#new-game").removeClass("hidden-button");
    $("#new-game").addClass("shown-button");

    $("#quit-game").removeClass("hidden-button");
    $("#quit-game").addClass("shown-button");

    $("#restart").removeClass("shown-button");
    $("#restart").addClass("hidden-button");

    $("#share").removeClass("shown-button");
    $("#share").addClass("hidden-button");
    $("#share").html("Share");

    $('#linkArea').removeClass("shown-button");
    $('#linkArea').addClass("hidden-button");

    $('#post-to-facebook').removeClass("shown-button");
    $('#post-to-facebook').addClass("hidden-button");
}

function showGameOverButtons() {
    // Show "Return to start menu", "New game" and "Share" buttons

    $("#new-game").removeClass("hidden-button");
    $("#new-game").addClass("shown-button");

    $("#quit-game").removeClass("shown-button");
    $("#quit-game").addClass("hidden-button");

    $("#restart").removeClass("hidden-button");
    $("#restart").addClass("shown-button");
}

function transitionClick() {
    // Transition screen was clicked, so hide it.
    $("#transition-screen").css({'z-index':'-1'});
}

function postToFacebook() {
    $('#facebook-form-container').removeClass("hide");
    $('#id_link').val($('#linkArea').text());
    var score = $('#score-final').text();
    $('#id_message').val("I just got a score of " + score + " on Tile To The Top!  Can you beat my score?");
}
