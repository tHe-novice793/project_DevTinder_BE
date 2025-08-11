import express from "express";
import { userAuth } from "../middlewares/auth.js";

const profileRouter = express.Router();

profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("User does not exist");
    }
    res.send("User is : " + user);
  } catch (err) {
    res.status(400).send("Error occured " + err.message);
  }
});

export { profileRouter };
