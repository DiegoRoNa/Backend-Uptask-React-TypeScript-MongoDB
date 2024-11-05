import type { Request, Response } from "express"
import User from "../models/User"
import Project from "../models/Project"


export class TeamMemberController {
    static findMemberByEmail = async (request: Request, response: Response) => {
        const { email } = request.body

        // buscar usuario
        const user = await User.findOne({email}).select('id name email')

        if (!user) {
            const error = new Error('Usuario no encontrado')
            response.status(404).json({error: error.message})
            return
        }

        response.json(user)
    }

    static getProjectTeam = async (request: Request, response: Response) => {
        const project = await Project.findById(request.project.id).populate({
            path: 'team',
            select: 'id email name'
        })
        response.json(project.team)
    }

    static addMemberById = async (request: Request, response: Response) => {
        const { id } = request.body

        // buscar usuario
        const user = await User.findById(id).select('id')

        if (!user) {
            const error = new Error('Usuario no encontrado')
            response.status(404).json({error: error.message})
            return
        }

        // validar que el usuario no esté agregado al proyecto
        if (request.project.team.some(team => team.toString() === user.id.toString())) {
            const error = new Error('El usuario ya se encuentra en el proyecto')
            response.status(409).json({error: error.message})
            return
        }

        // agregar usuario al proyecto
        request.project.team.push(user)
        await request.project.save()

        response.send('Usuario agregado al proyecto correctamente')
    }

    static removeMemberById = async (request: Request, response: Response) => {
        const { userId } = request.params

        // validar que el usuario no esté agregado al proyecto
        if (!request.project.team.some(team => team.toString() === userId)) {
            const error = new Error('El usuario no se encuentra en el proyecto')
            response.status(409).json({error: error.message})
            return
        }

        request.project.team = request.project.team.filter(teamMember => teamMember.toString() !== userId)

        await request.project.save()

        response.send('Usuario eliminado del proyecto')
    }
}
