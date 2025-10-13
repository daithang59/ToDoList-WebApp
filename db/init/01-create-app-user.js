// Script này sẽ được chạy tự động khi container Mongo khởi tạo lần đầu
// Nó chạy với quyền root dựa trên MONGO_INITDB_ROOT_* do Compose map vào.

const dbName = process.env.MONGO_INITDB_DATABASE || "todolist";
const appUser = process.env.MONGO_APP_USERNAME || "todoapp";
const appPass = process.env.MONGO_APP_PASSWORD || "strongpass";

print(`🔧 Initializing database '${dbName}'...`);
print(`👤 Creating application user '${appUser}' on database '${dbName}'...`);
print(`🔑 Using password: [${appPass.length} characters]`);

// Chuyển sang database được chỉ định
db = db.getSiblingDB(dbName);

// Xóa user nếu tồn tại để tạo lại
try {
  db.dropUser(appUser);
  print(`🗑️ Dropped existing user '${appUser}'`);
} catch (e) {
  print(`ℹ️ User '${appUser}' does not exist yet`);
}

// Tạo user mới
print(`➕ Creating new user '${appUser}'...`);
const result = db.createUser({
  user: appUser,
  pwd: appPass,
  roles: [{ role: "readWrite", db: dbName }],
});

print(`✅ User '${appUser}' created successfully!`);
print(`🔍 Verifying user creation...`);

// Verify user được tạo
const users = db.getUsers();
print(
  `📋 Users in database '${dbName}': ${JSON.stringify(
    users.users.map((u) => u.user)
  )}`
);

// Tạo một collection mẫu để đảm bảo database được khởi tạo
db.todos.insertOne({
  _id: ObjectId(),
  title: "Welcome to TodoList App",
  completed: false,
  createdAt: new Date(),
});

print(`🗂️  Database '${dbName}' initialized with sample data.`);
print("🎉 MongoDB initialization completed successfully!");
