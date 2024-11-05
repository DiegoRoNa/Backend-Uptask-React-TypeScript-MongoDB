import type { Request, Response, NextFunction } from "express"
import jwt from 'jsonwebtoken'
import User, { IUser } from "../models/User"

/**
 * Agregar a "request", el atributo "project", con un interface, ya que este, permite agregar nuevos
 * atributos al request que ya existe de Express
*/
declare global {
    namespace Express {
        interface Request {
            user?: IUser
        }
    }
}

export const authenticate = async (request : Request, response : Response, next : NextFunction) => {
    
    const bearer = request.headers.authorization
    
    // validar que existan los headers
    if (!bearer) {
        const error = new Error('Sin autorización')
        response.status(401).json({error: error.message})
        return
    }

    // obtener el token
    const [, token] = bearer.split(' ') // [, token], ignora el primer elemento del array
    
    // verificar token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // verificar que el usuario exista
        if (typeof decoded === 'object' && decoded.id) {
            const user = await User.findById(decoded.id).select('_id name email')

            
            if (user) {
                request.user = user // agregar en el request el user, para leerlo en los siguientes middlewares
                next()
            } else {
                response.status(500).json({error: 'Token no válido'})
            }
        }
      
    } catch (error) {
        response.status(500).json({error: 'Token no válido'})
    }
}