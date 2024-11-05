import mongoose, { Document, Schema, Types } from "mongoose"

// type del modelo heredando de Document
export interface INote extends Document {
    content: string
    createdBy: Types.ObjectId
    task: Types.ObjectId
}

// Schema para Mongoose
const NoteSchema: Schema = new Schema({
    content: {
        type: String,
        required: true
    },
    createdBy: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
    task: {
        type: Types.ObjectId,
        ref: 'Task',
        required: true
    }
}, {timestamps: true}) // agrga la fecha de registro y actualizacion

// Modelo
const Note = mongoose.model<INote>('Note', NoteSchema)
export default Note