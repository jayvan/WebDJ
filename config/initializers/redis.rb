uri = URI.parse(ENV["REDIS_URL"] || "localhost")
$redis = Redis.new(:host => uri.host, :port => uri.port, :password => uri.password)
