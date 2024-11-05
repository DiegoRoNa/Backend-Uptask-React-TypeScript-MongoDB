import mongoose, { Document, PopulatedDoc, Schema, Types } from "mongoose"
import Task, { ITask } from "./Task"
import { IUser } from "./User"
import Note from "./Note"

// type del modelo heredando de Document
export interface IProject extends Document {
    projectName: string
    clientName: string
    description: string
    tasks: PopulatedDoc<ITask & Document>[]
    manager: PopulatedDoc<IUser & Document>
    team: PopulatedDoc<IUser & Document>[]
}

// Schema para Mongoose
const ProjectSchema: Schema = new Schema({
    projectName: {
        type: String,
        required: true,
        trim: true
    },
    clientName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    tasks: [
        {
            type: Types.ObjectId,
            ref: 'Task'
        }
    ],
    manager: {
        type: Types.ObjectId,
        ref: 'User'
    },
    team: [
        {
            type: Types.ObjectId,
            ref: 'User'
        }
    ]
}, {timestamps: true}) // agrga la fecha de registro y actualizacion

// middlewares
// eliminar tareas de un proyecto
ProjectSchema.pre('deleteOne', {document: true}, async function() {
    const projectId = this._id

    if (!projectId) return

    // obtener las tareas y eliminar sus notas
    const tasks = await Task.find({ project: projectId })
    for (const task of tasks) {
        await Note.deleteMany({ task: task.id })
    }
    
    await Task.deleteMany({ project: projectId })
})

// Modelo
const Project = mongoose.model<IProject>('Project', ProjectSchema)
export default Project