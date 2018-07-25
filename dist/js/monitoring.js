var timeoutId = 0;
const TIMEOUT = 15000; // 15 secs
var action = 'restart' // reload

var reloadSource = function() {
  // Reload the current source and continue playback
  player.load(player.getConfig().source).then(function(player) { player.play(); });
};

var restartPlayback = function() {
  player.pause();
  player.play();
};

player.addEventHandler(player.EVENT.ON_STALL_STARTED, function() {
  // Start timeout on stall if not started yet
  if(timeoutId === 0) {
    // If player is stalling for TIMEOUT secs, something is wrong and we reload the source
    // If player stalls less time, the timeout will be cleared below
    if(action == 'restart') {
      timeoutId = setTimeout(restartPlayback, TIMEOUT);
    }
    else {
      timeoutId = setTimeout(reloadSource, TIMEOUT);
    }
    logIt('#console-output', 'Stall: ' + action + ' ' + timeoutId);
  }
});

player.addEventHandler(player.EVENT.ON_STALL_ENDED, function() {
  // Playback continues and we can clear the timeout
  clearTimeout(timeoutId);
  timeoutId = 0;
  logIt('#console-output', 'Stall Ended.');
});
