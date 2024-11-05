import { transporter } from "../config/nodemailer"

interface IEmail {
    email: string
    user: string
    token: string
}

export class AuthEmail {
    static sendConfirmationEmail = async (user : IEmail) => {
        const info = await transporter.sendMail({
            from: 'UpTask <admin@uptask.com>',
            to: user.email,
            subject: 'UpTask - Confirma tu cuenta',
            text: 'UpTask - Confirma tu cuenta',
            html: `<p>Hola: ${user.user} has creado tu cuenta en UpTask, ya casi está todo listo, sólo debes confirmar tu cuenta</p>
                    <p>Visita el siguiente enlace: </p>
                    <a href=${process.env.FRONTEND_URL}/auth/confirm-account>Confirmar cuenta</a>
                    <p>Tu código de confirmación es: <b>${user.token}</b></p>
                    <p>Este token expira en 10 minutos</p>`
        })

        console.log('Correo enviado', info.messageId)
    }

    static sendPasswordResetToken = async (user : IEmail) => {
        const info = await transporter.sendMail({
            from: 'UpTask <admin@uptask.com>',
            to: user.email,
            subject: 'UpTask - Reestablece tu contraseña',
            text: 'UpTask - Reestablece tu contraseña',
            html: `<p>Hola: ${user.user} has solicitado reestablecer tu contraseña</p>
                    <p>Visita el siguiente enlace: </p>
                    <a href=${process.env.FRONTEND_URL}/auth/new-password>Reestablece tu contraseña</a>
                    <p>Tu código de confirmación es: <b>${user.token}</b></p>
                    <p>Este token expira en 10 minutos</p>`
        })

        console.log('Correo enviado', info.messageId)
    }
}