import { Button, Input, message } from "antd";
import { useState } from "react";

export default function AddTodoForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    const t = title.trim();
    if (!t) return message.warning("Nhập tiêu đề công việc");
    try {
      setLoading(true);
      await onAdd({ title: t });
      setTitle("");
    } catch (e) {
      message.error(e?.response?.data?.message || "Không thể thêm công việc");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="control-lg flex gap-3 w-full">
      <Input
        className="flex-1 min-w-0"
        placeholder="Việc cần làm..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onPressEnter={handleAdd}
        allowClear
      />
      <Button
        onClick={handleAdd}
        loading={loading}
        className="btn-gradient shadow-sm px-5"
      >
        Thêm
      </Button>
    </div>
  );
}
