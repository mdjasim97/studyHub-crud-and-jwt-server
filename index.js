const express = require('express')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000

const cors = require('cors')
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cookieParser = require('cookie-parser')


const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174'

    ],
    credentials: true

}

app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

// mdJasim 
// OvuCf7sNHtKj2TnJ 




const uri = "mongodb+srv://mdJasim:OvuCf7sNHtKj2TnJ@cluster0.wukjrsy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();


        const database = client.db("assignmentDB");
        const ass_Collection = database.collection("assignments")
        const submitCollection = database.collection("assSubmit")


        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        };


        const verifyToken = (req, res, next) => {
            const token = req.cookies.token
            console.log(token, 'cookies token save')
            if (!token) {
                res.status(401).send({ message: "unauthorized access" })
            }
            if (token) {
                jwt.verify(token, process.env.TOKEN_SECREATE_KEY, (err, decode) => {
                    if (err) {
                        console.log(err)
                        // return res.status(401).send({ message: "unauthorized access" })
                    }
                    console.log(decode)
                    req.user = decode
                    next()
                })
            }
        }


        // Token create route
        app.post('/jwt', async (req, res) => {
            const user = req.body
            console.log(user)
            const token = jwt.sign(user, process.env.TOKEN_SECREATE_KEY, {
                expiresIn: '2d',
            })
            res.cookie('token', token, cookieOptions).send({ success: true })
            console.log('token', token)
        })

        app.get('/logout', (req, res) => {
            res.clearCookie('token', { ...cookieOptions, maxAge: 0 })
                .send({ success: true })
        })

        // all assignment data route get from mongodb database 
        // app.get("/assignments", async (req, res) => {
        //     const result = await ass_Collection.find().toArray()
        //     res.send(result)
        // })

        app.get("/assignments", async (req, res) => {
            try {
                const cursor = ass_Collection.find({}, { projection: { _id: 1, title: 1, image_url: 1, marks: 1, ass_lavel: 1 } });
                cursor.sort({ title: 1 });
                const result = await cursor.toArray();
                res.send(result);
            } catch (err) {
                console.error(err);
                res.status(500).send({ message: err });
            }
        })

        // get assignment details by id from mongodb database 
        app.get("/assignments/:id", verifyToken, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await ass_Collection.findOne(query)
            res.send(result)
        })

        // create assignment and data store in mongodb database 
        app.post("/createAssign", verifyToken, async (req, res) => {
            const reqBody = req.body;
            console.log(reqBody)
            const result = await ass_Collection.insertOne(reqBody);
            res.send(result)
        })

        // update assignment data by id and store mongodb database 
        app.put("/updateAssign/:id", verifyToken, async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const reqBody = req.body
            const query = { _id: new ObjectId(id) }
            const options = { upsert: true }
            // console.log("Update Route hitting...", id)

            const updateData = {
                $set: {
                    title: reqBody.title,
                    description: reqBody.description,
                    marks: reqBody.marks,
                    image_url: reqBody.image_url,
                    ass_lavel: reqBody.ass_lavel,
                    selectDate: reqBody.selectDate
                }
            }

            const result = await ass_Collection.updateOne(query, updateData, options)
            res.send(result)
        })

        // delete assignment by id from mongodb database 
        app.delete("/deleteAssign/:id", verifyToken, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await ass_Collection.deleteOne(query);
            res.send(result)
        })



        app.post("/assingment", verifyToken, async (req, res) => {
            const reqBody = req.body
            const result = await submitCollection.insertOne(reqBody);
            res.send(result)
        })


        // submitted assignment route
        app.get("/MyAssignList/:email", verifyToken, async (req, res) => {
            const TokenEmail = req.user.email
            const email = req.params.email;
            if (TokenEmail !== email) {
                return res.status(403).send({ message: "request forbidden" })
            }
            const query = { user_email: email }
            console.log(query)
            const result = await submitCollection.find(query).toArray();
            res.send(result)
        })

        app.get("/pendingList/:email", verifyToken, async (req, res) => {
            const email = req.params.email;
            const query = { owener_email: email }
            const result = await submitCollection.find(query).toArray()
            res.send(result)
        })

        // update assignment status 
        app.put("/updateStatus/:id", verifyToken, async (req, res) => {
            const id = req.params.id;
            // console.log(id)
            const reqBody = req.body
            console.log(reqBody)
            const query = { _id: new ObjectId(id) }
            // const options = { upsert: true }
            console.log("Status update route hitting")

            const updatedoc = {
                $set: {
                    mark: reqBody.mark,
                    feedback: reqBody.feedback,
                    status: reqBody.status
                }
            }
            const result = await submitCollection.updateOne(query, updatedoc);
            res.send(result)
        })
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);






app.use("/", (req, res) => {
    res.send("CRUD and JWT server start")
})


app.listen(port, (req, res) => {
    console.log(`Server running port is ${port}`)
})
