module Api
  class UsersController < ApplicationController
    # El guardia pide el Token a TODOS
    before_action :authorize_request 

    # Operación de Lectura (GET /api/profile)
    def profile
      render json: {
        id: @current_user.id, 
        username: @current_user.username,
        email: @current_user.email,
        avatar_url: @current_user.avatar_url
      }, status: :ok
    end

    # Operación de Actualización (PUT /api/profile)
    def update
      if @current_user.update(user_params)
        render json: { message: "Identidad actualizada", user: @current_user }, status: :ok
      else
        render json: { errors: @current_user.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # Operación de Destrucción (DELETE /api/profile)
    def destroy
      @current_user.destroy
      render json: { message: "Cuenta eliminada permanentemente del sistema" }, status: :ok
    end

    # ─── MÉTODOS DE 2FA ───────────────────────────────────────

    # GET /api/profile/2fa/enable
    def enable_2fa
      @current_user.generate_otp_secret
      uri = @current_user.mfa_provisioning_uri
      
      qrcode = RQRCode::QRCode.new(uri)
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

    # El Escudo (Strong Parameters)
    def user_params
      params.require(:user).permit(:username, :email, :password, :avatar_url)
    end
  end
end