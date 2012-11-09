define([
  "utils"
], function(
  Utils
){
  return {
    getInfo: function(song) {
      var apiUrl = "https://gdata.youtube.com/feeds/api/videos/" + song.id + "?v=2&alt=json-in-script&callback=?";
      $.getJSON(apiUrl, function(data) {
        song.artist(data.entry.author[0].name.$t);
        song.title(data.entry.title.$t);
        song.duration(data.entry.media$group.media$content[0].duration);
        song.load();
      });
    },

    load: function(song) {
      var autoplay = Utils.time() < song.playAt + song.duration() ? 1: 0;
      var loadPosition = Math.max(Utils.time() - song.playAt, 0);
      var embedUrl = "https://www.youtube-nocookie.com/v/" + song.id + "?version=2&autoplay=" + autoplay + "&enablejsapi=1&start=" + loadPosition;
      var playerHTML = '<object type="application/x-shockwave-flash" width="1" height="1" data="' + embedUrl + '" style="visibility:hidden;display:inline;"><param name="movie" value="' + embedUrl + '" /><param name="wmode" value="transparent" /></object>';

      $playerHTML = $(playerHTML);
      $('#playback').append($playerHTML);
      song.loaded(true);

      // If we aren't playing the song now, cue it up

    }
  };
});
