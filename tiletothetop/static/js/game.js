// This file contains the code to initialize and load a game, the scoring
// function, and functions to load / produce static game urls, and
// functions to detect game state (paused, over).
// This file is also where all of the global variables and constants live.
var board = null;
var messenger = null;
var timer = null;

var score = 0;
var numberHintsUsed = 0;
var HINT_PENALTY = 100;

var MAX_FONT = 36;  // max pixels for definitions
var TILE_SIZE = 60;

var TIMER_PENALTY = 10;
var TIMER_CUTOFF = 60;

// pressing ` will display answers if set to true
// The cheat will be on if the server is being run locally
var ANSWER_CHEAT_ON = (window.location.host.indexOf("localhost") != -1) ||
                      (window.location.host.indexOf("127.0.0.1") != -1);

// So that we can tell if a modal is open, and pause the game when it is
var MODAL_IDS = ["#login-modal", "#register-modal"];

// difficulty constants - maybe not the right place for this
var MAX_DIFFICULTY = 150; // [0,150)
var INCR_DIFFICULTY = 5;
var isPrevStepLess = false;
var expDifficultyStep = INCR_DIFFICULTY;

// game settings
var NUM_WORDS = 4;
var MAX_WORDLEN = 10;
var inStartMenu = false;
var setupEvents = false;

var gameIsStarted = false;

/* Functions for loading the game, initializing the board, and 
showing the elements of the game.*/

$(window).load(function() {
    // because IE tries to cache all the things
    $.ajaxSetup({cache:false});

    initializeMenuButtons();
    initializeWordListButtons();
    messenger = new Messenger();
    getAccountData();
    getUserRank();
    getLeaderboard(10);

    //if we're fed static ids, automagically create game from them
    //argument done as id parameter, which is hyphen separated ids.
    // example:
    // http://our.game.url/?id=id1-id2-id3-id4
    // dev example:
    // http://127.0.0.1:8000/?id=47-106-8-900
    createStaticGameIfApplicable();
});

function initializeBoard(data) {
    if (board != null) {
        $('#definitions-answers-area').remove();
        $('#tiles-area').remove();
    }
    board = new Board(data);
    $(".jtextfill").textfill({ maxFontPixels: MAX_FONT });
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

/* Functions for checking game state.*/

// Check to see if game has been won. If it has, then it
// calculates the score and shows the transition screen.
function checkGameWon() {
    if (window.board.workspace.winCheck()) {
	// They won!!

	var solutions = window.board.workspace.getSolutions();

	// Calculate score for correct words
        var base = 0;
	for (var i = 0; i < solutions.length; i++) {
	    base += scoreFunc(solutions[i]);
	}
	
	var timeBonus = Math.max(0, (TIMER_CUTOFF - (timer.getMin() * 60 + timer.getSec())) * TIMER_PENALTY);
	
        // show score components in transition screen
        $('#score-base').text(base);
        $('#score-bonus').text(timeBonus);  // TODO use something meaningful (time bonus?)
        // score currently contains accumulated penalties
        $('#score-penalty').text(score);

        score += base;
	score += timeBonus;

	// Show the transition screen
	TransitionScreen(true, score);
    }
}

// Return true if the game is "paused". The game is "paused" if
// the play screen is not active.
function isPaused() {
    for (var i = 0; i < MODAL_IDS.length; i++) {
	if ($(MODAL_IDS[i]).hasClass("in")) {
	    return true;
	}
    }
    return !$("#play").hasClass("active");
}

/* Scoring functions.*/

// Returns the score value of the given word. Bases the score on
// the length of the word and difficulty of the current level.
function scoreFunc(word) {
    // 100 points per letter
    var baseScore = word.length * 100;

    // Add difficulty bonus
    var bonus = 0;
    /*
      if (!isNaN(difficulty)) {
      bonus = difficulty * 10;
      }
    */
    return baseScore + bonus;
}

/* Sharing/static url functions.*/

// Generate the url needed to share a game with a friend.
function generateShareUrl() {
    var url = window.location.origin + "/?id=" + window.__lastGame;

    button = $('#share');
    linkArea = $('#linkArea');
    
    button.addClass("hidden-button");
    button.removeClass("shown-button");
    
    linkArea.addClass("shown-button");
    linkArea.removeClass("hidden-button");
    linkArea.text(url);
}

// Create a static game from a word list id.
function createStaticGameIfApplicable() {
    var getUrlVars = function() {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++)
        {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    }
    var params = getUrlVars();
    if (params.id) {
        var words = messenger.getStaticWords(initializeBoard, params.id);
        returnToGame();
    }
}
