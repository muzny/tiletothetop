/**
 * Functions specific to building custom word lists.
 * See templates/wordlists.html
 */

function initializeWordListButtons() {
    initializeFormset();
    
    $('#new-list').click(createList);
    $('#edit-list').click(editList);
    
    $('#save-list').click(saveList);
    $('#delete-list').click(deleteList);
}

function initializeFormset() {
    $('#list-entries tr').formset({
        prefix: 'cw', // shouldn't hard code this
        addText: '+ Add row',
        deleteText: 'x'
    });
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
    
    // update re-rendered form
    initializeFormset();
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
