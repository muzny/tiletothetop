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
					alert("ajax error");
			}
		});
	}
}