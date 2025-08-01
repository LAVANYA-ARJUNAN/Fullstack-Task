import React, { useState } from "react";

const TaskList = ({ tasks, onUpdate }) => {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const startEdit = (task) => {
    setEditingId(task._id);
    setForm({
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: task.dueDate?.slice(0, 10) || "",
    });
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({});
    setError("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update task");
      }

      setEditingId(null);
      setForm({});
      onUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete task");
      }

      onUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      {tasks.map((task) => (
        <div
          key={task._id}
          className="bg-white shadow-md p-4 rounded-md border border-gray-200 hover:shadow-lg transition-shadow"
        >
          {editingId === task._id ? (
            <form onSubmit={handleUpdate} className="space-y-2">
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
                required
                maxLength={100}
              />
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
                rows={3}
                maxLength={500}
              />
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
                min={new Date().toISOString().split('T')[0]}
              />
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <div className="flex justify-between">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-green-300"
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {task.title}
                </h3>
                <p className="text-gray-600 mb-2 whitespace-pre-wrap">{task.description}</p>
                <p className="text-sm text-gray-500">
                  Status:{" "}
                  <span className={`capitalize font-medium ${
                    task.status === 'completed' ? 'text-green-600' : 
                    task.status === 'in-progress' ? 'text-blue-600' : 
                    'text-yellow-600'
                  }`}>
                    {task.status}
                  </span>{" "}
                  | Due:{" "}
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div className="space-x-3">
                <button
                  onClick={() => startEdit(task)}
                  disabled={isLoading}
                  className="text-blue-500 font-medium hover:text-blue-700 disabled:text-blue-300"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task._id)}
                  disabled={isLoading}
                  className="text-red-500 font-medium hover:text-red-700 disabled:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TaskList;
