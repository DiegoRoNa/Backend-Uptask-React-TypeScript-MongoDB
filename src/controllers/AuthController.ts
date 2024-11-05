import type { Request, Response } from "express"
import colors from "colors"
import User from "../models/User"
import { checkPassword, hashPassword } from "../utils/auth"
import Token from "../models/Token"
import { generateToken } from "../utils/token"
import { AuthEmail } from "../emails/AuthEmail"
import { generateJWT } from "../utils/jwt"

export class AuthController {

    /**
     * Método para crear una cuenta
     * @param request 
     * @param response 
     * @returns 
     */
    static createAccount = async (request : Request, response : Response) => {
        try {
            const { password, email } = request.body

            // validar si ya existe el usuario
            const userExists = await User.findOne({email})

            if (userExists) {
                const error = new Error('El correo ya está registrado en otra cuenta')
                response.status(409).json({error: error.message})
                return
            }

            const user = new User(request.body)
            
            // hashear pass
            user.password = await hashPassword(password)

            // generar token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // enviar email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                user: user.name,
                token: token.token
            })
            
            await Promise.allSettled([user.save(), token.save()])

            response.send('Has creado tu cuenta, te hemos enviado un email a tu correo, revisa en la bandeja de entrada o en spam')
        } catch (error) {
            console.log(colors.bgRed.white.bold(error.message))
            response.status(500).json({error: 'No fue posible crear tu cuenta'})
        }
    }

    /**
     * Método para confirmar una cuenta
     * @param request 
     * @param response 
     * @returns 
     */
    static confirmAccount = async (request : Request, response : Response) => {
        try {
            const { token } = request.body

            // buscar token
            const tokenExists = await Token.findOne({token})

            if (!tokenExists) {
                const error = new Error('Token no válido')
                response.status(404).json({error: error.message})
                return
            }

            // buscar usuario
            const user = await User.findById(tokenExists.user)
            user.confirmed = true

            // guardar activacion y elminar token
            await Promise.allSettled([user.save(), tokenExists.deleteOne()])

            response.send('Cuenta confirmada correctamente')

        } catch (error) {
            console.log(colors.bgRed.white.bold(error.message))
            response.status(500).json({error: 'No fue posible confirmar tu cuenta'})
        }
    }

    /**
     * Método para login
     * @param request 
     * @param response 
     * @returns 
     */
    static login = async (request : Request, response : Response) => {
        try {
            const { password, email } = request.body

            // validar si ya existe el usuario
            const user = await User.findOne({email})

            if (!user) {
                const error = new Error('La cuenta no existe')
                response.status(404).json({error: error.message})
                return
            }

            // validar que el usuario esté autenticado
            if (!user.confirmed) {
                // generar token
                const token = new Token()
                token.token = generateToken()
                token.user = user.id

                // enviar email
                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    user: user.name,
                    token: token.token
                })
                
                await token.save()

                const error = new Error('La cuenta no está confirmada, revisa tu email para terminar el proceso')
                response.status(401).json({error: error.message})
                return
            }

            // validar la contraseña
            const isPasswordCorrect = await checkPassword(password, user.password)

            if (!isPasswordCorrect) {
                const error = new Error('La contraseña no es correcta')
                response.status(401).json({error: error.message})
                return
            }

            // generar token de sesion con json web token
            const token = generateJWT({id: user.id})

            response.send(token)

        } catch (error) {
            console.log(colors.bgRed.white.bold(error.message))
            response.status(500).json({error: 'No fue posible ingresar a UpTask, intenta más tarde'})
        }
    }

    static requestConfirmationCode = async (request : Request, response : Response) => {
        try {
            const { email } = request.body

            // validar si ya existe el usuario
            const user = await User.findOne({email})

            if (!user) {
                const error = new Error('La cuenta no existe')
                response.status(409).json({error: error.message})
                return
            }

            if (user.confirmed) {
                const error = new Error('La cuenta ya está confirmada')
                response.status(403).json({error: error.message})
                return
            }

            // generar token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // enviar email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                user: user.name,
                token: token.token
            })
            
            await Promise.allSettled([user.save(), token.save()])

            response.send('Te hemos enviado un email a tu correo, revisa en la bandeja de entrada o en spam')
        } catch (error) {
            console.log(colors.bgRed.white.bold(error.message))
            response.status(500).json({error: 'No fue posible enviarte el código de confirmación'})
        }
    }

    static forgotPassword = async (request : Request, response : Response) => {
        try {
            const { email } = request.body

            // validar si ya existe el usuario
            const user = await User.findOne({email})

            if (!user) {
                const error = new Error('La cuenta no existe')
                response.status(409).json({error: error.message})
                return
            }

            // generar token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            await token.save()

            // enviar email
            AuthEmail.sendPasswordResetToken({
                email: user.email,
                user: user.name,
                token: token.token
            })

            response.send('Te hemos enviado un email a tu correo, revisa en la bandeja de entrada o en spam')
        } catch (error) {
            console.log(colors.bgRed.white.bold(error.message))
            response.status(500).json({error: 'No fue posible enviarte el código de confirmación'})
        }
    }

    static validateToken = async (request : Request, response : Response) => {
        try {
            const { token } = request.body

            // buscar token
            const tokenExists = await Token.findOne({token})

            if (!tokenExists) {
                const error = new Error('Token no válido')
                response.status(401).json({error: error.message})
                return
            }

            response.send('Token válido, define tu nueva contraseña')

        } catch (error) {
            console.log(colors.bgRed.white.bold(error.message))
            response.status(500).json({error: 'No fue posible validar el token'})
        }
    }

    static updatePasswordWithToken = async (request : Request, response : Response) => {
        try {
            const { token } = request.params
            const { password } = request.body

            // buscar token
            const tokenExists = await Token.findOne({token})

            if (!tokenExists) {
                const error = new Error('Token no válido')
                response.status(401).json({error: error.message})
                return
            }

            // buscar usuario
            const user = await User.findOne(tokenExists.user)
            
            // hashear password
            user.password = await hashPassword(password) 
            
            // guardar activacion y elminar token
            await Promise.allSettled([user.save(), tokenExists.deleteOne()])

            response.send('Tu nueva contraseña se guardó correctamente')

        } catch (error) {
            console.log(colors.bgRed.white.bold(error.message))
            response.status(500).json({error: 'No fue posible guardar tu nueva contraseña'})
        }
    }

    static user = async (request : Request, response : Response) => {
        response.json(request.user)
        return
    }

    static updateProfile = async (request : Request, response : Response) => {
        const { name, email } = request.body

        // validar si ya existe el usuario
        const userExists = await User.findOne({email})

        // si el email existe y el usuario de ese email es diferente al autenticado
        if (userExists && userExists.id.toString() !== request.user.id.toString()) {
            const error = new Error('El correo ya está registrado en otra cuenta')
            response.status(409).json({error: error.message})
            return
        }

        request.user.name = name
        request.user.email = email

        try {
            await request.user.save()
            response.send('Perfil actualizado correctamente')

        } catch (error) {
            console.log(colors.bgRed.white.bold(error.message))
            response.status(500).json({error: 'No fue posible actualizar la información de tu perfil'})
        }
    }

    static updateCurrentUserPassword = async (request : Request, response : Response) => {
        const { password, current_password } = request.body

        // buscar usuario
        const user = await User.findById(request.user.id)

        // validar la contraseña actual
        const isPasswordCorrect = await checkPassword(current_password, user.password)

        if (!isPasswordCorrect) {
            const error = new Error('La contraseña actual no es correcta')
            response.status(401).json({error: error.message})
            return
        }

        request.user.password = await hashPassword(password)

        try {
            await request.user.save()
            response.send('Contraseña actualizada correctamente')

        } catch (error) {
            console.log(colors.bgRed.white.bold(error.message))
            response.status(500).json({error: 'No fue posible actualizar tu contraseña'})
        }
    }

    static checkPassword = async (request : Request, response : Response) => {
        const { password } = request.body

        // buscar usuario
        const user = await User.findById(request.user.id)

        // validar la contraseña actual
        const isPasswordCorrect = await checkPassword(password, user.password)

        if (!isPasswordCorrect) {
            const error = new Error('La contraseña no es correcta')
            response.status(401).json({error: error.message})
            return
        }
        
        response.send('Contraseña correcta')
    }
}