class Room < ActiveRecord::Base
  # attr_accessible :title, :body
  def queue_key
    return "room:#{id}:queue"
  end

  def queued_songs
    $redis.lrange(queue_key, 0, 10).map{|song| JSON.parse(song)}
  end

  def enqueue_song(provider, identifier, duration)
    last_song = JSON.parse($redis.lindex(queue_key, -1) || "{}")
    previous_time = last_song['play_at'] || Time.now.to_i

    new_time = (last_song['duration'] || 0).to_i + previous_time.to_i

    # If the last song has ended then we want to queue up the song
    # now, not in the past.
    new_time = [new_time, Time.now.to_i].max

    $redis.rpush(queue_key, {
      :provider => provider,
      :identifier =>  identifier,
      :play_at => new_time,
      :duration => duration
    }.to_json)
  end
end
