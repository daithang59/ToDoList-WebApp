// src/components/EditTodoModal.jsx
import { DatePicker, Input, Modal, Select } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const { TextArea } = Input;

export default function EditTodoModal({ open, onClose, todo, onSave }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [deadline, setDeadline] = useState(null);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    setTitle(todo?.title || "");
    setDesc(todo?.description || "");
    setDeadline(todo?.deadline ? dayjs(todo.deadline) : null);
    setTags(Array.isArray(todo?.tags) ? todo.tags : []);
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
            tags,
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
      <Select
        mode="tags"
        value={tags}
        onChange={(next) => setTags(next || [])}
        tokenSeparators={[","]}
        placeholder="Tags (comma-separated)"
        style={{ width: "100%", marginBottom: 12 }}
        maxTagCount="responsive"
        allowClear
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
