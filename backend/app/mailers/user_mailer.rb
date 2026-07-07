class UserMailer < ApplicationMailer
  # 👇 Faltaban las comillas alrededor del correo
  default from: 'noctyve.transcendence@gmail.com' 

  def confirmation_email
    @user = params[:user]
    @url  = "http://localhost:5173/verify-email?token=#{@user.confirmation_token}"
    
    mail(to: @user.email, subject: 'Transcendence - Activa tu cuenta')
  end
end