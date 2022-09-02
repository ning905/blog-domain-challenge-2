const express = require("express");
const app = express();

const cors = require("cors");
const morgan = require("morgan");

app.disable("x-powered-by");

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userRouter = require("./routers/user");
app.use("/users", userRouter);

const postRouter = require("./routers/post");
app.use("/posts", postRouter);

const categoryRouter = require("./routers/category");
app.use("/categories", categoryRouter);

module.exports = app;
