import type { Request, Response, NextFunction } from "express"
import Project, { IProject } from "../models/Project"

/**
 * Agregar a "request", el atributo "project", con un interface, ya que este, permite agregar nuevos
 * atributos al request que ya existe de Express
*/
declare global {
    namespace Express {
        interface Request {
            project: IProject
        }
    }
}

/**
 * Middleware para validar si un proyecto existe
 */
export async function ProjectExists(request : Request, response : Response, next : NextFunction) {
    try {
        const { projectId } = request.params

        const project = await Project.findById(projectId)

        if (!project) {
            const error = new Error('Proyecto no encontrado')
            response.status(404).json({error: error.message})
            return
        }

        // pasar el project por el request
        request.project = project

        next()
    } catch (error) {
        response.status(500).json({error: 'Ocurrió un error inesperado'})
    }
}