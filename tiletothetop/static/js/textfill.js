// Code based off of http://stackoverflow.com/questions/687998/auto-size-dynamic-text-to-fill-fixed-size-container
// Modifications made so that all text assumes the largest size
// allowable by one of the containers.
//
// The text should be in <span> elements within the <div> elements
// that call this function.
// e.g. $(".myclass").textfill({maxFontPixels: 700})

;(function($) {
    $.fn.textfill = function(options) {
        var fontSize = options.maxFontPixels;
        var ourText = $('span:visible:first', this);
        var maxHeight = $(this).height();
        var maxWidth = $(this).width();
        var textHeight;
        var textWidth;
	// Find the span with the longest text
	var maxText = $(ourText[0]).text();
	var maxSpan = $(ourText[0]);
	$.each(ourText, function(index) {
	    if ($(ourText[index]).text().length > maxText.length) {
		maxText = $(ourText[index]).text();
		maxSpan = $(ourText[index]);
	    }
	});
        do {
            maxSpan.css('font-size', fontSize);
            textHeight = maxSpan.height();
            textWidth = maxSpan.width();
            fontSize = fontSize - 1;
        } while ((textHeight > maxHeight || textWidth > maxWidth) && fontSize > 3);
	ourText.css('font-size', fontSize);
        return this;
    }
})(jQuery);
