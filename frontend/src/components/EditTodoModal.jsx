// src/components/EditTodoModal.jsx
import { DatePicker, Input, Modal } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const { TextArea } = Input;

export default function EditTodoModal({ open, onClose, todo, onSave }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [deadline, setDeadline] = useState(null);

  useEffect(() => {
    setTitle(todo?.title || "");
    setDesc(todo?.description || "");
    setDeadline(todo?.deadline ? dayjs(todo.deadline) : null);
  }, [todo]);

  return (
    <Modal
      title="Edit Todo"
      open={open}
      onOk={() => {
        if (title.trim()) {
          onSave({
            title: title.trim(),
            description: desc,
            deadline: deadline ? deadline.toDate() : null,
          });
        }
      }}
      onCancel={onClose}
      okText="Save"
      cancelText="Cancel"
      destroyOnClose
      okButtonProps={{ disabled: !title.trim() }}
    >
      <Input
        style={{ width: "100%", marginBottom: 12 }}
        placeholder="Todo title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
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
        placeholder="Add description/notes..."
      />
    </Modal>
  );
}
