const libExpress = require("express")
const server = libExpress()
server.post("/user", (req,res) =>{

   console.log("Request Received.")
   res.send("New user account is created.")
})

server.post("/team", (req,res) =>{

    console.log("Request Received.")
    res.send("New team created.")
})

server.post("/player", (req,res) =>{

    console.log("Request received.")
    res.send("Player profile created.")
})


server.listen(8000,() => {
    console.log("Server is ready.")
})