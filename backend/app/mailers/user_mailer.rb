class UserMailer < ApplicationMailer
  default from: 'noctyve.transcendence@gmail.com' 

  # 1. El que ya tenías (Para el registro)
  def confirmation_email
    @user = params[:user]
    @url  = "https://localhost:8443/verify-email?token=#{@user.confirmation_token}"
    
    mail(to: @user.email, subject: 'Transcendence - Activa tu cuenta')
  end

  # 🚀 2. EL NUEVO (Para recuperar la contraseña)
  def password_reset(user)
    @user = user
    # Este es el enlace mágico que el usuario pinchará en su correo
    @reset_url = "https://localhost:8443/reset-password/#{@user.reset_password_token}"
    
    mail(to: @user.email, subject: "[TRANSCENDENCE] Recuperación de credenciales")
  end
end