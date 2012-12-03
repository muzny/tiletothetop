function getLeaderboard(count) {
    messenger.getLeaderboard(count);
}

function getUserRank() {
    messenger.getUserRank();
}

function insertLeaderboardData(data) {
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
	return; // Don't do anything for now.
	if (data !== null)
		alert("rank: " + data.rank + "\nhigh score: " + data.score);
	else
		alert("no rank, user not authenticated");
}
