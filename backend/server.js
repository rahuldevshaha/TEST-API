require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const productRoutes = require("./routes/productRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ success: true, status: "ok" }));
app.use("/api/products", productRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (!process.env.MOCKAPI_BASE_URL) {
  console.warn(
    "[Startup] MOCKAPI_BASE_URL is not Set!"
  );
}

app.listen(PORT, () => console.log(`[Server] listening on port ${PORT}`));
