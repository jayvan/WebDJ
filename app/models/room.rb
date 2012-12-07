class Room < ActiveRecord::Base
  include SongHelper

  def queue_key
    return "room:#{id}:queue"
  end

  def activity_key
    return "room:#{id}:activity"
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

    trim_queue!
  end

  def active_users
    $redis.zcount(activity_key, Time.now.to_i - 1.minute, '+inf')
  end

  # Marks a user as active in the room
  def log_activity(user_id)
    $redis.zadd(activity_key, Time.now.to_i, user_id)
  end

  # Removes any songs that have already ended from the rooms queue
  # This is NOT an atomic operation. Before there are multiple app processes
  # this must be rewritten as an atomic LUA script
  def trim_queue!
    # Go through the song queue from start to end
    queued_songs.each_with_index do |song, index|
      if song['playAt'] + song['duration'] > Time.now.to_i
        # This song is still ok to have, trim of all the ones to the left
        $redis.ltrim(queue_key, index, -1)
        break
      end
    end
  end
end
