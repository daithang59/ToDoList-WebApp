import { Button, Checkbox, Input, message } from "antd";
import { useEffect, useState } from "react";
import { api } from "./api";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");

  async function load() {
    const { data } = await api.get("/todos");
    setTodos(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function addTodo() {
    const t = title.trim();
    if (!t) return message.warning("Nhập tiêu đề");
    const { data } = await api.post("/todos", { title: t });
    setTodos((prev) => [data, ...prev]);
    setTitle("");
  }

  async function toggleCompleted(id, completed) {
    const { data } = await api.patch(`/todos/${id}`, { completed });
    setTodos((prev) => prev.map((x) => (x._id === id ? data : x)));
  }

  async function remove(id) {
    await api.delete(`/todos/${id}`);
    setTodos((prev) => prev.filter((x) => x._id !== id));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">To-do List</h1>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Việc cần làm..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onPressEnter={addTodo}
          />
          <Button type="primary" onClick={addTodo}>
            Thêm
          </Button>
        </div>

        <ul className="space-y-2">
          {todos.map((t) => (
            <li
              key={t._id}
              className="bg-white rounded-lg p-3 flex items-center justify-between shadow"
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={t.completed}
                  onChange={(e) => toggleCompleted(t._id, e.target.checked)}
                />
                <span
                  className={t.completed ? "line-through text-gray-400" : ""}
                >
                  {t.title}
                </span>
              </div>
              <Button danger onClick={() => remove(t._id)}>
                Xoá
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
