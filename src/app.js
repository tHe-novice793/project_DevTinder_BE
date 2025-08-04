import express from "express";

const app = express();

app.use("/test", (req, res) => {
  res.send("Hello from the testing server.");
});

app.use("/hello", (req, res) => {
  res.send("Hello from the hello page.");
});

app.use("/", (req, res) => {
  res.send("Hello from the home page.");
});

app.listen(3000, () => {
  console.log("Server is running on 3000");
});
