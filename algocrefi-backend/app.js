const express = require("express");
const cors = require("cors");

const poolRoutes = require("./src/routes/poolRoutes");
const authRoutes = require("./src/routes/authRoutes");
const loanRoutes = require("./src/routes/loanRoutes");
const internalRoutes = require("./src/routes/internalRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ message: 'test ok' });
});

function safeStringify(obj) {
  console.log('safeStringify called');
  if (obj && typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'bigint') {
        result[key] = value.toString();
      } else if (value && typeof value === 'object') {
        result[key] = safeStringify(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }
  return obj;
}

app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = function(body) {
    console.log('res.json called');
    try {
      const serialized = safeStringify(body);
      return originalJson.call(this, serialized);
    } catch (e) {
      console.error('JSON serialization error:', e);
      return originalJson.call(this, { success: false, error: e.message });
    }
  };
  next();
});

app.use("/api/pool", poolRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/loan", loanRoutes);
app.use("/api/internal", internalRoutes);

module.exports = app;
