// Messenger code
// This file contains the code to send and receive data to
// the server using ajax requests.

var Messenger = function() {

    var host = window.location.host;
    var DEBUG = (host.indexOf("localhost") != -1) ||
                (host.indexOf("127.0.0.1") != -1);

    // Gets random words from the server and creates a new board with these
    // words when they are recieved successfully.
    this.getWords = function(successFn) {
        var parameters = {
            "word_count" : NUM_WORDS, "max_wordlen" : MAX_WORDLEN
        };
        if (difficulty != null) {
            parameters["difficulty"] = difficulty;
        }
        if (tag_filter != null) {
            parameters["tag_filter"] = tag_filter;
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

    // Gets static words based on a string of IDs
    this.getStaticWords = function(successFn, wordIDs) {
        var parameters = {
            "id" : wordIDs
        };
        $.ajax({
            url: "/static-words/",
            type: "GET",
            dataType: "json",
            data: parameters,
            success: function(data) {
                successFn(data);
            },
            error: function(data) {
                if (DEBUG)
                    alert("static words error");
            }
        });
    };
    
    // Gets random words from a list of custom words
    this.getCustomWords = function(successFn, customListID) {
        var parameters = {
            'id' : customListID
        };
        $.ajax({
            url: "/custom-words/",
            type: "GET",
            dataType: "json",
            data: parameters,
            success: function(data) {
                successFn(data);
            },
            error: function(data) {
                if (DEBUG)
                    alert("custom words error");
            }
        })
    }

    // Get forms for the requested custom list id
    this.getCustomListForms = function(successFn, customListID) {
        var parameters = {
            "custom_list_id" : customListID
        };
        $.ajax({
            url: "/edit-customlist/",
            type: "GET",
            dataType: "html",
            data: parameters,
            success: function(data) {
                successFn(data);
            },
            error: function(data) {
                if (DEBUG)
                    alert("getCustomListForms ajax error");
            }
        });
    };

    // Pushes game data to the server based on the score fed into the
    // function.  To be called on game completion
    this.pushGameData = function(score, definitions, words, mode) {
        $.ajax({
            url: "/push-game-data/",
            type: "POST",
            dataType: "json",
            data: {
                "score" : score,
                "definitions" : definitions,
                "words" : words,
                "mode" : mode
            },
            headers: {"X-CSRFToken" : $.cookie('csrftoken')},
            success: function(response) {
                window.__lastGame = response.id;
            },
            error: function(data) {
                if (DEBUG)
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
                // always errors if user is not logged in.
                // probably better to send back an empty
                // JSON object from server
            }
        });
    };

    // fetches the top (up to) n leaders from the leaderboard, passes the
    // returned array to the success function as an array of dictionaries,
    // where each dictionary has the form {"user": username, "rank": rank,
    // "score": score}, where score is the total score the user has
    // accumulated over all games played
    this.getLeaderboard = function(n) {
        $.ajax({
            url: "/get-leaderboard/",
            type: "GET",
            dataType: "json",
            data: {"count" : n},
            success: function(data) {
                insertLeaderboardData(data);
            },
            error: function(data) {
                if (DEBUG)
                    alert("getLeaderboard ajax error");
            }
        });
    };

    // get the rank and high score for the currently logged-in user
    // and passes the data to the success function. If no user is logged
    // in, data == {}
    this.getUserRank = function() {
        // could add this to getUserData, but currently the front-end team
        // prefers to have it as a separate method
        $.ajax({
            url: "/get-user-rank/",
            type: "GET",
            dataType: "json",
            success: function(data) {
                insertUserRank(data);
            },
            error: function(data) {
                if (DEBUG)
                    alert("getUserRank ajax error");
            }
        });
    };
    
    this.postToFacebook = function(profileID, link, score, access_token) {
        data = {
            access_token: access_token,
            message: "I just got a score of " + score + " on Tile To The Top!  Can you beat my score?",
            link: link,
            name: "Tile To The Top Game."
        };
        $.ajax({
            url: "https://graph.facebook.com/" + profileID + "/feed/",
            type: "POST",
            dataType: "json",
            data: data,
            success: function() {
                
            },
            error: function() {
                
            }
        })
    };
};
