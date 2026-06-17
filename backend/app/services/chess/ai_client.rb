require 'json'
require 'net/http'
require 'uri'

module Chess
  class AiClient
    class Error < StandardError; end

    def initialize(base_url: ENV.fetch('CHESS_AI_ADVERSARY_URL', 'http://localhost:8000'))
      @base_url = base_url
    end

    def predict_move(fen:, time_limit_ms: 300)
      post_json('predict_move', { fen: fen, time_limit_ms: time_limit_ms })
    end

    def apply_move(fen:, move:)
      post_json('apply_move', { fen: fen, move: move })
    end

    private

    def post_json(path, payload)
      uri = URI.join(normalized_base_url, path)
      request = Net::HTTP::Post.new(uri)
      request['Content-Type'] = 'application/json'
      request.body = JSON.dump(payload)

      response = Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == 'https', open_timeout: 5, read_timeout: 10) do |http|
        http.request(request)
      end

      unless response.is_a?(Net::HTTPSuccess)
        raise Error, "Chess AI request failed with status #{response.code}: #{response.body}"
      end

      JSON.parse(response.body)
    rescue JSON::ParserError, SocketError, Timeout::Error, Errno::ECONNREFUSED => e
      raise Error, e.message
    end

    def normalized_base_url
      @base_url.end_with?('/') ? @base_url : "#{@base_url}/"
    end
  end
end