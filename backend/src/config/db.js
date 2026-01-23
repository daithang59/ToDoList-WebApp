import mongoose from "mongoose";
import process from "process";

export async function connectDB(uri) {
  try {
    console.log(`🔗 Attempting to connect to MongoDB...`);
    
    // Kiểm tra môi trường
    const isAtlas = uri.includes('mongodb+srv://') || uri.includes('.mongodb.net');
    const isLocal = uri.includes('localhost') || uri.includes('mongo:27017');
    
    if (isAtlas) {
      console.log(`📍 Connecting to MongoDB Atlas (Production)`);
    } else if (isLocal) {
      console.log(`📍 URI: ${uri?.replace(/\/\/.*:.*@/, '//***:***@')}`);
    }
    
    // Cấu hình connection options dựa trên môi trường
    const options = {
      dbName: "todolist",
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    };
    
    // Chỉ thêm authSource cho MongoDB local (không dùng cho Atlas)
    if (isLocal && !isAtlas) {
      options.authSource = "todolist";
    }
    
    await mongoose.connect(uri, options);
    
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:");
    console.error(`   Message: ${err.message}`);
    console.error(`   Code: ${err.code}`);
    console.error(`   Full error:`, err);
    process.exit(1);
  }
}
