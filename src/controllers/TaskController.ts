import type { Request, Response } from "express"
import colors from "colors"
import Task from "../models/Task"

export class TaskController {
    /**
     * Método para obtener las tareas de un proyecto
     * @param request Peticion
     * @param respoonse Respuesta
     */
    static getProjectTasks = async (request: Request, response: Response) => {
        
        try {
            // el project ya viene desde el middleware project
            const tasks = await Task.find({project: request.project.id}).populate('project') // inner join con project
            response.json(tasks)
        } catch (error) {
            console.log(colors.bgRed.white.bold(error.message))
            response.status(500).json({error: 'No fue posible obtener las tareas'})
        }
    }

    /**
     * Método para registrar una tarea
     * @param request Peticion
     * @param respoonse Respuesta
     */
    static createTask = async (request: Request, response: Response) => {
        
        try {
            const task = new Task(request.body)
            task.project = request.project.id // el project ya viene desde el middleware project

            request.project.tasks.push(task.id)

            // array de promesas
            await Promise.allSettled([task.save(), request.project.save()])

            response.send('Tarea nueva guardarda correctamente')

        } catch (error) {
            console.log(colors.bgRed.white.bold(error.message))
            response.status(500).json({error: 'No fue posible crear la tarea'})
        }
    }

    /**
     * Método para obtener una tarea por su ID
     * @param request Peticion
     * @param respoonse Respuesta
     */
    static getTaskById = async (request: Request, response: Response) => {
        
        try {
            const task = await Task.findById(request.task.id).populate({
                path: 'completedBy', select: 'id name email'
            }).populate({
                path: 'notes',
                populate: {
                    path: 'createdBy',
                    select: 'id name email'
                }
            })
            
            response.json(task)
        } catch (error) {
            console.log(colors.bgRed.white.bold(error.message))
            response.status(500).json({error: 'No fue posible obtenr la información de la tarea'})
        }
    }

    /**
     * Método para actualizar una tarea por ID
     * @param request Peticion
     * @param respoonse Respuesta
     */
    static updateTask = async (request: Request, response: Response) => {
        
        try {
            request.task.name = request.body.name
            request.task.description = request.body.description
            await request.task.save()

            response.send('Tarea actualizada correctamente')

        } catch (error) {
            console.log(colors.bgRed.white.bold(error.message))
            response.status(500).json({error: 'No fue posible actualizar la tarea'})
        }
    }

     /**
     * Método para eliminar una tarea por ID
     * @param request Peticion
     * @param respoonse Respuesta
     */
     static deleteTask = async (request: Request, response: Response) => {
        
        try {
            // quitar del array de tasks de projects la tarea eliminada
            request.project.tasks = request.project.tasks.filter( task => task.toString() !== request.task.id.toString() )

            // array de promesas
            await Promise.allSettled([request.task.deleteOne(), request.project.save()])

            response.send('Tarea eliminada')

        } catch (error) {
            console.log(colors.bgRed.white.bold(error.message))
            response.status(500).json({error: 'No fue posible eliminar la tarea'})
        }
    }

    /**
     * Método para actualizar el estatus de una tarea
     * @param request Peticion
     * @param respoonse Respuesta
     */
    static updateStatus = async (request: Request, response: Response) => {

        try {
            const { status } = request.body

            request.task.status = status // status actual

            // historial de status
            const data = {
                user: request.user.id,
                status
            }

            request.task.completedBy.push(data)

            await request.task.save()
            
            response.send('Estatus de la tarea actualizado')

        } catch (error) {
            console.log(colors.bgRed.white.bold(error.message))
            response.status(500).json({error: 'No fue posible modificar el estatus'})
        }
    }
}