module SongHelper
  require 'open-uri'
  require 'net/http'

  def get_song_info(provider, media_id)
    delegated_method = "get_#{provider}_song_info"
    if defined? delegated_method
      return {
        :mediaId => media_id,
        :provider => provider
      }.merge(send(delegated_method, media_id))
    else
      throw :noProvider
    end
  end

  def get_youtube_song_info(media_id)
    url = "https://gdata.youtube.com/feeds/api/videos/#{media_id}?v=2&alt=json";
    json = JSON.parse(open(url).read)
    return {
      :title => json['entry']['title']['$t'],
      :artist => json['entry']['author'][0]['name']['$t'],
      :duration => json['entry']['media$group']['media$content'][0]['duration']
    }
  end

  def get_soundcloud_song_info(media_id)
    url = "http://api.soundcloud.com/tracks/#{media_id}.json?client_id=#{ENV['SOUNDCLOUD_KEY']}"
    json = JSON.parse(open(url).read)
    get_stream_url = json['stream_url'] + "?client_id=#{ENV['SOUNDCLOUD_KEY']}&allow_redirects=False"
    stream_url = Net::HTTP.get_response(URI(get_stream_url)).response['location']
    return {
      :title => json['title'],
      :artist => json['user']['username'],
      :duration => (json['duration'] / 1000.0).ceil,
      :streamUrl => stream_url
    }
  end
end
