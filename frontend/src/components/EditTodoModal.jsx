import { Modal, Input } from "antd";
import { useState, useEffect } from "react";

const { TextArea } = Input;

export default function EditTodoModal({ open, onClose, todo, onSave }) {
  const [desc, setDesc] = useState("");

  useEffect(() => {
    setDesc(todo?.description || "");
  }, [todo]);

  return (
    <Modal
      title="Chỉnh sửa ghi chú"
      open={open}
      onOk={() => onSave({ description: desc })}
      onCancel={onClose}
      okText="Lưu"
      cancelText="Hủy"
    >
      <TextArea
        value={desc}
        onChange={e => setDesc(e.target.value)}
        autoSize={{ minRows: 4 }}
        placeholder="Thêm mô tả/ghi chú..."
      />
    </Modal>
  );
}
