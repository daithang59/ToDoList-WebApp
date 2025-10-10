import { Empty, List } from "antd";

export default function TodoList({
  items,
  total,
  page,
  pageSize,
  onPageChange,
  onToggle,
  onDelete,
  onEditTitle,
  onOpenModal,
}) {
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Empty description="Chưa có công việc nào" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <List
        split={false}
        className="!w-full"
        dataSource={items}
        renderItem={(t) => (
          <List.Item className="!border-none !px-0 !py-0">
            <TodoItem
              item={t}
              onToggle={(completed) => onToggle(t._id, completed)}
              onDelete={() => onDelete(t._id)}
              onEditTitle={(newTitle) => onEditTitle(t._id, newTitle)}
              onOpenModal={() => onOpenModal(t)}
            />
          </List.Item>
        )}
      />
    </div>
  );
}
