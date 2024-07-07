const express = require('express')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000

const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cookieParser = require('cookie-parser')

app.use(cors())
app.use(express.json())

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

        // all assignment data route get from mongodb database 
        app.get("/assignments", async (req, res) => {
            const result = await ass_Collection.find().toArray()
            res.send(result)
        })

        // get assignment details by id from mongodb database 
        app.get("/assignments/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await ass_Collection.findOne(query)
            res.send(result)
        })

        // create assignment and data store in mongodb database 
        app.post("/createAssign", async (req, res) => {
            const reqBody = req.body;
            console.log(reqBody)
            const result = await ass_Collection.insertOne(reqBody);
            res.send(result)
        })

        // update assignment data by id and store mongodb database 
        app.put("/updateAssign/:id", async (req, res) => {
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
        app.delete("/deleteAssign/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await ass_Collection.deleteOne(query);
            res.send(result)
        })



        app.post("/assingment", async (req, res) => {
            const reqBody = req.body
            const result = await submitCollection.insertOne(reqBody);
            res.send(result)
        })


         // submitted assignment route
         app.get("/MyAssignList/:email", async (req, res) => {
            const email = req.params.email;
            // console.log(req.params)
            const query = { user_email: email }
            console.log(query)
            const result = await submitCollection.find(query).toArray();
            res.send(result)
        })

         app.get("/pendingList/:email", async (req, res) => {
            const email = req.params.email;
            const query = {owener_email : email}
            const result = await submitCollection.find(query).toArray()
            res.send(result)
        })

        // update assignment status 
        app.put("/updateStatus/:id", async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const reqBody = req.body
            console.log(reqBody)
            const query = { _id: new ObjectId(id) }
            // const options = { upsert: true }
            console.log("Status update route hitting")

            const updatedoc = {
                $set: {
                    mark : reqBody.mark,
                    feedback : reqBody.feedback,
                    status : reqBody.status
                }
            }

            const result = await submitCollection.updateOne(query, updatedoc);
            res.send(result)
        })


        // app.get("/pendingList/:id", async (req, res) => {

        //     const result = await pendingCollection.find().toArray()
        //     res.send(result)
        // })



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
