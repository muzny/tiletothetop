function sendFacebookPost() {

    var message = $('#id_message').val(),
        link = $('#id_link').val(),
        score = $('#score-final').text(),
        message_parsed = message.replace("{score}", score);
        
    
    $('#facebook-form-container').addClass("hide");
    messenger.postToFacebook(link, message_parsed);

}

function removeFacebookModal() {
    
    $('#facebook-form-container').addClass("hide");
    
}