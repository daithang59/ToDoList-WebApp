import { App, Button, Layout, Spin, Switch, Tag } from "antd";
import { Menu } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import logo from "./assets/logo.svg";
import AddTodoForm from "./components/AddTodoForm.jsx";
import CalendarView from "./components/CalendarView.jsx";
import Chatbot from "./components/Chatbot/Chatbot.jsx";
import EditTodoModal from "./components/EditTodoModal.jsx";
import KanbanBoard from "./components/KanbanBoard.jsx";
import ProjectModal from "./components/ProjectModal.jsx";
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import TodoList from "./components/TodoList.jsx";
import Toolbar from "./components/Toolbar.jsx";
import {
  QUEUE_ACTIONS,
  clearCompleted,
  createProject,
  createTodo,
  deleteProject,
  deleteTodo,
  enqueueAction,
  fetchProjects,
  fetchTodos,
  getCachedTodos,
  getClientId,
  getQueue,
  processQueue,
  reorderTodos,
  setCachedTodos,
  setQueue,
  updateProject,
  updateTodo,
} from "./services/todoService";
import { registerPushSubscription } from "./services/notificationService";

const { Header, Content } = Layout;

const STORAGE_KEYS = {
  filter: "todo:filter",
  sort: "todo:sort",
  pageSize: "todo:pageSize",
  query: "todo:query",
  viewMode: "todo:viewMode",
  projectId: "todo:projectId",
};

const VALID_FILTERS = new Set([
  "all",
  "active",
  "completed",
  "important",
  "today",
  "overdue",
]);

const VALID_PAGE_SIZES = new Set([5, 8, 10, 15]);
const VALID_VIEW_MODES = new Set(["list", "kanban", "calendar"]);
const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

const getStoredString = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  const stored = localStorage.getItem(key);
  return stored === null ? fallback : stored;
};

