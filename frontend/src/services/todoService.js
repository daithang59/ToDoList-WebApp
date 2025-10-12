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


// Toggle completed
export async function toggleTodo(id) {
  const { data } = await api.patch(`/${id}/toggle`);
  return data;
}

// Tìm kiếm (server-side)
export async function searchTodos(query) {
  const { data } = await api.get(`/search`, { params: { query } });
  return data;
}

// Lọc theo trạng thái (server-side)
export async function filterTodos(completed) {
  const { data } = await api.get(`/filter`, { params: { completed } });
  return data;
}

// Xóa toàn bộ task đã hoàn thành
export async function clearCompleted() {
  const { data } = await api.delete(`/clear/completed`);
  return data; // { deletedCount }
}
