const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Site = require("./models/Site");

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const allSites = await Site.find({});
  console.log("All sites in DB:", allSites.length);
  allSites.forEach(s => {
    console.log(`- ID: ${s._id}, Name: "${s.name}", Status: "${s.status}", Progress: ${s.progress}`);
  });

  const activeSites = allSites.filter(s => s.status === "Active" || !s.status);
  console.log("Active Sites Count (strict status === 'Active'):", activeSites.length);
  
  const completedSites = allSites.filter(s => s.status === "Completed");
  console.log("Completed Sites Count:", completedSites.length);

  const deletedSites = allSites.filter(s => s.status === "Deleted");
  console.log("Deleted Sites Count:", deletedSites.length);

  await mongoose.disconnect();
}

check();
