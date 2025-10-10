import { Layout, Spin, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import AddTodoForm from "./components/AddTodoForm";
import EditTodoModal from "./components/EditTodoModal";
import TodoList from "./components/TodoList";
import Toolbar from "./components/Toolbar";
import {
  createTodo,
  deleteTodo,
  fetchTodos,
  updateTodo,
} from "./services/todoService";

import { MoonFilled, SunFilled } from "@ant-design/icons";
import { Switch } from "antd";

const { Header, Content } = Layout;
export default function App({ isDark = false, onToggleDark = () => {} }) {
  console.log("isDark:", isDark); // Debug log
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | active | completed
  const [sort, setSort] = useState("newest"); // newest | oldest
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [modalOpen, setModalOpen] = useState(false);
  const [currentTodo, setCurrentTodo] = useState(null);

  // load initial
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchTodos();
        setTodos(data);
      } catch (e) {
        message.error("Không tải được danh sách");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // derived list (filter + sort)
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

  // pagination slice
  const total = filteredSorted.length;
  const start = (page - 1) * pageSize;
  const paged = filteredSorted.slice(start, start + pageSize);

  function handlePageChange(p) {
    setPage(p);
  }
  function handleFilterChange(key) {
    setFilter(key);
    setPage(1);
  }
  function handleSortChange(val) {
    setSort(val);
    setPage(1);
  }
  function handlePageSizeChange(val) {
    setPageSize(val);
    setPage(1);
  }

  // CRUD handlers
  async function handleAdd(payload) {
    const t = await createTodo(payload);
    setTodos((prev) => [t, ...prev]);
    message.success("Đã thêm");
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
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((x) => x._id !== id));
      message.success("Đã xoá");
    } catch {
      message.error("Không thể xoá");
    }
  }

  async function handleEditTitle(id, newTitle) {
    try {
      const updated = await updateTodo(id, { title: newTitle });
      setTodos((prev) => prev.map((x) => (x._id === id ? updated : x)));
      message.success("Đã cập nhật tiêu đề");
    } catch {
      message.error("Không thể cập nhật tiêu đề");
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
    try {
      const updated = await updateTodo(currentTodo._id, changes);
      setTodos((prev) =>
        prev.map((x) => (x._id === currentTodo._id ? updated : x))
      );
      message.success("Đã lưu ghi chú");
      closeModal();
    } catch {
      message.error("Không thể lưu ghi chú");
    }
  }

  return (
    <Layout className="min-h-screen">
      {/* Header: màu theo theme, chữ luôn rõ */}
      <Header
        className={
          isDark
            ? "bg-[#0B1222] text-slate-100 sticky top-0 z-10"
            : "bg-white text-slate-900 sticky top-0 z-10 border-b border-slate-100"
        }
      >
        <div className="w-full h-[58px] px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block"></span>
            <h1 className="text-[20px] font-semibold">To-do List</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className={isDark ? "text-slate-300" : "text-slate-500"}>
              MERN • AntD • Tailwind
            </span>
            <Switch
              checked={isDark}
              onChange={onToggleDark}
              size="default"
              className="flex items-center"
              checkedChildren={
                <MoonFilled
                  style={{
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />
              }
              unCheckedChildren={
                <SunFilled
                  style={{
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />
              }
            />
          </div>
        </div>
      </Header>

      <Content>
        <div className="w-full h-[calc(100vh-58px)] p-4 bg-grid">
          <div className="grid grid-cols-1 md:grid-cols-[340px,1fr] gap-4 h-full">
            {/* LEFT */}
            <aside className="card p-6 md:sticky md:top-[74px] md:self-start md:h-fit z-0">
              <div className="space-y-4">
                <div className="input-pill">
                  <AddTodoForm onAdd={handleAdd} />
                </div>
                <div className="w-full">
                  <Toolbar
                    filter={filter}
                    onFilterChange={(k) => {
                      setFilter(k);
                      setPage(1);
                    }}
                    sort={sort}
                    onSortChange={(v) => {
                      setSort(v);
                      setPage(1);
                    }}
                    pageSize={pageSize}
                    onPageSizeChange={(v) => {
                      setPageSize(v);
                      setPage(1);
                    }}
                  />
                </div>
              </div>
            </aside>

            {/* RIGHT */}
            <section className="card p-6 h-full z-0">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <Spin tip="Đang tải..." />
                </div>
              ) : (
                <div className="h-full overflow-auto">
                  <TodoList
                    items={paged}
                    total={filteredSorted.length}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={(p) => setPage(p)}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onEditTitle={handleEditTitle}
                    onOpenModal={openModal}
                  />
                </div>
              )}
            </section>
          </div>
        </div>
      </Content>

      <EditTodoModal
        open={modalOpen}
        onClose={closeModal}
        todo={currentTodo}
        onSave={saveModal}
      />
    </Layout>
  );
}
