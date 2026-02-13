require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

// middleWare
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Portfolio server is running!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASSWORD}@cluster0.rwnir9j.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db, membersCollection, projectsCollection;
async function run() {
  // await client.connect();

  db = client.db("bit_builder");
  membersCollection = db.collection("members");
  projectsCollection = db.collection("my-projects");

  app.get("/members/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await membersCollection.findOne(query);
    res.send(result);
  });

  app.get("/my-projects", async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 6;
      const sortBy = req.query.sortBy || "name";
      const order = req.query.order === "desc" ? -1 : 1;

      const skip = (page - 1) * limit;
      const projects = await projectsCollection
        .find()
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit)
        .toArray();

      const total = await projectsCollection.countDocuments();

      res.send({
        data: projects,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      res.status(500).send({ message: "Server error" });
    }
  });

  app.get("/my-projects/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await projectsCollection.findOne(query);
    res.send(result);
  });
}


run().catch(console.dir);

app.listen(port, () => {
  console.log(`Portfolio listening on port ${port}`);
})
