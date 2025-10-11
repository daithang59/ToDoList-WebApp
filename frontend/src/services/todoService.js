import { api } from "../api";

export async function fetchTodos() {
  const { data } = await api.get("/todos");
  return data; // [{_id,title,description,completed,createdAt,...}]
}

export async function createTodo(payload) {
  const { data } = await api.post("/todos", payload);
  return data;
}

export async function updateTodo(id, payload) {
  const { data } = await api.patch(`/todos/${id}`, payload);
  return data;
}

export async function deleteTodo(id) {
  await api.delete(`/todos/${id}`);
  return true;
}
