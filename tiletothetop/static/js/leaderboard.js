// This file contains all the code necessary for retrieving and
// inserting the leaderboard into the user interface.

function getLeaderboard(count) {
    messenger.getLeaderboard(count);
}

function getUserRank() {
    messenger.getUserRank();
}

function insertLeaderboardData(data) {
    $("#leaderboard_table").html("");
    for (var i = 0; i < data.length; i++) {
	var d = data[i];

	// create row element, append rank, user, and score elements
	var row = $("<tr>");
	row.append($("<td>").text(d.rank));
	row.append($("<td>").text(d.user));
	row.append($("<td>").text(d.score));

	// Now just add the row to the table
	$("#leaderboard_table").append(row);
    }
}

function insertUserRank(data) {
    if (data === null)
        return;

    $("#user_rank").html("");
    var div = $('<div id="user_rank">');
    var rank = $("<p>").text("Your Rank: " + data.rank).css({'float':'left'});
    var score = ($("<p>").text("Your High Score: " + data.score).css({'float':'right'}));
    div.append(rank).append(score);
    div.insertBefore($("#leaderboard_table"));
}
