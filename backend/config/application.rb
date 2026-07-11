require_relative "boot"

require "rails/all"

require "action_cable/engine"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module TranscendenceBackend
  class Application < Rails::Application

    config.load_defaults 8.1
    config.autoload_lib(ignore: %w[assets tasks])
    config.api_only = true

    config.middleware.use Rack::Attack
  end
end
