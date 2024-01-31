const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const path = require("path");
require("./config/database");

const userRoute = require("./routes/user");
const expenseRoute = require("./routes/expense");
const orderRoute = require("./routes/order");

const cors = require("cors");

const app = express();

app.use(express.json());

app.use(
  cors({
    // origin: "http://127.0.0.1:5500",
    // methods: ["GET", "POST", "DELETE", "PUT"],
    origin: "http://localhost:8000",
    credentials: true,
  })
);

app.use("/user", userRoute);
app.use("/expense", expenseRoute);
app.use("/order", orderRoute);

app.use((req, res) => {
  res.sendFile(path.join(__dirname, `public/${req.url}`));
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is listening on  port ${PORT}`);
});
