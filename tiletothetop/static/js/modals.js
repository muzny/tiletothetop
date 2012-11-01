$(function () {
    $("#login-button").click(function () {
        $("#login-modal").modal();
    });
    $("#register-button").click(function () {
        $("#register-modal").modal();
    });

    if ($("#register-modal").find(".errorlist").length > 0) {
        $("#register-modal").modal();
    }
    else if ($("#login-modal").find(".errorlist").length > 0) {
        $("#login-modal").modal();
    }
});
