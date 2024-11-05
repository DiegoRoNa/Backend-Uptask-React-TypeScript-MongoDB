import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import { corsConfig } from "./config/cors"
import { connectDB } from "./config/db"
import authRoutes from "./routes/authRoutes"
import projectRoutes from "./routes/projectRoutes"
import morgan from "morgan"

dotenv.config() // variables de entorno

connectDB() // conexion a la BD

const server = express() // servidor de noje y express

server.use(cors(corsConfig)) // endpoint de los cors

server.use(morgan('dev')) // mostrar endpoints ejecutados en consola

server.use(express.json()) // habilita el body en las peticiones

// Routes reales de la API
server.use('/api/auth', authRoutes)
server.use('/api/projects', projectRoutes)

export default server