import express from "express";
import { adminAuth, userAuth } from "./middlewares/auth.js";

const app = express();

app.use("/admin", adminAuth);

// app.use("/user", userAuth);

app.get("/user", userAuth, (req, res) => {
  res.send("User Data is sent.");
});

app.get("/admin/getAllData", (req, res) => {
  res.send("All Data sent");
});

app.get("/admin/deleteUser", (req, res) => {
  res.send("Deleted a User");
});

app.listen(3000, () => {
  console.log("Server is running on 3000");
});
