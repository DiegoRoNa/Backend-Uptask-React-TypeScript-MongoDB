import type { Request, Response } from "express"
import colors from "colors"
import Note, { INote } from "../models/Note"
import { Types } from "mongoose"

type NoteParams = {
    noteId: Types.ObjectId
}

export class NoteController {
    static createNote = async (request: Request<{}, {}, INote>, response: Response) => {
        const { content } = request.body
        
        try {
            const note = new Note()
            note.content = content
            note.createdBy = request.user.id
            note.task = request.task.id

            request.task.notes.push(note.id) // guardar nota en array de notas de la tarea

            // array de promesas
            await Promise.allSettled([note.save(), request.task.save()])

            response.send('Nota nueva guardarda correctamente')

        } catch (error) {
            console.log(colors.bgRed.white.bold(error.message))
            response.status(500).json({error: 'No fue posible crear la nota'})
        }
    }

    static getTaskNotes = async (request: Request, response: Response) => {
        try {
            // el project ya viene desde el middleware project
            const notes = await Note.find({task: request.task.id}) // inner join con project
            response.json(notes)
        } catch (error) {
            console.log(colors.bgRed.white.bold(error.message))
            response.status(500).json({error: 'No fue posible obtener las notas'})
        }
    }

    static deleteNote = async (request: Request<NoteParams>, response: Response) => {
        const { noteId } = request.params
        const note = await Note.findById(noteId)

        if (!note) {
            const error = new Error('Nota no encontrada')
            response.status(404).json({error: error.message})
            return
        }

        if (note.createdBy.toString() !== request.user.id.toString()) {
            const error = new Error('Acción no válida')
            response.status(401).json({error: error.message})
            return
        }

        // eliminar de la tarea
        request.task.notes = request.task.notes.filter( note => note.toString() !== noteId.toString())

        try {
            await Promise.allSettled([note.deleteOne(), request.task.save()])
            response.send('Nota eliminada')
        } catch (error) {
            console.log(colors.bgRed.white.bold(error.message))
            response.status(500).json({error: 'No fue posible eliminar la nota'})
        }
    }
}