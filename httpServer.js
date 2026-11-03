// Part A: HTTP server using only built-in http and fs modules (no Express)
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const PORT = 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// In-memory task storage
const tasks = [
  { id: 1, taskName: 'Develop Login Page', assignedTo: 'Rahul Sharma', status: 'Pending' },
  { id: 2, taskName: 'Design Database Schema', assignedTo: 'Priya Singh', status: 'In Progress' },
  { id: 3, taskName: 'Write Unit Tests', assignedTo: 'Amit Kumar', status: 'Completed' }
];

const sendJSON = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
};

const sendHTML = (res, statusCode, html) => {
  res.writeHead(statusCode, { 'Content-Type': 'text/html' });
  res.end(html);
};

const server = http.createServer((req, res) => {
  const { url, method } = req;

  // ---- GET /  ----
  if (url === '/' && method === 'GET') {
    return sendHTML(res, 200, '<h1>Welcome to Employee Task Management System</h1>');
  }

  // ---- GET /tasks ----
  if (url === '/tasks' && method === 'GET') {
    return sendJSON(res, 200, tasks);
  }

  // ---- GET /about ----
  if (url === '/about' && method === 'GET') {
    return sendHTML(
      res,
      200,
      '<h1>About</h1><p>Employee Task Management application built with the Node.js HTTP module. ' +
        'It lets you view, add and manage employee tasks.</p>'
    );
  }

  // ---- GET /home (static file using fs) ----
  if (url === '/home' && method === 'GET') {
    const filePath = path.join(__dirname, 'public', 'index.html');
    return fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error('File read error:', err.message);
        return sendHTML(res, 500, '<h1>500 - Internal Server Error</h1><p>Could not read the HTML file.</p>');
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  }

  // ---- POST /add-task ----
  if (url === '/add-task' && method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      let task;
      try {
        task = JSON.parse(body);
      } catch {
        return sendJSON(res, 400, { error: 'Invalid JSON format' });
      }

      const { id, taskName, assignedTo, status } = task || {};
      if (id === undefined || !taskName || !assignedTo || !status) {
        return sendJSON(res, 400, {
          error: 'Missing required fields: id, taskName, assignedTo and status'
        });
      }

      if (tasks.some((t) => t.id === id)) {
        return sendJSON(res, 409, { error: `Task with id ${id} already exists` });
      }

      const newTask = { id, taskName, assignedTo, status };
      tasks.push(newTask);
      return sendJSON(res, 201, { message: 'Task added successfully', task: newTask });
    });

    req.on('error', () => sendJSON(res, 400, { error: 'Bad request' }));
    return;
  }

  // ---- Known route, wrong method ----
  if (['/', '/tasks', '/about', '/home', '/add-task'].includes(url)) {
    return sendJSON(res, 405, { error: `Method ${method} not allowed on ${url}` });
  }

  // ---- 404 for invalid routes ----
  sendHTML(res, 404, '<h1>404 - Page Not Found</h1>');
});

server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});