const getStoredNumber = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  const stored = localStorage.getItem(key);
  const parsed = Number.parseInt(stored, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeList = (values = []) => {
  const seen = new Set();
  return values
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean)
    .filter((value) => {
      const key = value.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const normalizeTodo = (todo) => ({
  ...todo,
  status: todo.status || (todo.completed ? "done" : "todo"),
  order: Number.isFinite(todo.order) ? todo.order : 0,
  tags: Array.isArray(todo.tags) ? todo.tags : [],
  subtasks: Array.isArray(todo.subtasks) ? todo.subtasks : [],
  dependencies: Array.isArray(todo.dependencies) ? todo.dependencies : [],
  recurrence: {
    enabled: false,
    interval: 1,
    unit: "day",
    until: null,
    ...(todo.recurrence || {}),
  },
  reminder: {
    enabled: false,
    minutesBefore: 60,
    channels: [],
    email: "",
    lastNotifiedAt: null,
    ...(todo.reminder || {}),
  },
});

const normalizeTodos = (todos) => todos.map((todo) => normalizeTodo(todo));

const isNetworkError = (error) => !error?.response;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function MainApp({ isDark, onToggleDark }) {
  const { message, modal } = App.useApp();
  const clientId = useMemo(() => getClientId(), []);

  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const [todos, setTodos] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTags, setNewTags] = useState([]);
  const [newProjectId, setNewProjectId] = useState(null);
  const [filter, setFilter] = useState(() => {
    const stored = getStoredString(STORAGE_KEYS.filter, "all");
    return VALID_FILTERS.has(stored) ? stored : "all";
  });
  const [sort, setSort] = useState(() => {
    const stored = getStoredString(STORAGE_KEYS.sort, "newest");
    return stored === "oldest" ? "oldest" : "newest";
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    const stored = getStoredNumber(STORAGE_KEYS.pageSize, 8);
    return VALID_PAGE_SIZES.has(stored) ? stored : 8;
  });
  const [query, setQuery] = useState(() =>
    getStoredString(STORAGE_KEYS.query, "")
  );
  const [viewMode, setViewMode] = useState(() => {
    const stored = getStoredString(STORAGE_KEYS.viewMode, "list");
    return VALID_VIEW_MODES.has(stored) ? stored : "list";
  });
  const [activeProjectId, setActiveProjectId] = useState(() =>
    getStoredString(STORAGE_KEYS.projectId, "all")
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTodo, setCurrentTodo] = useState(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectEditing, setProjectEditing] = useState(null);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [queueCount, setQueueCount] = useState(() => getQueue().length);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992) {
        setSidebarVisible(true);
      } else {
        setSidebarVisible(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.filter, filter);
    localStorage.setItem(STORAGE_KEYS.sort, sort);
    localStorage.setItem(STORAGE_KEYS.pageSize, String(pageSize));
    localStorage.setItem(STORAGE_KEYS.query, query);
    localStorage.setItem(STORAGE_KEYS.viewMode, viewMode);
    localStorage.setItem(STORAGE_KEYS.projectId, activeProjectId);
  }, [filter, sort, pageSize, query, viewMode, activeProjectId]);

  useEffect(() => {
    setCachedTodos(todos);
  }, [todos]);

  useEffect(() => {
    if (activeProjectId && activeProjectId !== "all") {
      setNewProjectId(activeProjectId);
    } else {
      setNewProjectId(null);
    }
  }, [activeProjectId]);

  const loadTodos = async () => {
    setLoading(true);
    if (!navigator.onLine) {
      const cached = getCachedTodos();
      setTodos(normalizeTodos(cached));
      setLoading(false);
      return;
    }

    let success = false;
    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i += 1) {
      try {
        const data = await fetchTodos({ memberId: clientId });
        if (Array.isArray(data)) {
          const normalized = normalizeTodos(data);
          setTodos(normalized);
          success = true;
          break;
        }
      } catch (error) {
        if (i < maxRetries - 1) {
          await sleep(1500);
        }
      }
    }
    if (!success) {
      message.error("Failed to load the task list.");
      const cached = getCachedTodos();
      setTodos(normalizeTodos(cached));
    }
    setLoading(false);
  };

  const loadProjects = async () => {
    try {
      const data = await fetchProjects({
        ownerId: clientId,
        sharedWith: clientId,
      });
      setProjects(Array.isArray(data) ? data : []);
    } catch {
      setProjects([]);
    }
  };

  const syncQueueAndRefresh = async () => {
    if (!navigator.onLine) return;
    setSyncing(true);
    const result = await processQueue();
    setQueueCount(result.remaining);
    await loadTodos();
    setSyncing(false);
  };

  useEffect(() => {
    loadTodos();
    loadProjects();
    if (navigator.onLine && getQueue().length > 0) {
      syncQueueAndRefresh();
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      message.success("Back online. Syncing changes...");
      syncQueueAndRefresh();
    };
    const handleOffline = () => {
      setIsOnline(false);
      message.warning("You are offline. Changes will sync later.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const hasCompleted = useMemo(
    () => todos.some((todo) => todo.completed),
    [todos]
  );

  const dependencyMap = useMemo(
    () => new Map(todos.map((todo) => [todo._id, Boolean(todo.completed)])),
    [todos]
  );

  const projectMap = useMemo(
    () => new Map(projects.map((project) => [project._id, project])),
    [projects]
  );

  const isBlocked = (todo) =>
    Array.isArray(todo.dependencies) &&
    todo.dependencies.length > 0 &&
    todo.dependencies.some((id) => dependencyMap.get(id) === false);

  const handleEnablePush = async () => {
    try {
      const result = await registerPushSubscription(clientId);
      if (result.enabled) {
        message.success("Push notifications enabled.");
      } else if (result.reason === "permission_denied") {
        message.warning("Push permission denied.");
      }
    } catch {
      message.error("Unable to enable push notifications.");
    }
  };

  const handleFilterSelect = (key) => {
    if (key.startsWith("filter-")) {
      const newFilter = key.replace("filter-", "");
      setFilter(newFilter);
      setPage(1);
    }
    if (window.innerWidth <= 992) {
      setSidebarVisible(false);
    }
  };

  const handleProjectSelect = (key) => {
    if (key.startsWith("project-")) {
      const projectId = key.replace("project-", "");
      setActiveProjectId(projectId === "all" ? "all" : projectId);
      setPage(1);
    }
    if (window.innerWidth <= 992) {
      setSidebarVisible(false);
    }
  };

  const filteredTodos = useMemo(() => {
    let data = [...todos];
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    if (activeProjectId && activeProjectId !== "all") {
      data = data.filter((todo) => todo.projectId === activeProjectId);
    }
    if (filter === "active") data = data.filter((todo) => !todo.completed);
    if (filter === "completed") data = data.filter((todo) => todo.completed);
    if (filter === "important") data = data.filter((todo) => todo.important);
    if (filter === "today") {
      data = data.filter((todo) => {
        if (!todo.deadline) return false;
        const deadline = new Date(todo.deadline);
        return deadline >= startOfToday && deadline <= endOfToday;
      });
    }
    if (filter === "overdue") {
      data = data.filter((todo) => {
        if (!todo.deadline) return false;
        const deadline = new Date(todo.deadline);
        return !todo.completed && deadline < now;
      });
    }

    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery) {
      data = data.filter((todo) => {
        const title = todo.title?.toLowerCase() || "";
        const description = todo.description?.toLowerCase() || "";
        const tags = Array.isArray(todo.tags)
          ? todo.tags.map((tag) => tag.toLowerCase())
          : [];
        const subtaskTitles = Array.isArray(todo.subtasks)
          ? todo.subtasks.map((subtask) => subtask.title?.toLowerCase() || "")
          : [];

        return (
          title.includes(normalizedQuery) ||
          description.includes(normalizedQuery) ||
          tags.some((tag) => tag.includes(normalizedQuery)) ||
          subtaskTitles.some((subtask) => subtask.includes(normalizedQuery))
        );
      });
    }
    return data;
  }, [todos, filter, query, activeProjectId]);

  const sortedTodos = useMemo(() => {
    let data = [...filteredTodos];
    switch (sort) {
      case "oldest":
        return data.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      default:
        return data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }
  }, [filteredTodos, sort]);

  const pagedTodos = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedTodos.slice(start, start + pageSize);
  }, [sortedTodos, page, pageSize]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(sortedTodos.length / pageSize));
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, pageSize, sortedTodos.length]);

  const updateQueueCount = () => {
    setQueueCount(getQueue().length);
  };

  const mergeQueuedCreate = (tempId, changes) => {
    const queue = getQueue();
    const index = queue.findIndex(
      (action) => action.type === QUEUE_ACTIONS.CREATE && action.tempId === tempId
    );
    if (index === -1) return false;
    queue[index] = {
      ...queue[index],
      payload: { ...queue[index].payload, ...changes },
    };
    setQueue(queue);
    setQueueCount(queue.length);
    return true;
  };

  const removeQueuedCreate = (tempId) => {
    const queue = getQueue();
    const nextQueue = queue.filter(
      (action) => !(action.type === QUEUE_ACTIONS.CREATE && action.tempId === tempId)
    );
    setQueue(nextQueue);
    setQueueCount(nextQueue.length);
    return nextQueue.length !== queue.length;
  };

  async function handleAdd() {
    const title = newTitle.trim();
    if (!title) return message.warning("Please enter the task title");
    setAddLoading(true);

    const tags = normalizeList(newTags);
    const tempId = `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const now = new Date().toISOString();
    const localTodo = normalizeTodo({
      _id: tempId,
      title,
      description: "",
      completed: false,
      status: "todo",
      order: 0,
      deadline: null,
      important: false,
      tags,
      projectId: newProjectId || null,
      ownerId: clientId,
      createdAt: now,
      updatedAt: now,
      syncStatus: isOnline ? "syncing" : "pending",
    });

    setTodos((prev) => [localTodo, ...prev]);
    setNewTitle("");
    setNewTags([]);

    const payload = {
      title,
      tags,
      projectId: newProjectId || undefined,
      ownerId: clientId,
    };

    if (!navigator.onLine) {
      enqueueAction({ type: QUEUE_ACTIONS.CREATE, tempId, payload });
      updateQueueCount();
      setAddLoading(false);
      message.info("Saved offline. Will sync later.");
      return;
    }

    try {
      const created = await createTodo(payload);
      setTodos((prev) =>
        prev.map((todo) =>
          todo._id === tempId ? normalizeTodo(created) : todo
        )
      );
      message.success("Task added successfully!");
    } catch (error) {
      if (isNetworkError(error)) {
        enqueueAction({ type: QUEUE_ACTIONS.CREATE, tempId, payload });
        updateQueueCount();
        message.info("Saved offline. Will sync later.");
      } else {
        setTodos((prev) => prev.filter((todo) => todo._id !== tempId));
        message.error(error?.response?.data?.message || "Unable to add task");
      }
    } finally {
      setAddLoading(false);
    }
  }

  async function handleToggle(id, completed) {
    const target = todos.find((todo) => todo._id === id);
    if (!target) return;
    if (completed && isBlocked(target)) {
      message.warning("Complete dependencies before finishing this task.");
      return;
    }

    const nextStatus = completed
      ? "done"
      : target.status === "done"
        ? "todo"
        : target.status;
    const updates = {
      completed,
      status: nextStatus,
      completedAt: completed ? new Date().toISOString() : null,
    };

    setTodos((prev) =>
      prev.map((todo) =>
        todo._id === id ? normalizeTodo({ ...todo, ...updates }) : todo
      )
    );

    if (!navigator.onLine) {
      if (!OBJECT_ID_REGEX.test(id)) {
        mergeQueuedCreate(id, updates);
      } else {
        enqueueAction({ type: QUEUE_ACTIONS.UPDATE, id, payload: updates });
        updateQueueCount();
      }
      message.info("Update saved offline.");
      return;
    }

    try {
      const updated = await updateTodo(id, updates);
      setTodos((prev) =>
        prev.map((todo) =>
          todo._id === id ? normalizeTodo(updated) : todo
        )
      );
      message.success("Task status updated!");
      if (target.recurrence?.enabled && completed) {
        await loadTodos();
      }
    } catch (error) {
      if (isNetworkError(error)) {
        if (!OBJECT_ID_REGEX.test(id)) {
          mergeQueuedCreate(id, updates);
        } else {
          enqueueAction({ type: QUEUE_ACTIONS.UPDATE, id, payload: updates });
          updateQueueCount();
        }
        message.info("Update saved offline.");
      } else {
        setTodos((prev) =>
          prev.map((todo) => (todo._id === id ? target : todo))
        );
        message.error(error?.response?.data?.message || "Unable to update status");
      }
    }
  }

  async function handleToggleImportant(id, important) {
    const target = todos.find((todo) => todo._id === id);
    if (!target) return;

    setTodos((prev) =>
      prev.map((todo) =>
        todo._id === id ? normalizeTodo({ ...todo, important }) : todo
      )
    );

    if (!navigator.onLine) {
      if (!OBJECT_ID_REGEX.test(id)) {
        mergeQueuedCreate(id, { important });
      } else {
        enqueueAction({ type: QUEUE_ACTIONS.UPDATE, id, payload: { important } });
        updateQueueCount();
      }
      message.info("Update saved offline.");
      return;
    }

    try {
      const updated = await updateTodo(id, { important });
      setTodos((prev) =>
        prev.map((todo) =>
          todo._id === id ? normalizeTodo(updated) : todo
        )
      );
      message.success("Updated importance level!");
    } catch (error) {
      if (isNetworkError(error)) {
        if (!OBJECT_ID_REGEX.test(id)) {
          mergeQueuedCreate(id, { important });
        } else {
          enqueueAction({ type: QUEUE_ACTIONS.UPDATE, id, payload: { important } });
          updateQueueCount();
        }
        message.info("Update saved offline.");
      } else {
        setTodos((prev) =>
          prev.map((todo) => (todo._id === id ? target : todo))
        );
        message.error(
          error?.response?.data?.message || "Unable to update importance level"
        );
      }
    }
  }

  async function handleDelete(id) {
    const previous = todos;
    setTodos((prev) => prev.filter((todo) => todo._id !== id));

    if (!navigator.onLine) {
      if (!OBJECT_ID_REGEX.test(id)) {
        removeQueuedCreate(id);
      } else {
        enqueueAction({ type: QUEUE_ACTIONS.DELETE, id });
        updateQueueCount();
      }
      message.info("Delete queued for sync.");
      return;
    }

    try {
      await deleteTodo(id);
      message.success("Task deleted successfully!");
    } catch (error) {
      if (isNetworkError(error)) {
        if (!OBJECT_ID_REGEX.test(id)) {
          removeQueuedCreate(id);
        } else {
          enqueueAction({ type: QUEUE_ACTIONS.DELETE, id });
          updateQueueCount();
        }
        message.info("Delete queued for sync.");
      } else {
        setTodos(previous);
        message.error("Unable to delete task");
      }
    }
  }

  function openModal(todo) {
    setCurrentTodo(todo);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setCurrentTodo(null);
  }

  async function saveModal(changes) {
    if (!currentTodo) return;

    const normalizedChanges = {
      ...changes,
      tags: normalizeList(changes.tags || []),
      sharedWith: normalizeList(changes.sharedWith || []),
      dependencies: Array.isArray(changes.dependencies)
        ? changes.dependencies
        : [],
      subtasks: Array.isArray(changes.subtasks) ? changes.subtasks : [],
    };

    const dependenciesToCheck =
      normalizedChanges.dependencies?.length > 0
        ? normalizedChanges.dependencies
        : currentTodo.dependencies;
    const blockedByDependencies =
      Array.isArray(dependenciesToCheck) &&
      dependenciesToCheck.some((id) => dependencyMap.get(id) === false);

    if (
      (normalizedChanges.status === "done" || normalizedChanges.completed) &&
      blockedByDependencies
    ) {
      message.warning("Complete dependencies before finishing this task.");
      return;
    }

    const previous = currentTodo;
    setTodos((prev) =>
      prev.map((todo) =>
        todo._id === currentTodo._id
          ? normalizeTodo({ ...todo, ...normalizedChanges })
          : todo
      )
    );
    closeModal();

    if (!navigator.onLine) {
      if (!OBJECT_ID_REGEX.test(currentTodo._id)) {
        mergeQueuedCreate(currentTodo._id, normalizedChanges);
      } else {
        enqueueAction({
          type: QUEUE_ACTIONS.UPDATE,
          id: currentTodo._id,
          payload: normalizedChanges,
        });
        updateQueueCount();
      }
      message.info("Update saved offline.");
      return;
    }

    try {
      const updated = await updateTodo(currentTodo._id, normalizedChanges);
      setTodos((prev) =>
        prev.map((todo) =>
          todo._id === currentTodo._id ? normalizeTodo(updated) : todo
        )
      );
      message.success("Task updated successfully!");
      if (previous.recurrence?.enabled && normalizedChanges.status === "done") {
        await loadTodos();
      }
    } catch (error) {
      if (isNetworkError(error)) {
        if (!OBJECT_ID_REGEX.test(currentTodo._id)) {
          mergeQueuedCreate(currentTodo._id, normalizedChanges);
        } else {
          enqueueAction({
            type: QUEUE_ACTIONS.UPDATE,
            id: currentTodo._id,
            payload: normalizedChanges,
          });
          updateQueueCount();
        }
        message.info("Update saved offline.");
      } else {
        setTodos((prev) =>
          prev.map((todo) => (todo._id === previous._id ? previous : todo))
        );
        message.error(error?.response?.data?.message || "Unable to update task");
      }
    }
  }

  function handleFilterChange(val) {
    setFilter(val);
    setPage(1);
  }

  function handleSearchChange(val) {
    setQuery(val);
    setPage(1);
  }

  function handlePageSizeChange(val) {
    setPageSize(val);
    setPage(1);
  }

  function handleViewModeChange(val) {
    setViewMode(val);
  }

  async function handleClearCompleted() {
    if (!hasCompleted) {
      message.info("No completed tasks to clear.");
      return;
    }
    modal.confirm({
      title: "Clear completed tasks?",
      content: "This action permanently deletes all completed tasks.",
      okText: "Clear",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: async () => {
        const previous = todos;
        setTodos((prev) => prev.filter((todo) => !todo.completed));
        if (!navigator.onLine) {
          enqueueAction({ type: QUEUE_ACTIONS.CLEAR_COMPLETED });
          updateQueueCount();
          message.info("Cleanup queued for sync.");
          return;
        }
        try {
          await clearCompleted();
          message.success("Completed tasks cleared!");
        } catch (error) {
          if (isNetworkError(error)) {
            enqueueAction({ type: QUEUE_ACTIONS.CLEAR_COMPLETED });
            updateQueueCount();
            message.info("Cleanup queued for sync.");
          } else {
            setTodos(previous);
            message.error("Cleanup operation failed");
          }
        }
      },
    });
  }

  const handleMoveTodo = async (id, status, targetIndex) => {
    const current = todos.find((todo) => todo._id === id);
    if (!current) return;
    if (status === "done" && isBlocked(current)) {
      message.warning("Complete dependencies before finishing this task.");
      return;
    }

    const currentStatus = current.status || (current.completed ? "done" : "todo");
    const nextTodos = todos.map((todo) =>
      todo._id === id
        ? normalizeTodo({
            ...todo,
            status,
            completed: status === "done",
            completedAt: status === "done" ? new Date().toISOString() : null,
          })
        : todo
    );

    const reorderTargets = new Set([currentStatus, status]);
    const updates = [];
    let updatedTodos = [...nextTodos];

    reorderTargets.forEach((statusKey) => {
      let column = updatedTodos.filter(
        (todo) => (todo.status || "todo") === statusKey
      );
      column.sort((a, b) => {
        const orderA = Number.isFinite(a.order) ? a.order : 0;
        const orderB = Number.isFinite(b.order) ? b.order : 0;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

      if (statusKey === status) {
        const moving = column.find((todo) => todo._id === id);
        column = column.filter((todo) => todo._id !== id);
        const insertIndex = Math.min(
          Math.max(targetIndex, 0),
          column.length
        );
        if (moving) {
          column.splice(insertIndex, 0, moving);
        }
      }

      column = column.map((todo, index) => {
        updates.push({ id: todo._id, status: statusKey, order: index });
        return { ...todo, order: index };
      });

      updatedTodos = updatedTodos.map((todo) =>
        column.some((item) => item._id === todo._id)
          ? column.find((item) => item._id === todo._id)
          : todo
      );
    });

    setTodos(updatedTodos);

    const serverUpdates = updates.filter((item) =>
      OBJECT_ID_REGEX.test(item.id)
    );

    if (!serverUpdates.length) {
      return;
    }

    if (!navigator.onLine) {
      enqueueAction({ type: QUEUE_ACTIONS.REORDER, items: serverUpdates });
      updateQueueCount();
      message.info("Reorder queued for sync.");
      return;
    }

    try {
      await reorderTodos(serverUpdates);
    } catch (error) {
      if (isNetworkError(error)) {
        enqueueAction({ type: QUEUE_ACTIONS.REORDER, items: serverUpdates });
        updateQueueCount();
        message.info("Reorder queued for sync.");
      } else {
        await loadTodos();
        message.error("Unable to reorder tasks.");
      }
    }
  };

  const openProjectModal = (project) => {
    setProjectEditing(project || null);
    setProjectModalOpen(true);
  };

  const closeProjectModal = () => {
    setProjectModalOpen(false);
    setProjectEditing(null);
  };

  const handleProjectSave = async (values) => {
    try {
      if (projectEditing) {
        const updated = await updateProject(projectEditing._id, values);
        setProjects((prev) =>
          prev.map((project) =>
            project._id === updated._id ? updated : project
          )
        );
        message.success("Project updated.");
      } else {
        const created = await createProject({ ...values, ownerId: clientId });
        setProjects((prev) => [created, ...prev]);
        setActiveProjectId(created._id);
        message.success("Project created.");
      }
      closeProjectModal();
    } catch (error) {
      message.error(error?.response?.data?.message || "Unable to save project.");
    }
  };

  const handleProjectDelete = (projectId) => {
    modal.confirm({
      title: "Delete this project?",
      content: "Tasks will remain, but the project will be removed.",
      okText: "Delete",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteProject(projectId);
          setProjects((prev) =>
            prev.filter((project) => project._id !== projectId)
          );
          if (activeProjectId === projectId) {
            setActiveProjectId("all");
          }
          message.success("Project deleted.");
          closeProjectModal();
        } catch {
          message.error("Unable to delete project.");
        }
      },
    });
  };

  return (
    <Layout>
      <Header className="app-header">
        <div className="header-title">
          <Button
            className="sidebar-toggle-btn"
            type="text"
            icon={<Menu size={20} />}
            onClick={() => setSidebarVisible(!isSidebarVisible)}
          />
          <img src={logo} alt="To-Do Logo" className="app-logo-svg" />
          <h1>To-Do List</h1>
        </div>
        <div className="header-actions">
          {!isOnline && <Tag color="volcano">Offline</Tag>}
          {queueCount > 0 && <Tag color="blue">Sync pending: {queueCount}</Tag>}
          {syncing && <Tag color="cyan">Syncing...</Tag>}
          <Switch
            checked={isDark}
            onChange={onToggleDark}
            checkedChildren="DARK"
            unCheckedChildren="LIGHT"
          />
        </div>
      </Header>

      <div
        className={`app-layout ${!isSidebarVisible ? "sidebar-collapsed" : ""}`}
      >
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarVisible(false)}
        ></div>

        <aside className="app-sidebar">
          <Sidebar
            onFilterSelect={handleFilterSelect}
            activeFilter={filter}
            projects={projects}
            activeProjectId={activeProjectId !== "all" ? activeProjectId : null}
            onProjectSelect={handleProjectSelect}
            onProjectAdd={() => openProjectModal(null)}
            onProjectEdit={(projectId) =>
              openProjectModal(projects.find((p) => p._id === projectId))
            }
          />
        </aside>

        <Content className="main-content">
          <main className="container">
            <div className="control-panel card">
              <AddTodoForm
                value={newTitle}
                onChange={setNewTitle}
                tags={newTags}
                onTagsChange={setNewTags}
                projects={projects}
                projectId={newProjectId}
                onProjectChange={setNewProjectId}
                onAdd={handleAdd}
                loading={addLoading}
              />
              <Toolbar
                filter={filter}
                onFilterChange={handleFilterChange}
                sort={sort}
                onSortChange={setSort}
                pageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
                query={query}
                onSearch={handleSearchChange}
                onClearCompleted={handleClearCompleted}
                clearDisabled={!hasCompleted}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
              />
            </div>

            <div className="todo-list-container">
              {loading ? (
                <Spin />
              ) : viewMode === "kanban" ? (
                <KanbanBoard
                  items={sortedTodos}
                  onMove={handleMoveTodo}
                  onToggleImportant={handleToggleImportant}
                  onDelete={handleDelete}
                  onOpenModal={openModal}
                  dependencyMap={dependencyMap}
                  projectMap={projectMap}
                />
              ) : viewMode === "calendar" ? (
                <CalendarView items={sortedTodos} onOpenModal={openModal} />
              ) : (
                <TodoList
                  items={pagedTodos}
                  total={sortedTodos.length}
                  page={page}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onToggle={handleToggle}
                  onToggleImportant={handleToggleImportant}
                  onDelete={handleDelete}
                  onOpenModal={openModal}
                  dependencyMap={dependencyMap}
                  projectMap={projectMap}
                />
              )}
            </div>
          </main>
        </Content>
      </div>

      <EditTodoModal
        open={modalOpen}
        onClose={closeModal}
        todo={currentTodo}
        onSave={saveModal}
        projects={projects}
        allTodos={todos}
        onEnablePush={handleEnablePush}
      />

      <ProjectModal
        open={projectModalOpen}
        project={projectEditing}
        onSave={handleProjectSave}
        onDelete={handleProjectDelete}
        onClose={closeProjectModal}
      />

      <Chatbot />
    </Layout>
  );
}
