import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import dotenv from "dotenv";
import dns from "dns";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import userRoutes from "./routes/userRoutes.js";
import assetRoutes from "./routes/assetRoutes.js";
import issueRoutes from "./routes/issueRoutes.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);
dotenv.config();

// Connect to DB first
connectDB().then(async () => {
  // Seed default users
  try {
    console.log("Checking for default users...");

    // Delete any existing default users to reset passwords
    await User.deleteOne({ email: "admin@maintainiq.com" });
    await User.deleteOne({ email: "tech@maintainiq.com" });

    // Recreate admin user
    const adminHash = await bcrypt.hash("Admin123!", 10);
    await User.create({
      name: "Admin User",
      email: "admin@maintainiq.com",
      password: adminHash,
      role: "Admin",
    });
    console.log(
      "✅ Default admin user reset: admin@maintainiq.com / Admin123!",
    );

    // Recreate technician user
    const techHash = await bcrypt.hash("Tech123!", 10);
    await User.create({
      name: "Technician User",
      email: "tech@maintainiq.com",
      password: techHash,
      role: "Technician",
    });
    console.log(
      "✅ Default technician user reset: tech@maintainiq.com / Tech123!",
    );
  } catch (err) {
    console.error("❌ Error seeding default users:", err);
  }
});

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/issues", issueRoutes);

app.get("/", (req, res) => res.send("Backend Boilerplate Active"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
