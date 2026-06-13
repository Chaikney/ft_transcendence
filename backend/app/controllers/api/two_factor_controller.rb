module Api
  class TwoFactorController < ApplicationController
    before_action :authorize_request

    # GET /api/2fa/generate (Devuelve el QR y el secreto)
    def generate
      # Si el usuario no tiene un secreto, le fabricamos uno
      if @current_user.otp_secret.blank?
        @current_user.update(otp_secret: ROTP::Base32.random)
      end

      # Preparamos el generador con el nombre de tu proyecto
      totp = ROTP::TOTP.new(@current_user.otp_secret, issuer: "Transcendence")
      provisioning_uri = totp.provisioning_uri(@current_user.username)

      # Creamos la imagen del QR en formato SVG
      qrcode = RQRCode::QRCode.new(provisioning_uri)
      svg = qrcode.as_svg(
        color: "000",
        shape_rendering: "crispEdges",
        module_size: 4,
        standalone: true,
        use_path: true
      )

      render json: { 
        qr_code: svg, 
        secret: @current_user.otp_secret # Por si Manu quiere dar la opción de meterlo a mano
      }, status: :ok
    end

    # POST /api/2fa/verify (Comprueba el PIN de 6 dígitos que manda Manu)
    def verify
      return render json: { error: "Primero debes generar el QR" }, status: :bad_request if @current_user.otp_secret.blank?

      totp = ROTP::TOTP.new(@current_user.otp_secret)
      
      # Verificamos si el PIN que nos envían en params[:code] es válido
      if totp.verify(params[:code])
        @current_user.update(otp_enabled: true)
        render json: { message: "2FA activado con éxito. Búnker sellado." }, status: :ok
      else
        render json: { error: "Código incorrecto o caducado." }, status: :unauthorized
      end
    end

    # DELETE /api/2fa/disable (Para apagarlo)
    def disable
      @current_user.update(otp_enabled: false, otp_secret: nil)
      render json: { message: "2FA desactivado. Has vuelto a la zona de riesgo." }, status: :ok
    end
  end
end