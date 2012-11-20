// Messenger code
// This file contains the code to send and receive data to
// the server using ajax requests.

var Messenger = function() {

	var DEBUG = true;

	// Gets random words from the server and creates a new board with these
	// words when they are recieved successfully.
	this.getWords = function(successFn) {
        var parameters = {
            "word_count" : NUM_WORDS, "max_wordlen" : MAX_WORDLEN,
            "tag_filter" : tag_filter, "custom_list" : custom_list
        };
        if (!isNaN(difficulty)) {
            parameters["difficulty"] = difficulty;
        }

		$.ajax({
			url: "/random-words/",
			type: "GET",
			dataType: "json",
			data: parameters,
			success: function(data) {
			    successFn(data); // better for game.js to 
			},                   // initialize the board
			error: function(data) {
				if (DEBUG)
					alert("getWords ajax error");
			}
		});
	};

        // Pushes game data to the server based on the score fed into the
        // function.  To be called on game completion
        this.pushGameData = function(score) {
		$.ajax({
			url: "/push-game-data/",
			type: "POST",
			dataType: "json",
			data: {"score" : score},
			headers: {"X-CSRFToken" : $.cookie('csrftoken')},
			success: function() {
				//TODO: implement callback fn parameter
			},
			error: function(data) {
					alert("pushGameData ajax error");
			}
		});
        };

        // Fetches user data from the server
        this.getUserData = function() {
		$.ajax({
			url: "/get-user-data/",
			type: "GET",
			dataType: "json",
			success: function(data) {
                            insertAccountData(data);
			},
			error: function(data) {
                // always errors if user is not logged in
                // probably better to send back an empty
                // JSON object from server
			}
		});
        };
};
