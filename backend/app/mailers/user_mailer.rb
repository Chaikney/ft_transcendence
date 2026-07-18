class UserMailer < ApplicationMailer
  default from: 'noctyve.transcendence@gmail.com' 

  # Helper to take the BASE_URL
  def base_url
    @base_url ||= ENV['BASE_URL'] || 'https://10.13.1.6:8443'
  end

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
    @reset_url = "#{base_url}/reset-password/#{@user.reset_password_token}"
    
    mail(to: @user.email, subject: "[TRANSCENDENCE] Recuperación de credenciales")
  end
end