// This file contains the code for retrieving and inserting user
// account data into the game.

/* Gets the account data for the currently logged in user
 * clicking this button while not logged in is not currently
 * handled well
 */
function getAccountData() {
    messenger.getUserData();
}

function insertAccountData(data) {
    USER_DATA = data; // store for later use

    if (!data.hasOwnProperty('username')) {
        return; // not what we expected
    }

    $('#username').text(data.username);
    var prettyDate = data.date_joined.split(' ')[0];
    $('#date_joined').text(prettyDate);
    prettyDate = data.last_login.split(' ')[0];
    $('#last_login').text(prettyDate);
    $('#games_played').text(data.games_played);

    // some users don't have first, last names or emails
    // associated with their accounts
    if (!data.hasOwnProperty('first_name') || data.first_name === '') {
        $('#first_name').remove();
        $('#first_name_label').remove();
    } else {
        $('#first_name').text(data.first_name);
    }

    if (!data.hasOwnProperty('last_name') || data.last_name === '') {
        $('#last_name').remove();
        $('#last_name_label').remove();
    } else {
        $('#last_name').text(data.last_name);
    }
    if (!data.hasOwnProperty('email') || data.email === '') {
        $('#email').remove();
        $('#email_label').remove();
    } else {
        $('#email').text(data.email);
    }
}
