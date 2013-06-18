class RoomsController < ApplicationController
  before_filter :log_activity, :only => [:queue, :summary]
  before_filter :get_queue, :only => [:queue, :summary]
  before_filter :set_api_headers, :only => [:queue, :summary]

  def index
    @rooms = Room.first(39)
  end

  def go
    room = Room.find_or_create_by_name(params['room_name'])
    redirect_to room
  end

  def show
    @room = Room.find(params['id'])
    @title = @room.name
  end

  def queue
    respond_to do |format|
      format.xml { render :xml => @queue.to_xml }
      format.json { render :json => @queue.to_json, :callback => params[:callback] }
    end
  end

  def summary
    @room = Room.find(params['id'])
    data = {
      :timestamp => Time.now.to_i,
      :queue => @queue,
      :lastSkip => @room.last_skip,
      :activeUsers => @room.active_users
    }
    respond_to do |format|
      format.xml { render :xml => data.to_xml }
      format.json { render :json => data.to_json, :callback => params[:callback] }
    end
  end

  def enqueue
    room = Room.find(params['id'])
    room.enqueue_song(params['provider'], params['mediaId'])

    render :nothing => true
  end

  def dislike_song
    room = Room.find(params['id'])
    if (room.current_song['mediaId'] == params['mediaId'])
      room.dislike_song(request.session_options[:id])
    end
    render :nothing => true
  end

  def like_song
    room = Room.find(params['id'])
    if (room.current_song['mediaId'] == params['mediaId'])
      room.like_song(request.session_options[:id])
    end
    render :nothing => true
  end

  private

  def log_activity
    @room.log_activity(request.session_options[:id])
  end

  def get_queue
    @room = Room.find(params['id'])
    since = (params['lastUpdate'] || 0).to_i
    @queue = @room.queued_songs.select{|song| song['createdAt'] > since}
  end
end
