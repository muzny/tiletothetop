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
        prefix: 'cw',
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

// Validate, push to server
function saveList() {
    // Check to make sure that all words are only composed of
    // characters that we support.
    var pattern = new RegExp("^[a-zA-Z 0-9]*$");
    var list = $("#list-entries").children("tr");
    var okay = true;
    var count = 0;
    var emptyRows = [];

    // Must have a list name
    var nameControl = $('#div_id_name');
    var name = nameControl.children().children("#id_name").val().trim();
    if (name.length == 0) {
        okay = false;
        nameControl.addClass("error");
    } else {
        nameControl.removeClass("error");
    }

    for (var i = 0; i < list.length; i++) {
        if ($(list[i]).is(":visible")) {
            var cols = $(list[i]).children("td");
            var input = $(cols[0]).children();
            var text = input.children().children().val().trim(); // dependent on the form of the form
            var def = $(cols[2]).children();
            var defText = def.children().children().val().trim();
            
            // invalid or empty when required
            if ((!pattern.test(text) || text.length > 10) || text.length == 0 && defText.length != 0) {
                okay = false;
                input.addClass("error");
            } else {
                input.removeClass("error")
            }
            // There also must be a definition present
            if (defText.length == 0 && text.length != 0) {
                okay = false;
                def.addClass("error");
            } else {
                def.removeClass("error");
            }
            
            // Count only non-empty rows
            if (text.length != 0 && defText.length != 0) {
                count++;
            } else if (emptyRows.length < NUM_WORDS && text.length == 0 && defText.length == 0) {
                emptyRows.push([input, def]);
            }
        }
    }
    
    // Check whether empty rows are errors
    for (var i = 0; i < emptyRows.length; i++) {
        if (i < NUM_WORDS-count) {
            $.each(emptyRows[i], function(index, col) {
                col.addClass("error");
            });
        } else {
            $.each(emptyRows[i], function(index, col) {
                col.removeClass("error");
            });
        }
    }
    
    if (okay && count >= NUM_WORDS) {
        $('#custom-form').attr('action', '/save-customlist/');
        $('#custom-form').submit();
    }
}

// If list already exists, request to delete
function deleteList() {
    $('#custom-form').attr('action', '/delete-customlist/');
    $('#custom-form').submit();
}
