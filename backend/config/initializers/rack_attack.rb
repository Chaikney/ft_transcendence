class Rack::Attack

  throttle('req/ip', limit: 100, period: 1.minute) do |req|
    req.ip
  end

  throttle('logins/ip', limit: 5, period: 20.seconds) do |req|
    if req.path == '/api/login' && req.post?
      req.ip
    end
  end

  throttle('password_resets/ip', limit: 3, period: 1.hour) do |req|
    if req.path == '/api/password_resets' && req.post?
      req.ip
    end
  end

  self.throttled_response = lambda do |env|
    [
      429, # HTTP Code: Too Many Requests
      { 'Content-Type' => 'application/json' },
      [{ 
        error: "CRITICAL_ERR: RATE_LIMIT_EXCEEDED", 
        message: "Demasiadas peticiones. Tu IP ha sido bloqueada temporalmente por el firewall." 
      }.to_json]
    ]
  end
end