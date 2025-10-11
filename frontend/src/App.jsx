// src/App.jsx

import { Layout, message, Spin, Switch } from "antd";
import { useEffect, useMemo, useState } from "react";
import logoSvg from "./assets/logo.svg";
import AddTodoForm from "./components/AddTodoForm";
import Chatbot from "./components/Chatbot/Chatbot"; // 1. IMPORT CHATBOT
import EditTodoModal from "./components/EditTodoModal";
import Sidebar from "./components/Sidebar/Sidebar";
import TodoList from "./components/TodoList";
import Toolbar from "./components/Toolbar";
import {
  createTodo,
  deleteTodo,
  fetchTodos,
  updateTodo,
} from "./services/todoService";

const { Header, Content } = Layout;

export default function App({ isDark, onToggleDark }) {
  // State quản lý toàn bộ ứng dụng
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTodo, setCurrentTodo] = useState(null);

  // Cập nhật title của tab trình duyệt
  useEffect(() => {
    document.title = "TodoList App";
  }, []);

  // Lấy dữ liệu khi component được mount
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

  // Lọc và sắp xếp danh sách công việc
  const filteredSorted = useMemo(() => {
    let list = [...todos];
    if (filter === "active") list = list.filter((t) => !t.completed);
    if (filter === "completed") list = list.filter((t) => t.completed);
    list.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sort === "newest" ? db - da : da - db;
    });
    return list;
  }, [todos, filter, sort]);

  // Phân trang cho danh sách đã lọc
  const paged = filteredSorted.slice(
    (page - 1) * pageSize,
    (page - 1) * pageSize + pageSize
  );

  // Các hàm xử lý CRUD (Create, Read, Update, Delete)
  async function handleAdd() {
    const t = newTodoTitle.trim();
    if (!t) return message.warning("Vui lòng nhập tiêu đề công việc");
    try {
      setAddLoading(true);
      const created = await createTodo({ title: t });
      setTodos((prev) => [created, ...prev]);
      setNewTodoTitle("");
      message.success("Đã thêm công việc thành công");
    } catch (e) {
      message.error(e?.response?.data?.message || "Không thể thêm công việc");
    } finally {
      setAddLoading(false);
    }
  }

  async function handleToggle(id, completed) {
    const updated = await updateTodo(id, { completed });
    setTodos((prev) => prev.map((x) => (x._id === id ? updated : x)));
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

  return (
    <Layout>
      <Header className="app-header">
        <div className="header-title">
          <img src={logoSvg} alt="To-do List Logo" className="app-logo-svg" />
          <h1>TodoList</h1>
        </div>
        <Switch
          checked={isDark}
          onChange={onToggleDark}
          checkedChildren="DARK"
          unCheckedChildren="LIGHT"
        />
      </Header>

      <div className="app-layout">
        <aside className="app-sidebar">
          <Sidebar />
        </aside>

        <Content className="main-content">
          <main className="container">
            <div className="control-panel card">
              <AddTodoForm
                value={newTodoTitle}
                onChange={setNewTodoTitle}
                onAdd={handleAdd}
                loading={addLoading}
              />
              <Toolbar
                filter={filter}
                onFilterChange={setFilter}
                sort={sort}
                onSortChange={setSort}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
              />
            </div>

            <div className="todo-list-container">
              {loading ? (
                <div className="flex h-64 items-center justify-center">
                  <Spin />
                </div>
              ) : (
                <TodoList
                  items={paged}
                  total={filteredSorted.length}
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

      {/* 2. THÊM COMPONENT CHATBOT VÀO CUỐI */}
      <Chatbot />
    </Layout>
  );
}
