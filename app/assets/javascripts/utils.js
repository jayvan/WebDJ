define({
  // Rails is providing timestamps with second accuracy, but by default JS gives
  // Millisecond accuracy. This gives second accuracy so we can compare with the
  // server timestamps
  time: function() { Math.floor(Date.now() / 1000); }
});
