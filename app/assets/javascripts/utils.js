define(function() {

  // The biggest discrepancy allowed between the server time and local time.
  var MAXIMUM_ALLOWED_TIME_DELTA = 10;

  // The difference between the server time and the local time
  var timeDelta = 0;

  var exports = {};

  // Rails is providing timestamps with second accuracy, but by default JS gives
  // Millisecond accuracy. This gives second accuracy so we can compare with the
  // server timestamps
  exports.rawTime = function() { return Math.floor(Date.now() / 1000); };

  exports.time = function() { return exports.rawTime() + timeDelta; };

  // If there is a large discrepancy between the server time and local time, offset all calculations involving the local time
  exports.calibrateTime = function(remoteTime) {
    if (Math.abs(exports.rawTime() - remoteTime) >= MAXIMUM_ALLOWED_TIME_DELTA) {
      timeDelta = remoteTime - exports.rawTime();
    }
  };

  // Takes in a duration in seconds and formats it
  // e.g. 123 => 2:03
  exports.formatTime = function(duration) {
    var minutes = Math.floor(duration / 60);
    var seconds = Math.floor(duration % 60);
    var formattedString = minutes + ':';
    formattedString += seconds < 10 ? '0' + seconds : seconds;
    return formattedString;
  };

  return exports;
});
