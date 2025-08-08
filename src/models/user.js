import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 50,
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
      match: [/.+@.+\..+/, "Please enter a valid email address."],
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    age: {
      type: Number,
      min: 18,
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
          return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/.test(v);
        },
        message: "Photo URL must be a valid image URL.",
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
          return arr.length <= 10;
        },
        message: "You can specify up to 10 skills only.",
      },
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("User", userSchema);

export { UserModel };
