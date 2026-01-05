// src/App.jsx

import { App, Button, Layout, Spin, Switch } from "antd";
import { Menu } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import logo from "./assets/logo.svg";
import AddTodoForm from "./components/AddTodoForm.jsx";
import Chatbot from "./components/Chatbot/Chatbot.jsx";
import EditTodoModal from "./components/EditTodoModal.jsx";
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import TodoList from "./components/TodoList.jsx";
import Toolbar from "./components/Toolbar.jsx";
import {
  clearCompleted,
  createTodo,
  deleteTodo,
  fetchTodos,
  updateTodo,
} from "./services/todoService";

const { Header, Content } = Layout;

const STORAGE_KEYS = {
  filter: "todo:filter",
  sort: "todo:sort",
  pageSize: "todo:pageSize",
  query: "todo:query",
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

const normalizeTags = (tags = []) => {
  const seen = new Set();
  return tags
    .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
    .filter(Boolean)
    .filter((tag) => {
      const key = tag.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

// Hàm delay để chờ giữa các lần thử lại
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function MainApp({ isDark, onToggleDark }) {
  const { message, modal } = App.useApp();

  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTags, setNewTags] = useState([]);
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
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTodo, setCurrentTodo] = useState(null);

  // useEffect để xử lý responsive cho sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992) {
        setSidebarVisible(true);
      } else {
        setSidebarVisible(false);
      }
    };
    handleResize(); // Chạy lần đầu
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.filter, filter);
    localStorage.setItem(STORAGE_KEYS.sort, sort);
    localStorage.setItem(STORAGE_KEYS.pageSize, String(pageSize));
    localStorage.setItem(STORAGE_KEYS.query, query);
  }, [filter, sort, pageSize, query]);

  const hasCompleted = useMemo(
    () => todos.some((todo) => todo.completed),
    [todos]
  );

  // useEffect fetch dữ liệu với cơ chế tự động thử lại
  useEffect(() => {
    const fetchWithRetry = async () => {
      let success = false;
      const maxRetries = 3;
      for (let i = 0; i < maxRetries; i++) {
        try {
          const data = await fetchTodos();
          if (Array.isArray(data)) {
            setTodos(data);
            success = true;
            break;
          }
        } catch (error) {
          console.error(`Attempt ${i + 1} failed:`, error);
          if (i < maxRetries - 1) {
            await sleep(2000);
          }
        }
      }
      if (!success) {
        message.error("Failed to load the task list after multiple attempts.");
        setTodos([]);
      }
      setLoading(false);
    };
    fetchWithRetry();
  }, []);

  // Hàm để xử lý bật/tắt trạng thái "quan trọng"
  async function handleToggleImportant(id, important) {
    try {
      const updated = await updateTodo(id, { important });
      setTodos((prev) => prev.map((x) => (x._id === id ? updated : x)));
      message.success(`Updated importance level!`);
    } catch {
      message.error("Unable to update importance level");
    }
  }

  // Hàm xử lý khi click vào một mục trong sidebar
  const handleMenuItemClick = (menuInfo) => {
    const key = menuInfo.key;
    if (key.startsWith("filter-")) {
      const newFilter = key.replace("filter-", "");
      setFilter(newFilter);
      setPage(1);
    }
    if (window.innerWidth <= 992) {
      setSidebarVisible(false);
    }
  };

  // Logic lọc công việc
  const filteredTodos = useMemo(() => {
    let data = [...todos];
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    if (filter === "active") data = data.filter((t) => !t.completed);
    if (filter === "completed") data = data.filter((t) => t.completed);
    if (filter === "important") data = data.filter((t) => t.important);
    if (filter === "today") {
      data = data.filter((t) => {
        if (!t.deadline) return false;
        const deadline = new Date(t.deadline);
        return deadline >= startOfToday && deadline <= endOfToday;
      });
    }
    if (filter === "overdue") {
      data = data.filter((t) => {
        if (!t.deadline) return false;
        const deadline = new Date(t.deadline);
        return !t.completed && deadline < now;
      });
    }

    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery) {
      data = data.filter((t) => {
        const title = t.title?.toLowerCase() || "";
        const description = t.description?.toLowerCase() || "";
        const tags = Array.isArray(t.tags)
          ? t.tags.map((tag) => tag.toLowerCase())
          : [];

        return (
          title.includes(normalizedQuery) ||
          description.includes(normalizedQuery) ||
          tags.some((tag) => tag.includes(normalizedQuery))
        );
      });
    }
    return data;
  }, [todos, filter, query]);

  // Logic sắp xếp công việc
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

  // Logic phân trang
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

  // Các hàm xử lý CRUD
  async function handleAdd() {
    const t = newTitle.trim();
    if (!t) return message.warning("Please enter the task title");
    try {
      setAddLoading(true);
      const tags = normalizeTags(newTags);
      const payload = { title: t };
      if (tags.length) {
        payload.tags = tags;
      }
      const created = await createTodo(payload);
      setTodos((prev) => [created, ...prev]);
      setNewTitle("");
      setNewTags([]);
      message.success("Task added successfully!");
    } catch (e) {
      message.error(e?.response?.data?.message || "Unable to add task");
    } finally {
      setAddLoading(false);
    }
  }

  async function handleToggle(id, completed) {
    try {
      const updated = await updateTodo(id, { completed });
      setTodos((prev) => prev.map((x) => (x._id === id ? updated : x)));
      message.success(`Task status updated!`);
    } catch {
      message.error("Unable to update status");
    }
  }

  async function handleDelete(id) {
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((x) => x._id !== id));
      message.success("Task deleted successfully!");
    } catch {
      message.error("Unable to delete task");
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
    try {
      const normalized = { ...changes };
      if (normalized.tags) {
        normalized.tags = normalizeTags(normalized.tags);
      }
      const updated = await updateTodo(currentTodo._id, normalized);
      setTodos((prev) =>
        prev.map((x) => (x._id === currentTodo._id ? updated : x))
      );
      closeModal();
      message.success("Task updated successfully!");
    } catch {
      message.error("Unable to update task");
    }
  }

  async function handleFilterChange(val) {
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
        try {
          await clearCompleted();
          setTodos((prev) => prev.filter((t) => !t.completed));
          message.success("Completed tasks cleared!");
        } catch {
          message.error("Cleanup operation failed");
        }
      },
    });
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
            onMenuItemClick={handleMenuItemClick}
            activeFilter={filter}
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
              />
            </div>

            <div className="todo-list-container">
              {loading ? (
                <Spin />
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
      />

      <Chatbot />
    </Layout>
  );
}
