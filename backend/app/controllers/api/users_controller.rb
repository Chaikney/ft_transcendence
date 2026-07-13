module Api
  class UsersController < ApplicationController
    before_action :authorize_request

    # GET /api/profile
    def profile
      # 🚀 INYECCIÓN: Fusionamos los datos del usuario con su historial
      user_data = @current_user.as_json(only: [:id, :username, :email, :avatar_url, :elo, :status, :wins, :losses])
                               .merge(match_history: build_match_history(@current_user))
      
      render json: user_data, status: :ok
    end

    # GET /api/users/:username
    def show
      target_user = User.find_by(username: params[:username])
      
      if target_user.nil?
        return render json: { error: "Usuario extraviado en el vacío" }, status: :not_found
      end

      # Si soy yo mismo, devuelvo mis datos normales
      if target_user.id == @current_user.id
        user_data = target_user.as_json(only: [:id, :username, :email, :avatar_url, :elo, :status, :wins, :losses])
                               .merge(match_history: build_match_history(target_user))
                               
        return render json: { 
          user: user_data,
          is_me: true 
        }, status: :ok
      end

      # 🛡️ PROTECCIÓN ACTIVA: Intentamos calcular el H2H con un salvavidas
      h2h = { total: 0, wins: 0, losses: 0 }
      
      begin
        # ⚔️ EL CARA A CARA: Solo partidas vuestras Y que estén terminadas
        games_together = Game.where(
          "((player1_id = ? AND player2_id = ?) OR (player1_id = ? AND player2_id = ?))",
          @current_user.id, target_user.id, target_user.id, @current_user.id
        ).where(status: 'finished')

        h2h = {
          total: games_together.count,
          wins: games_together.where(winner_id: @current_user.id).count,
          losses: games_together.where(winner_id: target_user.id).count
        }
      rescue => e
        # 🚨 Si explota, lo pintamos en rojo en consola pero NO tiramos el servidor
        Rails.logger.error "🚨 ERROR CALCULANDO H2H: #{e.message}"
      end

      # Devolvemos los datos del amigo SANOS Y SALVOS (con historial incluido)
      user_data = target_user.as_json(only: [:id, :username, :avatar_url, :elo, :status, :wins, :losses])
                             .merge(match_history: build_match_history(target_user))

      render json: {
        user: user_data,
        is_me: false,
        h2h: h2h
      }, status: :ok
    end

    # PUT /api/profile
    def update
      if @current_user.update(user_params)
        render json: { message: "Identidad actualizada", user: @current_user }, status: :ok
      else
        render json: { errors: @current_user.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # DELETE /api/profile
    def destroy
      @current_user.destroy
      render json: { message: "Cuenta eliminada permanentemente del sistema" }, status: :ok
    end

    # ─── MÉTODOS DE 2FA ───────────────────────────────────────

    # GET /api/profile/2fa/enable
    def enable_2fa
      @current_user.generate_otp_secret
      
      qrcode = RQRCode::QRCode.new(@current_user.mfa_provisioning_uri)
      svg = qrcode.as_svg(
        color: "000000",
        shape_rendering: "crispEdges",
        module_size: 4,
        standalone: true,
        use_path: true
      )
      
      render json: { qr_svg: svg, secret: @current_user.otp_secret }, status: :ok
    end

    # POST /api/profile/2fa/verify
    def verify_2fa
      totp = ROTP::TOTP.new(@current_user.otp_secret, issuer: "Noctyve_Transcendence")
      
      if totp.verify(params[:code])
        @current_user.update(mfa_enabled: true)
        render json: { message: "2FA Activado correctamente" }, status: :ok
      else
        render json: { error: "Código incorrecto o expirado" }, status: :unauthorized
      end
    end

    private

    def user_params
      # Aseguramos que solo se permitan los atributos necesarios
      params.require(:user).permit(:username, :email, :password, :avatar_url)
    end

    # 🚀 NUEVO: Prepara el historial de partidas formateado
    # Ahora está correctamente dentro de la sección "private" de la clase
    def build_match_history(target_user)
      Game.where("(player1_id = ? OR player2_id = ?) AND status = 'finished'", target_user.id, target_user.id)
          .order(updated_at: :desc)
          .limit(100) # 🛡️ Límite para no saturar la red si un usuario tiene 500 partidas
          .map do |game|
            
            # ♟️ Lógica de resultados estándar de ajedrez
            result = if game.winner_id.nil?
                       "1/2-1/2" # Empate
                     elsif game.winner_id == game.player1_id
                       "1-0"     # Ganan Blancas (Player 1)
                     else
                       "0-1"     # Ganan Negras (Player 2)
                     end

            {
              id: game.id,
              result: result,
              white: {
                username: game.player1&.username || 'Unknown',
                avatar_url: game.player1&.avatar_url,
                elo: game.player1&.elo || 0
              },
              black: {
                username: game.player2&.username || 'Unknown',
                avatar_url: game.player2&.avatar_url,
                elo: game.player2&.elo || 0
              },
              date: game.updated_at
            }
          end
    end
  end
end