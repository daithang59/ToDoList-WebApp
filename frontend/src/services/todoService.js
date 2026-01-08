import { api } from "../api";

const STORAGE_KEYS = {
  cache: "todo:cache",
  queue: "todo:queue",
  clientId: "todo:clientId",
};

const QUEUE_ACTIONS = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  CLEAR_COMPLETED: "clear_completed",
  REORDER: "reorder",
};

const safeParse = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const readStorage = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  const value = localStorage.getItem(key);
  if (!value) return fallback;
  return safeParse(value, fallback);
};

const writeStorage = (key, value) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
};

export const getClientId = () => {
  if (typeof window === "undefined") return "";
  let clientId = localStorage.getItem(STORAGE_KEYS.clientId);
  if (!clientId) {
    clientId = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `client-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(STORAGE_KEYS.clientId, clientId);
  }
  return clientId;
};

export const getCachedTodos = () => readStorage(STORAGE_KEYS.cache, null);

export const setCachedTodos = (cache) => {
  writeStorage(STORAGE_KEYS.cache, cache);
};

export const getQueue = () => readStorage(STORAGE_KEYS.queue, []);

export const setQueue = (queue) => {
  writeStorage(STORAGE_KEYS.queue, queue);
};

export const enqueueAction = (action) => {
  const queue = getQueue();
  queue.push(action);
  setQueue(queue);
  return queue;
};

export const clearQueue = () => {
  setQueue([]);
};

export async function processQueue() {
  const queue = getQueue();
  if (!queue.length) return { processed: 0, remaining: 0 };

  const remaining = [];
  for (let i = 0; i < queue.length; i += 1) {
    const action = queue[i];
    try {
      if (action.type === QUEUE_ACTIONS.CREATE) {
        await api.post("/todos", action.payload);
      }
      if (action.type === QUEUE_ACTIONS.UPDATE) {
        await api.patch(`/todos/${action.id}`, action.payload);
      }
      if (action.type === QUEUE_ACTIONS.DELETE) {
        await api.delete(`/todos/${action.id}`);
      }
      if (action.type === QUEUE_ACTIONS.CLEAR_COMPLETED) {
        await api.delete(`/todos/clear/completed`);
      }
      if (action.type === QUEUE_ACTIONS.REORDER) {
        await api.patch(`/todos/reorder`, { items: action.items });
      }
    } catch (error) {
      remaining.push(...queue.slice(i));
      break;
    }
  }

  setQueue(remaining);
  return { processed: queue.length - remaining.length, remaining: remaining.length };
}

export async function fetchTodos(params = {}) {
  const { data } = await api.get("/todos", { params });
  return data;
}

export async function fetchStats() {
  const { data } = await api.get("/todos/stats");
  return data;
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

export async function toggleTodo(id) {
  const { data } = await api.patch(`/todos/${id}/toggle`);
  return data;
}

export async function searchTodos(query) {
  const { data } = await api.get(`/todos/search`, { params: { query } });
  return data;
}

export async function filterTodos(params) {
  const { data } = await api.get(`/todos/filter`, { params });
  return data;
}

export async function clearCompleted() {
  const { data } = await api.delete(`/todos/clear/completed`);
  return data;
}

export async function reorderTodos(items) {
  const { data } = await api.patch(`/todos/reorder`, { items });
  return data;
}

export async function fetchProjects(params = {}) {
  const { data } = await api.get("/projects", { params });
  return data;
}

export async function createProject(payload) {
  const { data } = await api.post("/projects", payload);
  return data;
}

export async function updateProject(id, payload) {
  const { data } = await api.patch(`/projects/${id}`, payload);
  return data;
}

export async function deleteProject(id) {
  await api.delete(`/projects/${id}`);
  return true;
}

export { QUEUE_ACTIONS };
