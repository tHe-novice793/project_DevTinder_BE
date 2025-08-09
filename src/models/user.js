import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 50,
      trim: true,
      match: [
        /^[A-Za-z\s]+$/,
        "First name must contain only letters and spaces.",
      ],
    },
    lastName: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 50,
      trim: true,
      match: [
        /^[A-Za-z\s]+$/,
        "First name must contain only letters and spaces.",
      ],
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email Id");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
      validate: {
        validator: function (v) {
          if (!validator.isStrongPassword(v)) {
            throw new Error(
              "Password is not strong. Please enter a strong password"
            );
          }
        },
      },
    },
    age: {
      type: Number,
      min: 18,
      validate: {
        validator: function (v) {
          return !isNaN(v) && v > 0;
        },
        message: "Age must be a valid, positive number.",
      },
    },
    gender: {
      type: String,
      validate: {
        validator: function (value) {
          return ["male", "female", "others"].includes(value);
        },
        message: "Gender must be either 'male', 'female', or 'others'.",
      },
    },
    photoUrl: {
      type: String,
      validate: {
        validator: function (v) {
          if (!validator.isURL(v)) {
            throw new Error("Invalid Photo URL: " + v);
          }
        },
      },
    },
    about: {
      type: String,
      default: "This is a default about of the user!",
    },
    skills: {
      type: [String],
      validate: {
        validator: function (arr) {
          return (
            arr.length <= 10 && arr.every((skill) => typeof skill === "string")
          );
        },
        message:
          "You can specify up to 10 skills only, and each skill must be a valid string.",
      },
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("User", userSchema);

export { UserModel };
