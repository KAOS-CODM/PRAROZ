const dns = require("dns");
const mongoose = require("mongoose");

const uri = process.env.MONGODB_URI;
let mongoConnected = false;

if (!uri) {
  throw new Error("MONGODB_URI environment variable is required");
}

const dnsServers = process.env.MONGODB_DNS_SERVERS
  ? process.env.MONGODB_DNS_SERVERS.split(",").map(s => s.trim()).filter(Boolean)
  : ["8.8.8.8", "0.0.0.0"];

dns.setServers(dnsServers);

console.log("Using DNS servers for MongoDB SRV resolution:", dns.getServers());

mongoose.set("strictQuery", false);

async function connectDB() {
  try {
    await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });

    mongoConnected = true;    
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    mongoConnected = false;

    console.warn("MonogDB unavailable.");
    console.warn("Running in JSON fallback mode.");
  }  
}

function isMongoConnected() {
    return mongoConnected && mongoose.connection.readyState === 1;
}

module.exports = {
  mongoose,
  connectDB,
  isMongoConnected,
};

/*const dns = require('dns');
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI environment variable is required');
}

const dnsServers = process.env.MONGODB_DNS_SERVERS
  ? process.env.MONGODB_DNS_SERVERS.split(',').map((server) => server.trim()).filter(Boolean)
  : ['8.8.8.8', '1.1.1.1'];

dns.setServers(dnsServers);
console.log('Using DNS servers for MongoDB SRV resolution:', dns.getServers());

mongoose.set('strictQuery', false);

mongoose
  .connect(uri, {
    autoIndex: true,
  })
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = mongoose;*/
