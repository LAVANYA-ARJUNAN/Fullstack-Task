const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://lavu:1216@cluster0.g4xenqc.mongodb.net/TaskApp?retryWrites=true&w=majority";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB!");
    const db = client.db("Login");
    const users = db.collection("datas");
    const test = await users.findOne({});
    console.log("Sample user:", test);
  } catch (err) {
    console.error("❌ Connection error:", err);
  } finally {
    await client.close();
  }
}

run();
