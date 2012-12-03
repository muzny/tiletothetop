// Timer used when game is running. Can be paused and resumed.
var Timer = function() {
    var timerId, delay = 1000, start;
    var sec = 0;
    var min = 0;

    this.pause = function() {
        clearInterval(timerId);
    };

    this.getSec = function() {
	return sec;
    };
    
    this.getMin = function() {
	return min;
    };
    
    function timerIncrement(delay) {
	sec += delay / 1000;
	if (sec >= 60) {
	    var carry = sec / 60;
	    min += carry;
	    sec = sec % 60;
	}
    };

    // Pads n to have 2 digits by using a leading zero if necessary, then returns it.
    function pad2(n) {
	return n < 10 ? "0" + n : "" + n;
    };

    this.resume = function() {
	// Get the time to resume from.
        this.setStartTime();
        timerId = setInterval(function() {
	    if (!(isPaused() || inStartMenu)) {
		// Increment our internal timer numbers
		timerIncrement(delay);
		
		$("#min").html("" + pad2(min));
		$("#sec").html("" + pad2(sec));
	    }
	}, delay);
    };
    
    this.setStartTime = function() {
	var timeString = $("#timer-display").text().split(":");
	
	// Get the number of seconds and minutes that
	// have gone by.
	sec = parseInt(timeString[1]);
	min = parseInt(timeString[0]);
    };

    // Set the initial time to 00:00 and start the timer.
    $("#min").html("00");
    $("#sec").html("00");
    this.resume();
}
