define([
  "song",
  "utils",
  'song-status'
], function(
  Song,
  utils,
  STATUS
){
  var youtube = {
    name: 'youtube'
  };

  youtube.load = function(song) {
    var startPosition = Math.max(utils.time() - song.playAt, 0);
    var embedUrl = "https://www.youtube-nocookie.com/v/" + song.mediaId + "?version=3&autoplay=1&enablejsapi=1&start=" + startPosition;
    var playerHTML = '<object allowScriptAccess="always" type="application/x-shockwave-flash" width="320" height="320" data="' + embedUrl + '" style="visibility:hidden;position:absolute;top:0;left:0;"><param name="movie" value="' + embedUrl + '" /><param name="wmode" value="transparent" /></object>';
    var $playerHTML = $(playerHTML);
    song.checkInterval = null;

    song.player = $playerHTML;
  };

  youtube.start = function(song) {
    $('#playback').append(song.player);
    song.checkInterval = setInterval(function() {
      if (song.player[0] && song.player[0].getCurrentTime) {
        var time = Math.round(song.player[0].getCurrentTime() || 0);
        song.currentTime(time);
      }
    }, 100);
  };

  youtube.stop = function(song) {
    clearInterval(song.checkInterval);
    song.player.remove();
  };

  youtube.setVolume = function(song, volume) {
    if (song.player[0].setVolume) {
      song.player[0].setVolume(volume * 100);
    } else {
      // The player isn't ready. Try again later
      window.setTimeout(function() {
        song.setVolume(volume);
      }, 200);
    }
  };

  youtube.search = function(query, callback) {
    var url = "https://gdata.youtube.com/feeds/api/videos?v=2&alt=json-in-script&callback=?&q=" + encodeURIComponent(query);
    $.getJSON(url, function(data) {
      // If there are no results
      if (data.feed.entry === undefined) {
        data.feed.entry = [];
      }

      callback(data.feed.entry.map(function(item) {
        var songData = {
          artist: item.author[0].name.$t,
          title: item.title.$t,
          provider: youtube,
          thumbnail: item.media$group.media$thumbnail[0].url,
          mediaId: item.media$group.yt$videoid.$t,
          duration: parseInt(item.media$group.yt$duration.seconds, 10)
        };
        return new Song(songData);
      }));
    });
  };

  return youtube;
});
