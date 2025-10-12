// src/App.jsx

import { Layout, message, Spin, Switch } from "antd";
import { useEffect, useMemo, useState } from "react";
import logo from "./assets/logo.svg";
import AddTodoForm from "./components/AddTodoForm.jsx";
import EditTodoModal from "./components/EditTodoModal.jsx";
import Sidebar from "./components/Sidebar/Sidebar.jsx"; // <-- IMPORT SIDEBAR
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

export default function App({ isDark, onToggleDark }) {
  // ... (toàn bộ state và logic của bạn giữ nguyên)
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTodo, setCurrentTodo] = useState(null);

  useEffect(() => {
    document.title = "To-Do List";
  }, []);
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchTodos();
        setTodos(data);
      } catch (e) {
        message.error("Không tải được danh sách công việc");
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  const sortedTodos = useMemo(() => {
    let data = [...todos];
    switch (sort) {
      case "oldest":
        return data.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      case "az":
        return data.sort((a, b) => a.title.localeCompare(b.title));
      case "za":
        return data.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }
  }, [todos, sort]);
  const pagedTodos = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedTodos.slice(start, start + pageSize);
  }, [sortedTodos, page, pageSize]);
  async function handleAdd() {
    const t = newTitle.trim();
    if (!t) return message.warning("Vui lòng nhập tiêu đề công việc");
    try {
      setAddLoading(true);
      const created = await createTodo({ title: t });
      if (filter !== "completed") {
        setTodos((prev) => [created, ...prev]);
      }
      setNewTitle("");
      message.success("Đã thêm công việc");
    } catch (e) {
      message.error(e?.response?.data?.message || "Không thể thêm công việc");
    } finally {
      setAddLoading(false);
    }
  }
  async function handleToggle(id, completed) {
    try {
      const updated = await updateTodo(id, { completed });
      setTodos((prev) => prev.map((x) => (x._id === id ? updated : x)));
    } catch {
      message.error("Không thể cập nhật trạng thái");
    }
  }
  async function handleDelete(id) {
    await deleteTodo(id);
    setTodos((prev) => prev.filter((x) => x._id !== id));
    message.success("Đã xoá công việc");
  }
  async function handleEditTitle(id, newTitle) {
    const updated = await updateTodo(id, { title: newTitle });
    setTodos((prev) => prev.map((x) => (x._id === id ? updated : x)));
    message.success("Đã cập nhật tiêu đề");
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
    const updated = await updateTodo(currentTodo._id, changes);
    setTodos((prev) =>
      prev.map((x) => (x._id === currentTodo._id ? updated : x))
    );
    message.success("Đã lưu ghi chú");
    closeModal();
  }
  async function handleSearch(q) {
    setQuery(q);
    try {
      if (!q.trim()) {
        const data = await fetchTodos();
        setTodos(data);
        setPage(1);
        return;
      }
      const data = await searchTodos(q);
      setTodos(data);
      setPage(1);
      setFilter("all");
    } catch {
      message.error("Không thể tìm kiếm");
    }
  }

  // Filter server-side
  async function handleFilterChange(val) {
    setFilter(val);
    try {
      if (val === "all") {
        const data = await fetchTodos();
        setTodos(data);
        setPage(1);
        return;
      }
      const data = await filterTodos(val === "completed");
      setTodos(data);
      setPage(1);
      setQuery("");
    } catch {
      message.error("Không thể lọc");
    }
  }

  async function handleClearCompleted() {
    try {
      const { deletedCount } = await clearCompleted();
      if (deletedCount > 0) {
        setTodos((prev) => prev.filter((t) => !t.completed));
        message.success(`Đã xoá ${deletedCount} công việc đã hoàn thành`);
      } else {
        message.info("Không có công việc đã hoàn thành");
      }
    } catch {
      message.error("Không thể xoá các công việc đã hoàn thành");
    }
  }

  return (
    <Layout>
      <Header className="app-header">
        <div className="header-title">
          <img src={logo} alt="To-Do Logo" className="app-logo-svg" />
          <h1>To-Do List</h1>
        </div>
        <div className="header-actions">
          <Switch
            checked={isDark}
            onChange={onToggleDark}
            checkedChildren="TỐI"
            unCheckedChildren="SÁNG"
          />
        </div>
      </Header>

      {/* --- CẤU TRÚC LAYOUT 2 CỘT --- */}
      <div className="app-layout">
        <aside className="app-sidebar">
          <Sidebar />
        </aside>

        <Content className="main-content">
          <main className="container">
            <div className="control-panel card">
              <AddTodoForm
                value={newTitle}
                onChange={setNewTitle}
                onAdd={handleAdd}
                loading={addLoading}
              />
              <Toolbar
                filter={filter}
                onFilterChange={handleFilterChange}
                sort={sort}
                onSortChange={setSort}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                query={query}
                onSearch={handleSearch}
                onClearCompleted={handleClearCompleted}
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
                  onDelete={handleDelete}
                  onEditTitle={handleEditTitle}
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
    </Layout>
  );
}
