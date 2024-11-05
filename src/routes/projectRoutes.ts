import { Router } from "express"
import { ProjectController } from "../controllers/ProjectController"
import { body, param } from "express-validator"
import { handleInputErrors } from "../middleware/validation"
import { TaskController } from "../controllers/TaskController"
import { ProjectExists } from "../middleware/project"
import { hasAuthorization, TaskBelongsToProject, TaskExists } from "../middleware/task"
import { authenticate } from "../middleware/auth"
import { TeamMemberController } from "../controllers/TeamController"
import { NoteController } from "../controllers/NoteController"

const router = Router()

// Routes for projects
router.use(authenticate)

router.get('/', ProjectController.getAllProjects)

router.post('/', 
    body('projectName').notEmpty().withMessage('El nombre del proyecto es obligatorio'),
    body('clientName').notEmpty().withMessage('El nombre del cliente es obligatorio'),
    body('description').notEmpty().withMessage('La descripción es obligatoria'),
    handleInputErrors,
    ProjectController.createProject
)

router.get('/:id', 
    param('id').isMongoId().withMessage('Id no válido'),
    handleInputErrors,
    ProjectController.getProjectById
)

router.param('projectId', ProjectExists) // middleware para validar el proyecto id

router.put('/:projectId', 
    hasAuthorization,
    param('projectId').isMongoId().withMessage('Id no válido'),
    body('projectName').notEmpty().withMessage('El nombre del proyecto es obligatorio'),
    body('clientName').notEmpty().withMessage('El nombre del cliente es obligatorio'),
    body('description').notEmpty().withMessage('La descripción es obligatoria'),
    handleInputErrors,
    ProjectController.updateProject
)

router.delete('/:projectId', 
    hasAuthorization,
    param('projectId').isMongoId().withMessage('Id no válido'),
    handleInputErrors,
    ProjectController.deleteProject
)

// Routes for tasks
router.get('/:projectId/tasks', 
    TaskController.getProjectTasks
)

router.post('/:projectId/tasks', 
    hasAuthorization,
    body('name').notEmpty().withMessage('El nombre de la tarea es obligatoria'),
    body('description').notEmpty().withMessage('La descripción es obligatoria'),
    handleInputErrors,
    TaskController.createTask
)

router.param('taskId', TaskExists) // middleware para validar la tarea id
router.param('taskId', TaskBelongsToProject) // middleware para validar que la tarea pertenezca al proyecto

router.get('/:projectId/tasks/:taskId', 
    param('taskId').isMongoId().withMessage('Id no válido'),
    handleInputErrors,
    TaskController.getTaskById
)

router.put('/:projectId/tasks/:taskId', 
    hasAuthorization,
    param('taskId').isMongoId().withMessage('Id no válido'),
    body('name').notEmpty().withMessage('El nombre de la tarea es obligatoria'),
    body('description').notEmpty().withMessage('La descripción es obligatoria'),
    handleInputErrors,
    TaskController.updateTask
)

router.delete('/:projectId/tasks/:taskId', 
    hasAuthorization,
    param('taskId').isMongoId().withMessage('Id no válido'),
    handleInputErrors,
    TaskController.deleteTask
)

router.post('/:projectId/tasks/:taskId/status', 
    param('taskId').isMongoId().withMessage('Id no válido'),
    body('status').notEmpty().withMessage('El estado es obligatorio'),
    handleInputErrors,
    TaskController.updateStatus
)

// Routes for team
router.post('/:projectId/team/find', 
    body('email').isEmail().toLowerCase().withMessage('Correo no válido'),
    handleInputErrors,
    TeamMemberController.findMemberByEmail
)

router.get('/:projectId/team', TeamMemberController.getProjectTeam)

router.post('/:projectId/team', 
    body('id').isMongoId().withMessage('Id no válido'),
    handleInputErrors,
    TeamMemberController.addMemberById
)

router.delete('/:projectId/team/:userId', 
    param('userId').isMongoId().withMessage('Id no válido'),
    handleInputErrors,
    TeamMemberController.removeMemberById
)

// Routes for Notes
router.post('/:projectId/tasks/:taskId/notes',
    body('content').notEmpty().withMessage('El contenido de la nota es obligatorio'),
    handleInputErrors,
    NoteController.createNote
)

router.get('/:projectId/tasks/:taskId/notes',
    NoteController.getTaskNotes
)

router.delete('/:projectId/tasks/:taskId/notes/:noteId',
    param('noteId').isMongoId().withMessage('Id no válido'),
    handleInputErrors,
    NoteController.deleteNote
)

export default router