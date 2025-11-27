const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database("./database.db");

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS employees (id INTEGER PRIMARY KEY, name TEXT, role TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, title TEXT, employee_id INTEGER)");
});

/* ========== EMPLOYEE CRUD ========== */

app.get("/employees", (req, res) => {
  db.all("SELECT * FROM employees", [], (err, rows) => res.json(rows));
});

app.post("/employees", (req, res) => {
  const { name, role } = req.body;
  db.run("INSERT INTO employees (name, role) VALUES (?, ?)", [name, role]);
  res.send("Employee Added");
});

app.put("/employees/:id", (req, res) => {
  const { name, role } = req.body;
  db.run("UPDATE employees SET name=?, role=? WHERE id=?", [name, role, req.params.id]);
  res.send("Employee Updated");
});

app.delete("/employees/:id", (req, res) => {
  db.run("DELETE FROM employees WHERE id=?", [req.params.id]);
  res.send("Employee Deleted");
});

/* ========== TASK CRUD + JOIN ========== */

app.get("/tasks", (req, res) => {
  db.all(`
    SELECT tasks.id, tasks.title, employees.name AS employee_name
    FROM tasks
    LEFT JOIN employees ON tasks.employee_id = employees.id
  `,
  [],
  (err, rows) => res.json(rows));
});

app.post("/tasks", (req, res) => {
  const { title, employee_id } = req.body;
  db.run("INSERT INTO tasks (title, employee_id) VALUES (?, ?)", [title, employee_id]);
  res.send("Task Added");
});

app.delete("/tasks/:id", (req, res) => {
  db.run("DELETE FROM tasks WHERE id=?", [req.params.id]);
  res.send("Task Deleted");
});

app.listen(3000, () => console.log("✅ Server running on port 3000"));
