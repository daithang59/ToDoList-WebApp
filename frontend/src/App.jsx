// src/App.jsx

import { App, Button, Layout, Spin, Switch } from "antd";
import { Menu } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import logo from "./assets/logo.svg";
import AddTodoForm from "./components/AddTodoForm.jsx";
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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function MainApp({ isDark, onToggleDark }) {
  const { message } = App.useApp();

  const [isSidebarVisible, setSidebarVisible] = useState(true);
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
          console.error(`Lần thử ${i + 1} thất bại:`, error);
          if (i < maxRetries - 1) {
            await sleep(2000);
          }
        }
      }
      if (!success) {
        message.error("Không tải được danh sách công việc sau nhiều lần thử.");
        setTodos([]);
      }
      setLoading(false);
    };
    fetchWithRetry();
  }, []);

  // [THÊM MỚI] Hàm để xử lý bật/tắt trạng thái "quan trọng"
  async function handleToggleImportant(id, important) {
    try {
      const updated = await updateTodo(id, { important });
      setTodos((prev) => prev.map((x) => (x._id === id ? updated : x)));
      message.success(`Đã cập nhật mức độ quan trọng!`);
    } catch {
      message.error("Không thể cập nhật mức độ quan trọng");
    }
  }

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

  const filteredTodos = useMemo(() => {
    let data = [...todos];
    if (filter === "active") data = data.filter((t) => !t.completed);
    if (filter === "completed") data = data.filter((t) => t.completed);
    // [THÊM MỚI] Logic lọc công việc quan trọng
    if (filter === "important") data = data.filter((t) => t.important);
    if (query) {
      data = data.filter((t) =>
        t.title.toLowerCase().includes(query.toLowerCase())
      );
    }
    return data;
  }, [todos, filter, query]);

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

  async function handleAdd() {
    const t = newTitle.trim();
    if (!t) return message.warning("Vui lòng nhập tiêu đề công việc");
    try {
      setAddLoading(true);
      const created = await createTodo({ title: t });
      setTodos((prev) => [created, ...prev]);
      setNewTitle("");
      message.success("Đã thêm công việc thành công!");
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
      message.success(`Đã cập nhật trạng thái công việc!`);
    } catch {
      message.error("Không thể cập nhật trạng thái");
    }
  }
  async function handleDelete(id) {
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((x) => x._id !== id));
      message.success("Đã xóa công việc thành công!");
    } catch {
      message.error("Không thể xóa công việc");
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
      const updated = await updateTodo(currentTodo._id, changes);
      setTodos((prev) =>
        prev.map((x) => (x._id === currentTodo._id ? updated : x))
      );
      closeModal();
      message.success("Đã cập nhật công việc thành công!");
    } catch {
      message.error("Không thể cập nhật công việc");
    }
  }
  async function handleFilterChange(val) {
    setFilter(val);
    setPage(1);
  }
  async function handleClearCompleted() {
    try {
      await clearCompleted();
      setTodos((prev) => prev.filter((t) => !t.completed));
      message.success("Đã dọn dẹp các công việc hoàn thành!");
    } catch {
      message.error("Thao tác dọn dẹp thất bại");
    }
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
            checkedChildren="TỐI"
            unCheckedChildren="SÁNG"
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
          <Sidebar onMenuItemClick={handleMenuItemClick} />
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
                onSearch={setQuery}
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
                  // [THÊM MỚI] Truyền hàm xử lý vào TodoList
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
    </Layout>
  );
}
