// Messenger code
// This file contains the code to send and receive data to
// the server using ajax requests.

var Messenger = function() {

	var DEBUG = true;

	// Gets random words from the server and creates a new board with these
	// words when they are recieved successfully.
	this.getWords = function() {
		$.ajax({
			url: "/random-words/",
			type: "GET",
			dataType: "json",
			data: {"word_count" : 4},
			success: function(data) {
				board = new Board(data);
			},
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
			type: "GET",
			dataType: "json",
			data: {"score" : score},
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
