class ApiController < ApplicationController
  def soundcloud_search
    query = URI.escape(params['query'], Regexp.new("[^#{URI::PATTERN::UNRESERVED}]"))
    url = "http://api.soundcloud.com/tracks.json?client_id=#{ENV['SOUNDCLOUD_KEY']}&filter=streamable&q=#{query}"
    json = JSON.parse(open(url).read).first(5)

    respond_to do |format|
      format.json { render :json => json }
    end
  end
end
