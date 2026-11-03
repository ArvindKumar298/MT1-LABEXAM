// Part B: Employee Task Management REST API using Express.js
import express from 'express';

const app = express();
const PORT = 4000;

app.use(express.json());

// Handle malformed JSON bodies
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON format' });
  }
  next(err);
});

// Sample data (in-memory array, no database)
let tasks = [
  { id: 1, taskName: 'Develop Login Page', assignedTo: 'Rahul Sharma', status: 'Pending', priority: 'High' },
  { id: 2, taskName: 'Design Database Schema', assignedTo: 'Priya Singh', status: 'In Progress', priority: 'Medium' },
  { id: 3, taskName: 'Write Unit Tests', assignedTo: 'Amit Kumar', status: 'Completed', priority: 'Low' }
];

const REQUIRED_FIELDS = ['taskName', 'assignedTo', 'status', 'priority'];
const missingFields = (body) => REQUIRED_FIELDS.filter((f) => !body || !body[f]);

// GET /tasks - all tasks
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// GET /tasks/:id - single task
app.get('/tasks/:id', (req, res) => {
  const task = tasks.find((t) => t.id === Number(req.params.id));
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

// POST /tasks - add task
app.post('/tasks', (req, res) => {
  const { id, taskName, assignedTo, status, priority } = req.body || {};
  const missing = [...(id === undefined ? ['id'] : []), ...missingFields(req.body)];

  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
  }
  if (tasks.some((t) => t.id === Number(id))) {
    return res.status(409).json({ error: `Task with id ${id} already exists` });
  }

  const newTask = { id: Number(id), taskName, assignedTo, status, priority };
  tasks.push(newTask);
  res.status(201).json({ message: 'Task added successfully', task: newTask });
});

// PUT /tasks/:id - update task
app.put('/tasks/:id', (req, res) => {
  const task = tasks.find((t) => t.id === Number(req.params.id));
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const missing = missingFields(req.body);
  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
  }

  const { taskName, assignedTo, status, priority } = req.body;
  Object.assign(task, { taskName, assignedTo, status, priority });
  res.json({ message: 'Task updated successfully', task });
});

// DELETE /tasks/:id - delete task
app.delete('/tasks/:id', (req, res) => {
  const index = tasks.findIndex((t) => t.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const [deletedTask] = tasks.splice(index, 1);
  res.json({ message: 'Task deleted successfully', task: deletedTask });
});

// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Express Server running at http://localhost:${PORT}`);
});
