define([
  "utils",
  'song-status'
], function(
  Utils,
  STATUS
){
  return {
    load: function(song) {
      var startPosition = Math.max(Utils.time() - song.playAt, 0);
      var embedUrl = "https://www.youtube-nocookie.com/v/" + song.mediaId + "?version=2&autoplay=1&enablejsapi=1&start=" + startPosition;
      var playerHTML = '<object allowScriptAccess="always" type="application/x-shockwave-flash" width="1" height="1" allowScriptAccess="always" data="' + embedUrl + '" style="visibility:hidden;display:inline;"><param name="movie" value="' + embedUrl + '" /><param name="wmode" value="transparent" /></object>';
      var $playerHTML = $(playerHTML);

      song.status(STATUS.LOADED);

      var timeUntilStart = Math.max(song.playAt - Utils.time(), 0) * 1000;
      var timeUntilEnd = (song.playAt + song.duration - Utils.time()) * 1000;
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
