// src/App.jsx

import { App, Button, Layout, Spin, Switch } from "antd";
import { LogOut, Menu, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import logo from "./assets/logo.svg";
import AddTodoForm from "./components/AddTodoForm.jsx";
import AuthPage from "./components/Auth/AuthPage.jsx";
import Chatbot from "./components/Chatbot/Chatbot.jsx";
import ConflictModal from "./components/ConflictModal.jsx";
import EditTodoModal from "./components/EditTodoModal.jsx";
import KanbanBoard from "./components/KanbanBoard.jsx";
import ProjectModal from "./components/ProjectModal.jsx";
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import StatsOverview from "./components/StatsOverview.jsx";
import TodoList from "./components/TodoList.jsx";
import Toolbar from "./components/Toolbar.jsx";
import { useAuth } from "./contexts/AuthContext.jsx";
import {
  clearCompleted,
  createTodo,
  deleteTodo,
  fetchTodos,
  updateTodo,
} from "./services/todoService";

import { registerPushSubscription } from "./services/notificationService";
import {
  addTemplate,
  getTemplates,
} from "./services/templateService";

const { Header, Content } = Layout;

const STORAGE_KEYS = {
  filter: "todo:filter",
  sort: "todo:sort",
  pageSize: "todo:pageSize",
  query: "todo:query",
  viewMode: "todo:viewMode",
  projectId: "todo:projectId",
  priority: "todo:priority",
};

const VALID_FILTERS = new Set([
  "all",
  "active",
  "completed",
  "important",
  "today",
  "overdue",
]);

const PRIORITY_LEVELS = ["low", "medium", "high", "urgent"];
const VALID_PRIORITY_FILTERS = new Set(["all", ...PRIORITY_LEVELS]);

const VALID_PAGE_SIZES = new Set([5, 8, 10, 15]);
const VALID_VIEW_MODES = new Set(["list", "kanban", "calendar"]);
const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
const MAX_VIEW_LIMIT = 200;
const SEARCH_DEBOUNCE_MS = 300;

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
  priority: todo.priority || "medium",
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

const buildStatsFromTodos = (items = []) => {
  const stats = {
    total: 0,
    completed: 0,
    important: 0,
    active: 0,
    overdue: 0,
    inProgress: 0,
    todo: 0,
    done: 0,
    withDeadline: 0,
    completedPercentage: 0,
  };

  const now = new Date();
  items.forEach((todo) => {
    stats.total += 1;
    const isCompleted = Boolean(todo.completed);
    if (isCompleted) {
      stats.completed += 1;
      stats.done += 1;
    } else {
      stats.active += 1;
    }
    if (todo.important) {
      stats.important += 1;
    }
    const status = todo.status || (isCompleted ? "done" : "todo");
    if (status === "in_progress") {
      stats.inProgress += 1;
    } else if (status === "todo") {
      stats.todo += 1;
    }
    if (todo.deadline) {
      stats.withDeadline += 1;
      if (!isCompleted && new Date(todo.deadline) < now) {
        stats.overdue += 1;
      }
    }
  });

  stats.completedPercentage = stats.total
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  return stats;
};

const isNetworkError = (error) => !error?.response;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function MainApp({ isDark, onToggleDark }) {
  const { message } = App.useApp();
  const { isAuthenticated, loading: authLoading, user, isGuest, logout } = useAuth();

  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const [todos, setTodos] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTags, setNewTags] = useState([]);
  const [newProjectId, setNewProjectId] = useState(null);
  const [newPriority, setNewPriority] = useState("medium");
  const [templates, setTemplates] = useState(() => getTemplates());
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [filter, setFilter] = useState(() => {
    const stored = getStoredString(STORAGE_KEYS.filter, "all");
    return VALID_FILTERS.has(stored) ? stored : "all";
  });
  const [sort, setSort] = useState(() => {
    const stored = getStoredString(STORAGE_KEYS.sort, "newest");
    return stored === "oldest" ? "oldest" : "newest";
  });
  const [page, setPage] = useState(1);
  const initialPageSize = (() => {
    const stored = getStoredNumber(STORAGE_KEYS.pageSize, 8);
    return VALID_PAGE_SIZES.has(stored) ? stored : 8;
  })();
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [query, setQuery] = useState(() =>
    getStoredString(STORAGE_KEYS.query, "")
  );
  const [priorityFilter, setPriorityFilter] = useState(() => {
    const stored = getStoredString(STORAGE_KEYS.priority, "all");
    return VALID_PRIORITY_FILTERS.has(stored) ? stored : "all";
  });
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [viewMode, setViewMode] = useState(() => {
    const stored = getStoredString(STORAGE_KEYS.viewMode, "list");
    return VALID_VIEW_MODES.has(stored) ? stored : "list";
  });
  const [activeProjectId, setActiveProjectId] = useState(() => {
    const stored = getStoredString(STORAGE_KEYS.projectId, "all");
    if (stored === "all") return "all";
    return OBJECT_ID_REGEX.test(stored) ? stored : "all";
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTodo, setCurrentTodo] = useState(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectEditing, setProjectEditing] = useState(null);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [queueCount, setQueueCount] = useState(() => getQueue().length);
  const [conflicts, setConflicts] = useState(() => getConflicts());
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: initialPageSize,
    total: 0,
    pages: 0,
  });
  const [hasCompleted, setHasCompleted] = useState(false);
  const [stats, setStats] = useState(() => buildStatsFromTodos([]));
  const paramsRef = useRef(null);

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
    localStorage.setItem(STORAGE_KEYS.priority, priorityFilter);
  }, [filter, sort, pageSize, query, viewMode, activeProjectId, priorityFilter]);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedQuery(query);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    if (activeProjectId && activeProjectId !== "all") {
      setNewProjectId(activeProjectId);
    } else {
      setNewProjectId(null);
    }
  }, [activeProjectId]);

  useEffect(() => {
    if (activeProjectId === "all") return;
    if (!projects.some((project) => project._id === activeProjectId)) {
      setActiveProjectId("all");
    }
  }, [activeProjectId, projects]);

  const todoParams = useMemo(() => {
    const isListView = viewMode === "list";
    const params = {
      page: isListView ? page : 1,
      limit: isListView ? pageSize : MAX_VIEW_LIMIT,
      sortBy: "createdAt",
      sortOrder: sort === "oldest" ? "asc" : "desc",
    };
    if (filter && filter !== "all") params.filter = filter;
    if (debouncedQuery.trim()) params.query = debouncedQuery.trim();
    if (priorityFilter && priorityFilter !== "all") {
      params.priority = priorityFilter;
    }
    if (activeProjectId && activeProjectId !== "all") {
      params.projectId = activeProjectId;
    }
    return params;
  }, [
    viewMode,
    page,
    pageSize,
    sort,
    filter,
    debouncedQuery,
    priorityFilter,
    activeProjectId,
  ]);

  const ensureAuth = useCallback(async () => {
    if (!navigator.onLine) return true;
    try {
      await ensureAuthToken(clientId);
      return true;
    } catch {
      message.error("Authentication failed.");
      return false;
    }
  }, [clientId, message]);

  const applyLocalStats = useCallback((items) => {
    const derived = buildStatsFromTodos(items);
    setStats(derived);
    setHasCompleted(derived.completed > 0);
  }, []);

  const refreshStats = useCallback(
    async (fallbackItems) => {
      if (!navigator.onLine) {
        if (fallbackItems) {
          applyLocalStats(fallbackItems);
        }
        return;
      }
      try {
        const data = await fetchStats();
        if (data) {
          setStats(data);
          setHasCompleted(Boolean(data.completed));
          return;
        }
      } catch {
        if (fallbackItems) {
          applyLocalStats(fallbackItems);
        }
      }
    },
    [applyLocalStats]
  );

  const loadTodos = useCallback(async () => {
    setLoading(true);
    const params = todoParams;
    paramsRef.current = params;
    const cacheKey = JSON.stringify(params);

    const buildPaginationFallback = (items) => ({
      page: params.page || 1,
      limit: params.limit || pageSize,
      total: items.length,
      pages: items.length > 0 ? 1 : 0,
    });

    if (!navigator.onLine) {
      const cached = getCachedTodos();
      const cachedItems = Array.isArray(cached)
        ? cached
        : Array.isArray(cached?.items)
          ? cached.items
          : [];
      const cachedPagination =
        !Array.isArray(cached) && cached?.pagination
          ? cached.pagination
          : buildPaginationFallback(cachedItems);
      const normalizedItems = normalizeTodos(cachedItems);
      setTodos(normalizedItems);
      setPagination(cachedPagination);
      applyLocalStats(normalizedItems);
      setLoading(false);
      return;
    }

    const authOk = await ensureAuth();
    if (!authOk) {
      setLoading(false);
      return;
    }

    let success = false;
    let latestItems = [];
    let latestPagination = buildPaginationFallback([]);
    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i += 1) {
      try {
        const data = await fetchTodos(params);
        const payload = Array.isArray(data)
          ? { todos: data, pagination: buildPaginationFallback(data) }
          : data;
        const items = Array.isArray(payload?.todos) ? payload.todos : [];
        const nextPagination =
          payload?.pagination || buildPaginationFallback(items);
        const normalizedItems = normalizeTodos(items);
        latestItems = normalizedItems;
        latestPagination = nextPagination;
        setTodos(normalizedItems);
        setPagination(nextPagination);
        setCachedTodos({
          key: cacheKey,
          params,
          items,
          pagination: nextPagination,
          updatedAt: new Date().toISOString(),
        });
        success = true;
        break;
      } catch (error) {
        if (i < maxRetries - 1) {
          await sleep(1500);
        }
      }
    }

    if (!success) {
      message.error("Failed to load the task list.");
      const cached = getCachedTodos();
      const cachedItems = Array.isArray(cached)
        ? cached
        : Array.isArray(cached?.items)
          ? cached.items
          : [];
      const cachedPagination =
        !Array.isArray(cached) && cached?.pagination
          ? cached.pagination
          : buildPaginationFallback(cachedItems);
      const normalizedItems = normalizeTodos(cachedItems);
      setTodos(normalizedItems);
      setPagination(cachedPagination);
      applyLocalStats(normalizedItems);
      setLoading(false);
      return;
    }

    await refreshStats(latestItems);

    setLoading(false);
  }, [todoParams, pageSize, ensureAuth, message, applyLocalStats, refreshStats]);

  const loadProjects = useCallback(async () => {
    if (!navigator.onLine) {
      setProjects([]);
      return;
    }
    const authOk = await ensureAuth();
    if (!authOk) {
      setProjects([]);
      return;
    }
    try {
      const data = await fetchProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch {
      setProjects([]);
    }
  }, [ensureAuth]);

  const syncQueueAndRefresh = useCallback(async () => {
    if (!navigator.onLine) return;
    const authOk = await ensureAuth();
    if (!authOk) return;
    setSyncing(true);
    const result = await processQueue();
    setQueueCount(result.remaining);
    setConflicts(getConflicts());
    if (result.conflicts?.length) {
      message.warning(
        `Sync paused: ${result.conflicts.length} conflict(s) need review.`
      );
    }
    await loadTodos();
    setSyncing(false);
  }, [ensureAuth, loadTodos, message]);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  useEffect(() => {
    if (isOnline) {
      loadProjects();
      if (getQueue().length > 0) {
        syncQueueAndRefresh();
      }
    }
  }, [isOnline, loadProjects, syncQueueAndRefresh]);

  useEffect(() => {
    if (!paramsRef.current) return;
    setCachedTodos({
      key: JSON.stringify(paramsRef.current),
      params: paramsRef.current,
      items: todos,
      pagination,
      updatedAt: new Date().toISOString(),
    });
  }, [todos, pagination]);

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
  }, [message, syncQueueAndRefresh]);

  useEffect(() => {
    if (!isOnline) {
      applyLocalStats(todos);
    }
  }, [isOnline, todos, applyLocalStats]);

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
    if (!navigator.onLine) {
      message.warning("You are offline. Enable push when back online.");
      return;
    }
    const authOk = await ensureAuth();
    if (!authOk) return;
    try {
      const result = await registerPushSubscription();
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

  useEffect(() => {
    if (viewMode !== "list" && page !== 1) {
      setPage(1);
    }
  }, [viewMode, page]);

  useEffect(() => {
    if (pagination.pages && page > pagination.pages) {
      setPage(pagination.pages);
    }
  }, [page, pagination.pages]);

  const updateQueueCount = () => {
    setQueueCount(getQueue().length);
  };

  const adjustPaginationTotal = (delta) => {
    setPagination((prev) => {
      const total = Math.max(0, prev.total + delta);
      const pages = Math.max(1, Math.ceil(total / prev.limit));
      return { ...prev, total, pages };
    });
  };

  const refreshHasCompleted = (items) => {
    setHasCompleted(items.some((todo) => todo.completed));
  };

  const recordConflict = (action, error) => {
    if (error?.response?.status !== 409) return false;
    const conflict = {
      conflictId: `conflict-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      action: action.type,
      id: action.id,
      payload: action.payload,
      server: error.response?.data?.details?.current || null,
      occurredAt: new Date().toISOString(),
    };
    addConflict(conflict);
    setConflicts(getConflicts());
    message.warning("Conflict detected. Review it in the header.");
    return true;
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
      priority: newPriority,
      tags,
      projectId: newProjectId || null,
      ownerId: clientId,
      createdAt: now,
      updatedAt: now,
      syncStatus: isOnline ? "syncing" : "pending",
    });

    setTodos((prev) => {
      const next = [localTodo, ...prev];
      refreshHasCompleted(next);
      return next;
    });
    adjustPaginationTotal(1);
    setNewTitle("");
    setNewTags([]);

    const payload = {
      title,
      tags,
      priority: newPriority,
      projectId: newProjectId || undefined,
    };

    if (!navigator.onLine) {
      enqueueAction({ type: QUEUE_ACTIONS.CREATE, tempId, payload });
      updateQueueCount();
      setAddLoading(false);
      message.info("Saved offline. Will sync later.");
      return;
    }

    const authOk = await ensureAuth();
    if (!authOk) {
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
      await refreshStats();
    } catch (error) {
      if (isNetworkError(error)) {
        enqueueAction({ type: QUEUE_ACTIONS.CREATE, tempId, payload });
        updateQueueCount();
        message.info("Saved offline. Will sync later.");
      } else {
        setTodos((prev) => {
          const next = prev.filter((todo) => todo._id !== tempId);
          refreshHasCompleted(next);
          return next;
        });
        adjustPaginationTotal(-1);
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
    if (OBJECT_ID_REGEX.test(id) && target.updatedAt) {
      updates.clientUpdatedAt = target.updatedAt;
    }

    setTodos((prev) => {
      const next = prev.map((todo) =>
        todo._id === id ? normalizeTodo({ ...todo, ...updates }) : todo
      );
      refreshHasCompleted(next);
      return next;
    });

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

    const authOk = await ensureAuth();
    if (!authOk) {
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
      setTodos((prev) => {
        const next = prev.map((todo) =>
          todo._id === id ? normalizeTodo(updated) : todo
        );
        refreshHasCompleted(next);
        return next;
      });
      message.success("Task status updated!");
      if (target.recurrence?.enabled && completed) {
        await loadTodos();
      } else {
        await refreshStats();
      }
    } catch (error) {
      if (
        recordConflict(
          { type: QUEUE_ACTIONS.UPDATE, id, payload: updates },
          error
        )
      ) {
        await loadTodos();
        return;
      }
      if (isNetworkError(error)) {
        if (!OBJECT_ID_REGEX.test(id)) {
          mergeQueuedCreate(id, updates);
        } else {
          enqueueAction({ type: QUEUE_ACTIONS.UPDATE, id, payload: updates });
          updateQueueCount();
        }
        message.info("Update saved offline.");
      } else {
        setTodos((prev) => {
          const next = prev.map((todo) => (todo._id === id ? target : todo));
          refreshHasCompleted(next);
          return next;
        });
        message.error(error?.response?.data?.message || "Unable to update status");
      }
    }
  }

  async function handleToggleImportant(id, important) {
    const target = todos.find((todo) => todo._id === id);
    if (!target) return;

    const updatePayload = { important };
    if (OBJECT_ID_REGEX.test(id) && target.updatedAt) {
      updatePayload.clientUpdatedAt = target.updatedAt;
    }

    setTodos((prev) =>
      prev.map((todo) =>
        todo._id === id ? normalizeTodo({ ...todo, important }) : todo
      )
    );

    if (!navigator.onLine) {
      if (!OBJECT_ID_REGEX.test(id)) {
        mergeQueuedCreate(id, { important });
      } else {
        enqueueAction({ type: QUEUE_ACTIONS.UPDATE, id, payload: updatePayload });
        updateQueueCount();
      }
      message.info("Update saved offline.");
      return;
    }

    const authOk = await ensureAuth();
    if (!authOk) {
      if (!OBJECT_ID_REGEX.test(id)) {
        mergeQueuedCreate(id, { important });
      } else {
        enqueueAction({ type: QUEUE_ACTIONS.UPDATE, id, payload: updatePayload });
        updateQueueCount();
      }
      message.info("Update saved offline.");
      return;
    }

    try {
      const updated = await updateTodo(id, updatePayload);
      setTodos((prev) =>
        prev.map((todo) =>
          todo._id === id ? normalizeTodo(updated) : todo
        )
      );
      message.success("Updated importance level!");
      await refreshStats();
    } catch (error) {
      if (
        recordConflict(
          { type: QUEUE_ACTIONS.UPDATE, id, payload: updatePayload },
          error
        )
      ) {
        await loadTodos();
        return;
      }
      if (isNetworkError(error)) {
        if (!OBJECT_ID_REGEX.test(id)) {
          mergeQueuedCreate(id, { important });
        } else {
          enqueueAction({ type: QUEUE_ACTIONS.UPDATE, id, payload: updatePayload });
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
    setTodos((prev) => {
      const next = prev.filter((todo) => todo._id !== id);
      refreshHasCompleted(next);
      return next;
    });
    adjustPaginationTotal(-1);

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

    const authOk = await ensureAuth();
    if (!authOk) {
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
      await refreshStats();
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
        refreshHasCompleted(previous);
        adjustPaginationTotal(1);
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
    if (OBJECT_ID_REGEX.test(currentTodo._id) && currentTodo.updatedAt) {
      normalizedChanges.clientUpdatedAt = currentTodo.updatedAt;
    }

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
    setTodos((prev) => {
      const next = prev.map((todo) =>
        todo._id === currentTodo._id
          ? normalizeTodo({ ...todo, ...normalizedChanges })
          : todo
      );
      refreshHasCompleted(next);
      return next;
    });
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

    const authOk = await ensureAuth();
    if (!authOk) {
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
      setTodos((prev) => {
        const next = prev.map((todo) =>
          todo._id === currentTodo._id ? normalizeTodo(updated) : todo
        );
        refreshHasCompleted(next);
        return next;
      });
      message.success("Task updated successfully!");
      if (previous.recurrence?.enabled && normalizedChanges.status === "done") {
        await loadTodos();
      } else {
        await refreshStats();
      }
    } catch (error) {
      if (
        recordConflict(
          {
            type: QUEUE_ACTIONS.UPDATE,
            id: currentTodo._id,
            payload: normalizedChanges,
          },
          error
        )
      ) {
        await loadTodos();
        return;
      }
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
        setTodos((prev) => {
          const next = prev.map((todo) =>
            todo._id === previous._id ? previous : todo
          );
          refreshHasCompleted(next);
          return next;
        });
        message.error(error?.response?.data?.message || "Unable to update task");
      }
    }
  }

  function handleFilterChange(val) {
    setFilter(val);
    setPage(1);
  }

  function handlePriorityChange(val) {
    setPriorityFilter(val);
    setPage(1);
  }

  function handleSearchChange(val) {
    setQuery(val);
    setPage(1);
  }

  function handleSearchSubmit(val) {
    const next = typeof val === "string" ? val : query;
    setQuery(next);
    setDebouncedQuery(next);
    setPage(1);
  }

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplateId(templateId);
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;
    setNewTitle(template.title || "");
    setNewTags(Array.isArray(template.tags) ? template.tags : []);
    setNewPriority(
      PRIORITY_LEVELS.includes(template.priority)
        ? template.priority
        : "medium"
    );
    setNewProjectId(template.projectId || null);
  };

  const openTemplateModal = () => {
    if (!newTitle.trim()) {
      message.warning("Enter a task title before saving a template.");
      return;
    }
    setTemplateName(newTitle.trim());
    setTemplateModalOpen(true);
  };

  const handleTemplateSave = () => {
    const name = templateName.trim();
    if (!name) {
      message.warning("Template name is required.");
      return;
    }
    const template = {
      id: `tpl-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      title: newTitle.trim(),
      tags: normalizeList(newTags),
      priority: newPriority,
      projectId: newProjectId || null,
    };
    const next = addTemplate(template);
    setTemplates(next);
    setSelectedTemplateId(template.id);
    setTemplateModalOpen(false);
    setTemplateName("");
    message.success("Template saved.");
  };

  function handlePageSizeChange(val) {
    setPageSize(val);
    setPage(1);
    setPagination((prev) => {
      const pages = Math.max(1, Math.ceil(prev.total / val));
      return { ...prev, limit: val, pages, page: 1 };
    });
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
        const remaining = previous.filter((todo) => !todo.completed);
        const removedCount = previous.length - remaining.length;
        setTodos(remaining);
        refreshHasCompleted(remaining);
        if (removedCount > 0) {
          adjustPaginationTotal(-removedCount);
        }
        if (!navigator.onLine) {
          enqueueAction({ type: QUEUE_ACTIONS.CLEAR_COMPLETED });
          updateQueueCount();
          message.info("Cleanup queued for sync.");
          return;
        }
        const authOk = await ensureAuth();
        if (!authOk) {
          enqueueAction({ type: QUEUE_ACTIONS.CLEAR_COMPLETED });
          updateQueueCount();
          message.info("Cleanup queued for sync.");
          return;
        }
        try {
          await clearCompleted();
          message.success("Completed tasks cleared!");
          await refreshStats();
        } catch (error) {
          if (isNetworkError(error)) {
            enqueueAction({ type: QUEUE_ACTIONS.CLEAR_COMPLETED });
            updateQueueCount();
            message.info("Cleanup queued for sync.");
          } else {
            setTodos(previous);
            refreshHasCompleted(previous);
            adjustPaginationTotal(removedCount);
            message.error("Cleanup operation failed");
          }
        }
      },
    });
  }

  // Show auth page if not authenticated
  if (authLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

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
          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginRight: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <User size={18} />
                <span style={{ fontSize: "0.9rem" }}>
                  {isGuest ? "Khách" : user.name}
                </span>
              </div>
              <Button
                type="text"
                icon={<LogOut size={18} />}
                onClick={logout}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                Đăng xuất
              </Button>
            </div>
          )}
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
            <div className="stats-panel card">
              <StatsOverview stats={stats} loading={loading} />
            </div>
            <div className="control-panel card">
              <AddTodoForm
                value={newTitle}
                onChange={setNewTitle}
                tags={newTags}
                onTagsChange={setNewTags}
                projects={projects}
                projectId={newProjectId}
                onProjectChange={setNewProjectId}
                priority={newPriority}
                onPriorityChange={setNewPriority}
                templates={templates}
                templateId={selectedTemplateId}
                onTemplateSelect={handleTemplateSelect}
                onSaveTemplate={openTemplateModal}
                onAdd={handleAdd}
                loading={addLoading}
              />
              <Toolbar
                filter={filter}
                onFilterChange={handleFilterChange}
                sort={sort}
                onSortChange={setSort}
                priority={priorityFilter}
                onPriorityChange={handlePriorityChange}
                pageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
                query={query}
                onSearchChange={handleSearchChange}
                onSearchSubmit={handleSearchSubmit}
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
                  items={todos}
                  onMove={handleMoveTodo}
                  onToggleImportant={handleToggleImportant}
                  onDelete={handleDelete}
                  onOpenModal={openModal}
                  dependencyMap={dependencyMap}
                  projectMap={projectMap}
                />
              ) : viewMode === "calendar" ? (
                <CalendarView items={todos} onOpenModal={openModal} />
              ) : (
                <TodoList
                  items={todos}
                  total={pagination.total}
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

      <Modal
        title="Save Template"
        open={templateModalOpen}
        onOk={handleTemplateSave}
        onCancel={() => {
          setTemplateModalOpen(false);
          setTemplateName("");
        }}
        okText="Save"
        destroyOnClose
      >
        <Input
          placeholder="Template name"
          value={templateName}
          onChange={(event) => setTemplateName(event.target.value)}
        />
      </Modal>

      <EditTodoModal
        open={modalOpen}
        onClose={closeModal}
        todo={currentTodo}
        onSave={saveModal}
        projects={projects}
        allTodos={todos}
        onEnablePush={handleEnablePush}
      />

      <ConflictModal
        open={conflictModalOpen}
        conflicts={conflicts}
        onUseServer={handleUseServer}
        onReapplyLocal={handleReapplyLocal}
        onClose={() => setConflictModalOpen(false)}
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
