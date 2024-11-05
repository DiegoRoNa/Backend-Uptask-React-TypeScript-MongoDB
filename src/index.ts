import server from "./server"
import colors from "colors"

const port = process.env.PORT || 4000

server.listen(port, () => {
    console.log(colors.bgGreen.inverse.bold(`REST API funcionando desde el puerto ${port}`))
})