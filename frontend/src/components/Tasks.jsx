import React, { useEffect, useState } from "react";
import "./Auth.css"; // Reuse styles
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    const res = await fetch("http://localhost:5000/api/tasks", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();
    setTasks(data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="form-position-wrapper">
      <div className="auth-form">
        <h2>Task Manager</h2>
        <TaskForm onTaskAdded={fetchTasks} /><br />
        <TaskList tasks={tasks} onUpdate={fetchTasks} />
      </div>
    </div>
  );
}
