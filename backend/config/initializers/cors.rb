Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins "*" 

    resource "http://localhost:5173/",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end