// src/components/EditTodoModal.jsx
import { Modal, Input, DatePicker } from "antd";
import { useState, useEffect } from "react";
import dayjs from "dayjs";

const { TextArea } = Input;

export default function EditTodoModal({ open, onClose, todo, onSave }) {
  const [desc, setDesc] = useState("");
  const [deadline, setDeadline] = useState(null);

  useEffect(() => {
    setDesc(todo?.description || "");
    setDeadline(todo?.deadline ? dayjs(todo.deadline) : null);
  }, [todo]);

  return (
    <Modal
      title="Chỉnh sửa công việc"
      open={open}
      onOk={() =>
        onSave({
          description: desc,
          deadline: deadline ? deadline.toDate() : null,
        })
      }
      onCancel={onClose}
      okText="Lưu"
      cancelText="Hủy"
      destroyOnClose
    >
      <DatePicker
        style={{ width: "100%", marginBottom: 12 }}
        placeholder="Deadline"
        value={deadline}
        onChange={(d) => setDeadline(d)}
      />
      <TextArea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        autoSize={{ minRows: 4 }}
        placeholder="Thêm mô tả/ghi chú..."
      />
    </Modal>
  );
}
