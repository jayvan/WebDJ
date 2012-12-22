class Room < ActiveRecord::Base
  include SongHelper

  default_scope order('updated_at DESC')
  validates_presence_of :name

  def queue_key
    return "room:#{id}:queue"
  end

  def activity_key
    return "room:#{id}:activity"
  end

  def likes_key
    return "room:#{id}:likes"
  end

  def dislikes_key
    return "room:#{id}:dislikes"
  end

  def last_skip_key
    return "room:#{id}:last_skip"
  end

  def thumbnail
    json = JSON.parse($redis.lindex(queue_key, 0) || "{}")
    thumbnail = json['thumbnail'] if json
    return thumbnail || "http://i1.ytimg.com/vi/mqdefault.jpg"
  end

  def queued_songs
    $redis.lrange(queue_key, 0, -1).map{|song| JSON.parse(song)}
  end

  def current_song
    clean_queue!
    json = $redis.lindex(queue_key, 0)
    return json.nil? ? nil : JSON.parse(json)
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

    clean!
    touch
  end

  def active_users
    $redis.zcount(activity_key, Time.now.to_i - 1.minute, '+inf')
  end

  def likes
    current = current_song
    current.nil? ? 0 : $redis.zcount(likes_key, current['play_at'], '+inf')
  end

  def dislikes
    current = current_song
    current.nil? ? 0 : $redis.zcount(dislikes_key, current['play_at'], '+inf')
  end

  # Marks a user as active in the room
  def log_activity(user_id)
    $redis.zadd(activity_key, Time.now.to_i, user_id)
  end

  def like_song(user_id)
    $redis.zadd(likes_key, Time.now.to_i, user_id)
    $redis.zrem(dislikes_key, user_id)
  end

  def dislike_song(user_id)
    $redis.zadd(dislikes_key, Time.now.to_i, user_id)
    $redis.zrem(likes_key, user_id)

    skip_song if (dislikes.to_f / active_users >= 0.5)
  end

  def skip_song
    play_time = Time.now.to_i
    new_queue = queued_songs[1..-1]
    $redis.del(queue_key)
    new_queue.each do |song|
      song['playAt'] = play_time
      song['createdAt'] = Time.now.to_i
      play_time += song['duration'].to_i
      $redis.rpush(queue_key, song.to_json)
    end
    $redis.set(last_skip_key, Time.now.to_i)
  end

  def last_skip
    ($redis.get(last_skip_key) || 0).to_i
  end

  # Calls all of the cleanup methods for the room
  def clean!
    clean_queue!
    clean_activity!
  end

  # Removes any songs that have already ended from the rooms queue
  # This is NOT an atomic operation. Before there are multiple app processes
  # this must be rewritten as an atomic LUA script
  def clean_queue!
    # Go through the song queue from start to end
    queued_songs.each_with_index do |song, index|
      if song['playAt'] + song['duration'] > Time.now.to_i
        # This song is still ok to have, trim of all the ones to the left
        $redis.ltrim(queue_key, index, -1)
        return
      end
    end

    # Okay, every song has played already, nuke it
    $redis.del(queue_key)
  end

  # Removes any old session IDs that have been inactive from the room for a minute
  def clean_activity!
    $redis.zremrangebyscore(activity_key, '-inf', Time.now.to_i - 1.minute)
  end
end
