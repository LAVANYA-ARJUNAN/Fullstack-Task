const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const port = 5000;
const JWT_SECRET = "task-secret";
const uri = "mongodb://127.0.0.1:27017"; // Local MongoDB URI

app.use(cors());
app.use(express.json());

const client = new MongoClient(uri);
let db, usersCollection, tasksCollection;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("TaskApp");
    usersCollection = db.collection("users");
    tasksCollection = db.collection("tasks");
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ DB connection error:", err);
  }
}
connectDB();

// Auth Middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.user = decoded;
    next();
  });
}

// Routes
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const user = await usersCollection.findOne({ email });
  if (user) return res.status(400).json({ error: "User already exists" });
  const hashed = await bcrypt.hash(password, 10);
  await usersCollection.insertOne({ email, password: hashed });
  res.json({ message: "Registered" });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await usersCollection.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });
  res.json({ token });
});

// Task routes
app.get("/api/tasks", authMiddleware, async (req, res) => {
  const tasks = await tasksCollection.find({ userId: req.user.id }).toArray();
  res.json(tasks);
});

app.post("/api/tasks", authMiddleware, async (req, res) => {
  const task = { ...req.body, userId: req.user.id, createdAt: new Date() };
  await tasksCollection.insertOne(task);
  res.json({ message: "Task created" });
});

app.put("/api/tasks/:id", authMiddleware, async (req, res) => {
  const id = new ObjectId(req.params.id);
  const updated = await tasksCollection.findOneAndUpdate(
    { _id: id, userId: req.user.id },
    { $set: { ...req.body, updatedAt: new Date() } },
    { returnDocument: "after" }
  );
  res.json(updated.value);
});

app.delete("/api/tasks/:id", authMiddleware, async (req, res) => {
  const id = new ObjectId(req.params.id);
  await tasksCollection.deleteOne({ _id: id, userId: req.user.id });
  res.json({ message: "Deleted" });
});
app.get("/", (req, res) => {
  res.send("✅ Task Manager API is running.");
});


app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));
