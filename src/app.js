import express from "express";

const app = express();

app.get("/user", (req, res) => {
  res.send("User information is shown.");
});

app.post("/user", (req, res) => {
  res.send("Data successfully saved in the database.");
});

app.delete("/user", (req, res) => {
  res.send("Data successfully deleted from the database.");
});

app.use("/test", (req, res) => {
  res.send("Hello from the testing server.");
});

app.listen(3000, () => {
  console.log("Server is running on 3000");
});
