$(function () {
    $("#login-button").click(function () {
        $("#login-modal").modal();
    });
    $("#register-button").click(function () {
        $("#register-modal").modal();
    });

    var register_errors = $("#register-modal").find(".field-error");
    var login_errors = $("#login-modal").find(".field-error");
    if ($("#register-modal").find(".errorlist").length > 0
        || $.grep(register_errors, function(e) { return $(e).html() != ""}).length > 0) {
        $("#register-modal").modal();
    }
    else if ($("#login-modal").find(".errorlist").length > 0
             || $.grep(login_errors, function(e) { return $(e).html() != ""}).length > 0)  {
        $("#login-modal").modal();
    }

    // this is just a quick fix to an old bug in facebook authentication where it appends
    // #_=_ to the redirect url
    if (window.location.hash == "#_=_" || window.location.hash == "#") {
        window.location.hash = "";
    }
});
