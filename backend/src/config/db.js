import mongoose from "mongoose";
import process from "process";

export async function connectDB(uri) {
  try {
    console.log(`🔗 Attempting to connect to MongoDB...`);
    console.log(`📍 URI: ${uri?.replace(/\/\/.*:.*@/, '//***:***@')}`); // Ẩn password trong log
    
    await mongoose.connect(uri, { 
      dbName: "todolist",
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      authSource: "todolist" // Chỉ định database để xác thực
    });
    
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:");
    console.error(`   Message: ${err.message}`);
    console.error(`   Code: ${err.code}`);
    console.error(`   Full error:`, err);
    process.exit(1);
  }
}
