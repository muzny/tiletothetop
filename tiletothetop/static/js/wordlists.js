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
    // Check to make sure that all words are only composed of
    // characters that we support.
    var pattern = new RegExp("^[a-zA-Z 0-9]+$");
    var list = $("#list-entries").children();
    var okay = true;
    var count = 0;
    // go to length - 1 because the add row box is at the end of this list
    for (var i = 0; i < list.length - 1; i++) {
	if ($(list[i]).is(":visible")) {
	    var input = $($(list[i]).children()[2]).children();
	    var text = input.val(); // dependent on the form of the form
	    if (!pattern.test(text) || text.length > 10) {
		okay = false;
		input.css("border", "2px solid red");
	    } else {
		input.css("border", "2px solid white");
	    }
	    // There also must be a definition present
	    var def = $($(list[i]).children()[4]).children();
	    var defText = def.val();
	    if (defText.length == 0) {
		okay = false;
		def.css("border", "2px solid red");
	    } else {
		def.css("border", "2px solid white");
	    }
	    count += 1;
	}
    }
    if (okay && count >= 4) {
	$('#custom-form').attr('action', '/save-customlist/');
	$('#custom-form').submit();
    }
}

// If list already exists, request to delete
function deleteList() {
    $('#custom-form').attr('action', '/delete-customlist/');
    $('#custom-form').submit();
}
