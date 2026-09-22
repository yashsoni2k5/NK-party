const express = require("express");
require("dotenv").config();
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const errorMiddleware = require("./middlewares/ErrorMiddleware");
const connectToDatabase = require("./config/db");
const Routes = require("./routes");
const cloudinary = require("cloudinary").v2;
const Multer = require("multer");
const HttpException = require("./exceptions/HttpException");

const storage = new Multer.memoryStorage();
const upload = Multer({
  storage,
});

const port = process.env.PORT || process.env.port || 5000;
const hosts = process.env.hosts;

const app = express();

connectToDatabase();

const frontendOrigin = process.env.FRONTEND_URL || process.env.hosts || "*";

app.use(
  cors({
    origin: frontendOrigin === "*" ? "*" : frontendOrigin.split(","),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Removed obsolete Cloudinary config and /upload route

Routes.map(({ path, router }) => app.use(path, router));

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`running at port ${port}`);
});
