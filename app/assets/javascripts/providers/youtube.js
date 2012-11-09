define([
  "utils",
  'song-status'
], function(
  Utils,
  STATUS
){
  return {
    getInfo: function(song) {
      var apiUrl = "https://gdata.youtube.com/feeds/api/videos/" + song.id + "?v=2&alt=json-in-script&callback=?";
      $.getJSON(apiUrl, function(data) {
        song.artist(data.entry.author[0].name.$t);
        song.title(data.entry.title.$t);
        song.duration(data.entry.media$group.media$content[0].duration);
        song.status(STATUS.HAVE_DATA);
        song.load();
      });
    },

    load: function(song) {
      var loadPosition = Math.max(Utils.time() - song.playAt, 0);
      var embedUrl = "https://www.youtube-nocookie.com/v/" + song.id + "?version=2&autoplay=1&enablejsapi=1&start=" + loadPosition;
      var playerHTML = '<object allowScriptAccess="always" type="application/x-shockwave-flash" width="1" height="1" allowScriptAccess="always" data="' + embedUrl + '" style="visibility:hidden;display:inline;"><param name="movie" value="' + embedUrl + '" /><param name="wmode" value="transparent" /></object>';
      $playerHTML = $(playerHTML);

      song.status(STATUS.LOADED);

      var timeUntilStart = Math.max(song.playAt - Utils.time(), 0) * 1000;
      var timeUntilEnd = (song.playAt + song.duration() - Utils.time()) * 1000;

      // Inject the html
      window.setTimeout(function() {
        $('#playback').append($playerHTML);
        song.status(STATUS.PLAYING);
      }, timeUntilStart);

      // Clean up the html
      window.setTimeout(function() {
        $playerHTML.remove();
        song.status(STATUS.FINISHED);
      }, timeUntilEnd);
    }
  };
});
