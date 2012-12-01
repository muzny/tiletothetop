/**
 * Functions specific to building custom word lists.
 * See templates/wordlists.html
 */

function initializeWordListButtons() {
    $('#new-list').click(createList);
    $('#edit-list').click(editList);
    
    $('#save-list').click(saveList);
    $('#delete-list').click(deleteList);
}

function createList() {
    messenger.getCustomListForms(displayForms, -1);
}

function editList() {
    var customListID = parseInt($('#existing-list-name').val());
    
    // get forms from db
    if (customListID)
        messenger.getCustomListForms(displayForms, customListID);
}

// getCustomListForms callback
function displayForms(data) {
    var result = $('#custom-form-content', data).html();
    $('#custom-form-content').html(result);
    
    var listName = $('#id_name').val();
    if (listName) {
        $('#build-help-text').text('Editing list "' + listName + '":');
    } else {
        $('#build-help-text').text('Build your list:');
    }
}

function addWord() {
    // TODO add new row to custom words formset?
    
    var word = $('#word-name').val();
    var part = $('#word-part').val();
    var defn = $('#word-defn').val();
    var row = $('<tr>');
    row.append($('<td>').append($('<div contenteditable>').text(word)));
    row.append($('<td>').append($('<div contenteditable>').text(part)));
    row.append($('<td>').append($('<div contenteditable>').text(defn)));
    var removeButton = $('<td><button type="button" class="btn btn-small remove-word">X</button></td>');
    removeButton.click(removeWord);
    row.append(removeButton);
    $('#list-entries').append(row);
    
    // clear the form
    $('#word-name').val('');
    $('#word-part').val('');
    $('#word-defn').val('');
}

// Validate(?), push to server
function saveList() {
    $('#custom-form').attr('action', '/save-customlist/');
    $('#custom-form').submit();
}

// If list already exists, request to delete
function deleteList() {
    $('#custom-form').attr('action', '/delete-customlist/');
    $('#custom-form').submit();
}
