import express from "express";
import { connectToMongoDB } from "./db.js";
const app = express();
process.loadEnvFile()
const port = process.env.PORT;
const client = await connectToMongoDB();
const db = client.db("sample_mflix");
const movies = db.collection("movies");
app.get("/q1", async (req, res) => {
    const data = await movies.find(
        {
            year: 2015,
            genres: "Action",
            runtime: { $gt: 120 }
        }, { projection: { _id: 1, title: 1, year: 1, genres: 1, runtime: 1 } }).toArray();
    return res.status(200).json(data)
})
app.get("/q2", async (req, res) => {
    const data = await movies.find(
        { directors: "Christopher Nolan" },
        {
            projection: {
                _id: 0,
                title: 1,
                year: 1,
                runtime: 1
            },
            sort: { year: -1 }
        }
    ).toArray();
    return res.status(200).json(data)
})
app.get("/q3", async (req, res) => {
    const data = await movies.insertOne({
        title: "Test Movie 2026",
        year: 2026,
        runtime: 15,
        rated: "PG-13",
        type: "movie",
        genres: ["Action", "Drama"],
        num_mflix_comments: 5
    })
    const result = await movies.findOne({
        _id: data.insertedId
    })
    return res.status(200).json(result)
})
// can't find num_mflix_comments is greater than 5 in this dummy data so i say num_mflix_comments > 2
app.get("/q4", async (req, res) => {
    const data = await movies.updateMany({
        year: 2014,
        num_mflix_comments: { $gt: 2 }
    }, {
        $set: { isPopular: true },
        $inc: { num_mflix_comments: 1 }
    })
    return res.status(200).json(data)
})
app.get("/q5", async (req, res) => {
    const data = await movies.deleteMany({
        year: { $lt: 1920 },
        runtime: { $lt: 30 }
    })
    return res.status(200).json(data)
})
app.get("/q6", async (req, res) => {
    const data = await movies.aggregate([
        {
            $match: { year: { $gte: 2010 } }
        },
        {
            $group: { _id: "$year", totalMovies: { $sum: 1 }, avergeRunTime: { $avg: "$runtime" } }
        },
        {
            $sort: { _id: -1 }
        }
    ]).toArray();
    return res.status(200).json(data)
})
app.listen(port, () => {
    console.log(`server is openning on port ${port}`);
})