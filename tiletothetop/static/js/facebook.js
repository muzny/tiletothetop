function sendFacebookPost() {

    var message = $('#id_message').val(),
        link = $('#id_link').val();
    
    $('#facebook-form-container').addClass("hide");
    messenger.postToFacebook(link, message);

}

function removeFacebookModal() {
    
    $('#facebook-form-container').addClass("hide");
    
}