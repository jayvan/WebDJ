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
      :artistURL => "http://youtube.com/#{json['entry']['author'][0]['name']['$t']}",
      :duration => json['entry']['media$group']['media$content'][0]['duration'],
      :thumbnail => json['entry']['media$group']['media$thumbnail'][0]['url']
    }
  end

  def get_soundcloud_song_info(media_id)
    url = "http://api.soundcloud.com/tracks/#{media_id}.json?client_id=#{ENV['SOUNDCLOUD_KEY']}"
    json = JSON.parse(open(url).read)
    return {
      :title => json['title'],
      :artist => json['user']['username'],
      :artistURL => json['user']['permalink_url'],
      :duration => (json['duration'] / 1000.0).ceil,
      :thumbnail => json['artwork_url'],
    }
  end
end
