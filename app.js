const libExpress = require("express")
const cors = require("cors")
const { MongoClient, ObjectId } = require("mongodb")
const librandomstring = require('randomstring');
const connection = new MongoClient("mongodb://User1:1234@localhost:27017/IMS?authSource=IMS")
const DB = "IMS"

const server = libExpress()
server.use(cors())
server.use(libExpress.json())

server.post("/user", async (req, res) => {
    if (req.body.name && req.body.email && req.body.password && req.body.phone) {

        await connection.connect()
        const db = await connection.db(DB)
        const collection = await db.collection("user")
        const result = await collection.find({ "email": req.body.email }).toArray()


        if (result.length > 0) {
            res.json({ error: "User already exists." })
        }
        else {
            await collection.insertOne({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                phone: req.body.phone
            })
            res.json({ message: "User Profile Created." })
        }
        await connection.close()
    }
    else {
        res.json({ error: "Required fields are missing." })
    }
})

server.post("/token", async (req, res) => {
    if (req.body.email && req.body.password) {
        await connection.connect();
        const db = await connection.db(DB);
        const collection = await db.collection("user");

        const result = await collection.find({
            "email": req.body.email,
            "password": req.body.password
        }).toArray();

        if (result.length > 0) {
            const generatedToken = librandomstring.generate(7);
            const user = result[0];
            user.token = generatedToken

            await collection.updateOne(
                { _id: user._id },
                { $set: { token: generatedToken } }
            );

            res.status(200).json({ token: generatedToken });
        } else {
            res.status(401).json({ error: "Invalid Credentials." });
        }
        await connection.close();
    } else {
        res.status(400).json({ error: "Missing Credentials." });
    }
});

server.get("/roles", async (req, res) => {
    if (req.headers.token) {
        console.log(req.headers.token)
        await connection.connect();
        const db = await connection.db(DB);
        const collection = await db.collection("user");
        const result = await collection.find({ token: req.headers.token }).toArray()
        if (result.length > 0) {
            const user = result[0]

            res.status(200).json({
                admin: user.is_admin == true,
                owner: !!user?.owner_of,
                player: !!user?.playing_for
            })
        }
        await connection.close()
    }

})

server.get("/getPlayers", async (req, res) => {

    await connection.connect();
    const db = await connection.db(DB);
    const collection = await db.collection("user");
    const result = await collection.find({ playing_for: { $exists: true } }).toArray();
    if (result.length > 0) {
        res.status(200).json(result)
    }
    else {
        res.status(404).json({ message: "No players found." });
    }
    await connection.close()
});

server.get("/getTeams", async (req, res) => {

    await connection.connect();
    const db = await connection.db(DB);
    const collection = await db.collection("team");
    const result = await collection.find({}).toArray();
    
    if (result.length > 0) {
        res.status(200).json(result);
    }
    else {
        res.status(404).json({ message: "No teams found." });
    }
    await connection.close()
});

server.get("/getPlayersByTeam/:team_id", async (req, res) => {
    const selectedTeamId = req.params.team_id;
    await connection.connect();
    const db = await connection.db(DB);
    const collection = db.collection("user");
    console.log(selectedTeamId)

    const selectedTeamPlayers = await collection.find({ team_id:selectedTeamId}).toArray();
    console.log(selectedTeamPlayers)
  
    res.status(200).json(selectedTeamPlayers);

    await connection.close();
});


server.post("/team", (req, res) => {

    console.log("Request Received.")
    res.send("New team created.")
})



server.post("/player", (req, res) => {

    console.log("Request received.")
    res.send("Player profile created.")
})



server.listen(8000, () => {
    console.log("Server is ready.")
})