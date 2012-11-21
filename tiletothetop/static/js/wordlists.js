/**
 * Functions specific to building custom word lists.
 * See templates/wordlists.html
 */

// List to write to server.
//var customList = null;

function initializeWordListButtons() {
    //$('#create-list').click(createList);
    $('#edit-list').click(editList);
    
    $('#add-word').click(addWord);
    // there shouldn't be any rows loaded at start
    $('.remove-word').click(removeWord);
    $('.edit-word').click(editWord);
    
    $('#save-list').click(saveList);
    $('#delete-list').click(deleteList);
}

function setListName(listName) {
    $('#list-name').text(listName);
}

// nope
/*
function createList() {
    var listName = $('#new-list-name').val();
    setListName(listName);
    $('#new-list-name').val('');
    
    // remove previous words from display
    // TODO should have warning about discarding edits, if any
    $('#list-entries').children().remove()
}
*/

function editList() {
    var listName = $('#existing-list-name').val()
    setListName(listName);
    
    // TODO get stuff from db
}

function addWord() {
    /*
    <tr id="custom-word-0">
        <td>petrichor</td>
        <td></td>
        <td>the name for the smell of rain on dry ground, is from oils given off by vegetation, absorbed onto neighboring surfaces, and released into the air after a first rain</td>
        <td><button type="button" class="btn btn-small remove-word">X</button></td>
        <td><button type="button" class="btn btn-small edit-word">E</button></td>
    </tr>
    */
    //var nextId = $('#list-entries').children().size(); // maybe not important
    // TODO needs to be cleaner
    // TODO validation
    var word = $('#word-name').val();
    var part = $('#word-part').val();
    var defn = $('#word-defn').val();
    var row = $('<tr>');
    row.append($('<td>').text(word));
    row.append($('<td>').text(part));
    row.append($('<td>').text(defn));
    var removeButton = $('<td><button type="button" class="btn btn-small remove-word">X</button></td>');
    removeButton.click(removeWord);
    row.append(removeButton);
    var editButton = $('<td><button type="button" class="btn btn-small edit-word">E</button></td>');
    editButton.click(editWord);
    row.append(editButton);
    $('#list-entries').append(row);
    
    // clear the form
    $('#word-name').val('');
    $('#word-part').val('');
    $('#word-defn').val('');
}

// Remove target row from current words table
function removeWord(e) {
    // target element is a button nested under a td
    // need to remove entire row
    $(e.target).parent().parent().remove();
}

// Convert data in the target row to input fields.
// When row is out of focus, convert back to plain text.
function editWord() {
    
}

// Parse words table to create JSON object, push to server
function saveList() {
    
}

// If list already exists, request to delete
function deleteList() {
    
}

/*
function CustomWordList(name) {
    this.name = name;
    this.words = [];
}
*/
