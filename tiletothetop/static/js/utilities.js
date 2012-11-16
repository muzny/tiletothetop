//Disables selection of the calling object
//Source: http://aleembawany.com/2009/01/20/disable-selction-on-menu-items-with-this-jquery-extension/
jQuery.fn.extend({ 
        disableSelection : function() { 
                return this.each(function() { 
                        this.onselectstart = function() { return false; }; 
                        this.unselectable = "on"; 
                        jQuery(this).css('user-select', 'none'); 
                        jQuery(this).css('-o-user-select', 'none'); 
                        jQuery(this).css('-moz-user-select', 'none'); 
                        jQuery(this).css('-khtml-user-select', 'none'); 
                        jQuery(this).css('-webkit-user-select', 'none'); 
                }); 
        } 
}); 

//Centers a jQuery Object onto it's parent, assumes the child is absolutly postioned
jQuery.fn.extend({
	centerOnParent : function() {
		var parentOffset = this.parent().offset();
		var parentBorderTemp = this.parent().css('border-left-width');
		var parentBorder = parseInt(parentBorderTemp, 10);
		if(isNaN(parentBorder)) {
			parentBorder = 0;
		}
		var top = (this.parent().height() - this.height())/2;
		var left = (this.parent().width() - this.width())/2;
		var thisOffset = {top:top + parentOffset.top + parentBorder, left:left + parentOffset.left + parentBorder};
		this.offset(thisOffset);
	}
});