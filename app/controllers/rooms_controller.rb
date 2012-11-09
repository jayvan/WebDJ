class RoomsController < ApplicationController

  def index
    room = Room.find_or_create_by_name(params['room_name'])
    redirect_to room
  end

  def show
    @room = Room.find(params['id'])
  end

  def queue
    room = Room.find(params['id'])
    since = (params['last_update'] || 0).to_i
    songs = room.queued_songs.select{|song| song['created_at'] > since}

    respond_to do |format|
      format.xml { render :xml => songs.to_xml }
      format.json { render :json => songs.to_json }
    end
  end

  def enqueue
    room = Room.find(params['id'])
    room.enqueue_song(params['provider'], params['media_id'], params['duration'].to_i)

    render :nothing => true
  end
end
