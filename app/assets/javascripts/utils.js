define({
  // Rails is providing timestamps with second accuracy, but by default JS gives
  // Millisecond accuracy. This gives second accuracy so we can compare with the
  // server timestamps
  time: function() { return Math.floor(Date.now() / 1000); },

  // Takes in a duration in seconds and formats it
  // e.g. 123 => 2:03
  formatDuration: function(duration)
  {
    var minutes = Math.floor(duration / 60);
    var seconds = Math.floor(duration % 60);
    var formattedString = minutes + ':';
    formattedString += seconds < 10 ? '0' + seconds : seconds;
    return formattedString;
  }
});
