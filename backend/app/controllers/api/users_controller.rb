module Api
  class UsersController < ApplicationController
    before_action :authorize_request

    # GET /api/profile
    def profile
      # 🚀 FIX: Añadimos :elo y los demás datos necesarios para el frontend
      render json: @current_user.as_json(only: [:id, :username, :email, :avatar_url, :elo, :status, :wins, :losses]), status: :ok
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
  end
end