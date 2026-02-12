const http = require("http")
const fs = require("fs")
const port = 3000




const server = http.createServer(function(request, response){
    fs.readFile("../frontend/index.html", function(error, data){
        if(error){
            response.writeHead(404)
            response.write("File Not Found")

        }else{
            response.writeHead(200, {"Content-Type" : "text/html"})
            response.write(data)
        }
        response.end()
    })
    
})


server.listen(port, "0.0.0.0" ,function(error){
    if(error){
        console.log("An error occured: ", error)
    } else{
        console.log("Server is listenning on port: " + port)
    }
})