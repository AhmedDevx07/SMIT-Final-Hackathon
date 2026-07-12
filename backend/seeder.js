const dotenv = require("dotenv");
const connectDB = require("./config/db");
const User = require("./models/User");
const Asset = require("./models/Asset");
const Issue = require("./models/Issue");
const generateAssetCode = require("./utils/generateAssetCode");
const generateQRCode = require("./utils/qrGenerator");
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dotenv.config();
connectDB();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const seedData = async () => {
  try {
    await User.deleteMany();
    await Asset.deleteMany();
    await Issue.deleteMany();

    const admin = await User.create({
      name: "Ahmed Admin",
      email: "admin@maintainiq.com",
      password: "Admin123!",
      role: "admin",
    });

    const techniciansData = [
      { name: "Ali Technician", email: "Ali@equipSense.com" },
      { name: "Sarah Tech", email: "sarah@equipSense.com" },
      { name: "John Mechanic", email: "john@equipSense.com" },
      { name: "Maria Support", email: "maria@equipSense.com" },
    ];

    const createdTechnicians = [];
    for (const tech of techniciansData) {
      createdTechnicians.push(
        await User.create({
          ...tech,
          password: "tech123",
          role: "technician",
        }),
      );
    }

    const assetsData = [
      {
        name: "Classroom Projector 01",
        category: "Electronics",
        location: "Block A - Room 101",
        condition: "Good",
        status: "Operational",
      },
      {
        name: "AC Unit - Lecture Hall",
        category: "HVAC",
        location: "Block B - Hall 3",
        condition: "Fair",
        status: "Under Maintenance",
      },
      {
        name: "Water Cooler",
        category: "Plumbing",
        location: "Ground Floor Lobby",
        condition: "Good",
        status: "Operational",
      },
      {
        name: "Backup Generator",
        category: "Electrical",
        location: "Basement",
        condition: "Excellent",
        status: "Operational",
      },
      {
        name: "Lab Computer 12",
        category: "IT",
        location: "Computer Lab 2",
        condition: "Poor",
        status: "Issue Reported",
      },
      {
        name: "Main Elevator",
        category: "Mechanical",
        location: "Block A",
        condition: "Fair",
        status: "Under Inspection",
      },
      {
        name: "Fire Extinguisher 5",
        category: "Safety",
        location: "Block C Corridor",
        condition: "Good",
        status: "Operational",
      },
      {
        name: "Conference Table",
        category: "Furniture",
        location: "Board Room",
        condition: "Good",
        status: "Operational",
      },
      {
        name: "Server Rack A",
        category: "IT",
        location: "Server Room",
        condition: "Excellent",
        status: "Operational",
      },
      {
        name: "Cafeteria Fridge",
        category: "Appliance",
        location: "Cafeteria",
        condition: "Poor",
        status: "Retired",
      },
    ];

    const createdAssets = [];
    for (const data of assetsData) {
      const assetCode = await generateAssetCode();
      const publicUrl = `${CLIENT_URL}/asset/${assetCode}`;
      const qrCodeUrl = await generateQRCode(publicUrl);
      createdAssets.push(
        await Asset.create({
          ...data,
          assetCode,
          publicUrl,
          qrCodeUrl,
          assignedTechnician:
            createdTechnicians[
              Math.floor(Math.random() * createdTechnicians.length)
            ]._id,
        }),
      );
    }

    const issuesData = [
      {
        title: "Projector bulb burned out",
        description: "Screen is completely dark, needs replacement.",
        priority: "Medium",
        status: "Reported",
        asset: createdAssets[0]._id,
      },
      {
        title: "AC not cooling properly",
        description: "Blowing warm air during afternoons.",
        priority: "High",
        status: "Maintenance In Progress",
        asset: createdAssets[1]._id,
      },
      {
        title: "Water leakage",
        description: "Cooler is leaking water on the floor.",
        priority: "Medium",
        status: "Assigned",
        asset: createdAssets[2]._id,
      },
      {
        title: "Blue screen on boot",
        description: "Windows fails to load.",
        priority: "Critical",
        status: "Reported",
        asset: createdAssets[4]._id,
      },
      {
        title: "Elevator buttons stuck",
        description: "Floor 3 button does not work.",
        priority: "High",
        status: "Inspection Started",
        asset: createdAssets[5]._id,
      },
      {
        title: "Fridge making loud noise",
        description: "Compressor sounds like it is failing.",
        priority: "Low",
        status: "Closed",
        asset: createdAssets[9]._id,
      },
    ];

    for (let i = 0; i < issuesData.length; i++) {
      await Issue.create({
        ...issuesData[i],
        issueNumber: `ISSUE-${1000 + i}`,
        reporterName: "John Doe",
        assignedTechnician:
          i % 2 === 0
            ? null
            : createdTechnicians[
                Math.floor(Math.random() * createdTechnicians.length)
              ]._id,
      });
    }

    console.log("✅ Seed data created successfully");
    console.log("-----------------------------------");
    console.log("Admin login:      admin@maintainiq.com / Admin123!");
    console.log("Technician login: tech@equipSense.com / tech123");
    console.log("(And 3 other technicians with tech123)");
    console.log("-----------------------------------");
    process.exit();
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seedData();
