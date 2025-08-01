import React, { useState } from "react";

const TaskForm = ({ onTaskAdded }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "pending",
    dueDate: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create task");
      }

      setForm({ title: "", description: "", status: "pending", dueDate: "" });
      onTaskAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-6">
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          className="p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
          maxLength={100}
        /><br/><br/>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          maxLength={500}
          rows={3}
        /><br/><br/>
        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          className="p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          min={new Date().toISOString().split('T')[0]}
        />
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select><br /><br />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition w-full disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {isLoading ? "Adding Task..." : "Add Task"}
        </button>
      </form>
    </div>
  );
};

export default TaskForm;
