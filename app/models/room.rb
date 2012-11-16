class Room < ActiveRecord::Base
  include SongHelper

  def queue_key
    return "room:#{id}:queue"
  end

  def queued_songs
    $redis.lrange(queue_key, 0, -1).map{|song| JSON.parse(song)}
  end

  def enqueue_song(provider, identifier)
    last_song = JSON.parse($redis.lindex(queue_key, -1) || "{}")
    previous_time = last_song['playAt'] || Time.now.to_i

    new_time = (last_song['duration'] || 0).to_i + previous_time.to_i

    # If the last song has already ended then we want to queue up the
    # song now, not in the past.
    new_time = [new_time, Time.now.to_i].max

    new_song = get_song_info(provider, identifier)

    $redis.rpush(queue_key, new_song.merge({
      :playAt => new_time,
      :createdAt => Time.now().to_i
    }).to_json)
  end
end
