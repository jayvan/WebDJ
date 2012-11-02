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
    songs = room.queued_songs

    respond_to do |format|
      format.xml { render :xml => songs.to_xml }
      format.json { render :json => songs.to_json }
    end
  end

  def enqueue
    room = Room.find(params['id'])
    room.enqueue_song(params['provider'], params['media_id'], params['duration'])

    render :nothing => true
  end
end
