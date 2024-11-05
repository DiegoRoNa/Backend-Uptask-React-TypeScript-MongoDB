import mongoose, { Document, Schema, Types } from "mongoose"
import Note from "./Note"

// diccionar de estatus de una tarea
const taskStatus = {
    PENDING: 'pending',
    ON_HOLD: 'onHold',
    IN_PROGRESS: 'inProgress',
    UNDER_REVIEW: 'underReview',
    COMPLETED: 'completed'
} as const

// type del status
export type TaskStatus = typeof taskStatus[keyof typeof taskStatus]

// type del modelo heredando de Document
export interface ITask extends Document {
    name: string
    description: string
    project: Types.ObjectId
    status: TaskStatus
    completedBy: {
        user: Types.ObjectId,
        status: TaskStatus
    }[]
    notes: Types.ObjectId[]
}

// Schema para Mongoose
const TaskSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    project: {
        type: Types.ObjectId,
        ref: 'Project'
    },
    status: {
        type: String,
        enum: Object.values(taskStatus),
        default: taskStatus.PENDING
    },
    completedBy: [
        {
            user: {
                type: Types.ObjectId,
                ref: 'User',
                default: null
            },
            status: {
                type: String,
                enum: Object.values(taskStatus),
                default: taskStatus.PENDING
            }
        }
    ],
    notes: [
        {
            type: Types.ObjectId,
            ref: 'Note'
        }
    ]

}, {timestamps: true}) // agrga la fecha de registro y actualizacion

// middlewares
// eliminar notas de una tarea
TaskSchema.pre('deleteOne', {document: true}, async function() {
    const taskId = this._id

    if (!taskId) return
    
    await Note.deleteMany({ task: taskId })
})

// Modelo
const Task = mongoose.model<ITask>('Task', TaskSchema)
export default Task