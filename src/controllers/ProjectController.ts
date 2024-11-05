import type { Request, Response } from "express"
import Project from "../models/Project"
import colors from "colors"

export class ProjectController {

    /**
     * Método para obtener todos los proyectos
     * @param request Peticion
     * @param respoonse Respuesta
     */
    static getAllProjects = async (request: Request, response: Response) => {
        try {
            // obtener proyectos del usuario autenticado
            const projects = await Project.find({
                $or: [
                    {manager: {$in: request.user.id}}, // manager
                    {team: {$in: request.user.id}} // o colaborador
                ]
            })
            response.json(projects)
        } catch (error) {
            console.log(colors.bgRed.white.bold(error.message))
            response.status(500).json({error: 'No fue posible obtener los proyectos'})
        }
    }

    /**
     * Método para registrar un proyecto
     * @param request Peticion
     * @param respoonse Respuesta
     */
    static createProject = async (request: Request, response: Response) => {
        // instanciar modelo
        const project = new Project(request.body)
        
        // asignar manager al proyecto
        project.manager = request.user.id

        // guardar en la BD
        try {
            await project.save()
            response.send('Proyecto nuevo guardardo correctamente')
        } catch (error) {
            console.log(colors.bgRed.white.bold(error.message))
            response.status(500).json({error: 'No fue posible crear el proyecto'})
        }
    }

    /**
     * Método para obtener un proyecto por ID
     * @param request Peticion
     * @param respoonse Respuesta
     */
    static getProjectById = async (request: Request, response: Response) => {

        const { id } = request.params

        try {
            const project = await Project.findById(id).populate('tasks') // inner join con tasks

            if (!project) {
                const error = new Error('Proyecto no encontrado')
                response.status(404).json({error: error.message})
                return
            }
            
            // verificar que el proyecto pertenezca al usuario autenticado
            if (project.manager.toString() !== request.user.id.toString() && !project.team.includes(request.user.id)) {
                const error = new Error('Acción no válida')
                response.status(404).json({error: error.message})
                return
            }

            response.json(project)

        } catch (error) {
            console.log(colors.bgRed.white.bold(error.message))
            response.status(500).json({error: 'No fue posible obtener la información del proyecto'})
        }
    }

    /**
     * Método para actualizar un proyecto pro ID
     * @param request Peticion
     * @param respoonse Respuesta
     */
    static updateProject = async (request: Request, response: Response) => {

        try {
            request.project.projectName = request.body.projectName
            request.project.clientName = request.body.clientName
            request.project.description = request.body.description
            
            await request.project.save()
            response.send('Proyecto actualizado')

        } catch (error) {
            console.log(colors.bgRed.white.bold(error.message))
            response.status(500).json({error: 'No fue posible actualizar el proyecto'})
        }
    }

    /**
     * Método para eliminar un proyecto pro ID
     * @param request Peticion
     * @param respoonse Respuesta
     */
    static deleteProject = async (request: Request, response: Response) => {

        try {
            await request.project.deleteOne()
            response.send('Proyecto eliminado')

        } catch (error) {
            console.log(colors.bgRed.white.bold(error.message))
            response.status(500).json({error: 'No fue posible eliminar el proyecto'})
        }
    }
}