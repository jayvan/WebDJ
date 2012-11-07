define([
  "providers/youtube"
], function(
  Youtube
){
  return {
    getInfo: function(song) {
      var apiUrl = "https://gdata.youtube.com/feeds/api/videos/" + song.id + "?v=2&alt=json-in-script&callback=?";
      $.getJSON(apiUrl, function(data) {
        song.artist(data.entry.author[0].name.$t);
        song.title(data.entry.title.$t);
        song.duration(data.entry.media$group.media$content[0].duration);
      });
    },
    play: function(song) {

    }
  };
});
