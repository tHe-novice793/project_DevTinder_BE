import express from "express";
import { userAuth } from "../middlewares/auth.js";

const requestRouter = express.Router();

requestRouter.post("/sendConnectionRequest", userAuth, async (req, res) => {
  const user = req.user;
  console.log("Sending a connection request");
  res.send(user.firstName + ` sent a connection request!!`);
});

export { requestRouter };
