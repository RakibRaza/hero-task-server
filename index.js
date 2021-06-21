const express = require("express");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const app = express();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xaixv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const jobCollection = client.db(process.env.DB_NAME).collection("jobs");
  const userCollection = client.db(process.env.DB_NAME).collection("users");
  const applyCollection = client.db(process.env.DB_NAME).collection("applications");

  // Add Job
  app.post("/addJob", (req, res) => {
    const job = req.body;
    jobCollection
      .insertOne(job)
      .then((result) => res.send(result.insertedCount > 0));
  });
  // Add Application
  app.post("/addApplication", (req, res) => {
    const application = req.body;
    applyCollection
      .insertOne(application)
      .then((result) => res.send(result.insertedCount > 0));
  });
  // Get Application
  app.get("/applications", (req, res) => {
    const email = req.query.email;
    applyCollection.find({ email }).toArray((err, collection) => {
      res.send(collection);
    });
  });

  // Get Job
  app.get("/approvedJobs", (req, res) => {
    jobCollection.find({ status: 'done' }).toArray((err, collection) => res.send(collection));
  });
  app.get("/pendingJobs", (req, res) => {
    jobCollection.find({ status: 'pending' }).toArray((err, collection) => res.send(collection));
  });
  app.get("/employerJobs", (req, res) => {
    const email = req.query.email;
    jobCollection.find({ email }).toArray((err, collection) => {
      res.send(collection);
    });
  });

  // Add Users
  app.post("/addUser", (req, res) => {
    const user = req.body;
    userCollection.insertOne(user).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  // Get user
  app.get("/user", (req, res) => {
    const email = req.query.email;
    userCollection.find({ email }).toArray((err, collection) => {
      res.send(collection);
    });
  });

  // Update Job Status
  app.patch("/updateJob/:id", (req, res) => {
    jobCollection
      .updateOne(
        { _id: ObjectId(req.params.id) },
        {
          $set: {
            status: req.body.status,
          },
        }
      )
      .then((result) => res.send(result.modifiedCount > 0));
  });

  // Update user job post, left per month
  app.patch("/updateUser/:email", (req, res) => {
    userCollection
      .updateOne(
        { email: req.params.email },
        {
          $set: {
            jobPostLeft: req.body.jobPostLeft,
          },
        }
      )
      .then((result) => res.send(result.modifiedCount > 0));
  });

});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`App listening at Port:${port}`);
});
