Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # Acotamos los orígenes permitidos al puerto exacto de vuestro Frontend
    origins 'http://localhost:5173', 'http://127.0.0.1:5173'

    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true # <--- CLAVE: Permite compartir cookies y sesiones entre contenedores
  end
end