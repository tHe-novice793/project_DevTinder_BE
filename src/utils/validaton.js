import validator from "validator";
import { UserModel } from "../models/user.js";

// Utility function to sanitize inputs
const sanitizeInput = (input, toLowercase = false) => {
  if (typeof input !== "string") return input;
  let sanitized = input.trim();
  return toLowercase ? sanitized.toLowerCase() : sanitized;
};

// Normalize email specifically to trim and convert to lowercase
const normalizeEmail = (email) => {
  return sanitizeInput(email, true);
};

const validateSignupData = (req) => {
  let { firstName, lastName, emailId, password } = req.body;

  // Sanitize inputs
  firstName = sanitizeInput(firstName);
  lastName = sanitizeInput(lastName);
  emailId = normalizeEmail(emailId);
  password = sanitizeInput(password);

  // Reassign sanitized values to req.body
  req.body.firstName = firstName;
  req.body.lastName = lastName;
  req.body.emailId = emailId;
  req.body.password = password;

  // Validate sanitized inputs
  if (!firstName || !lastName) {
    throw new Error("Name should not be empty!!");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email address is not valid.");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong.");
  }
};

const validateLoginData = (req) => {
  // Sanitize and normalize inputs
  const emailId = normalizeEmail(req.body.emailId);
  const password = sanitizeInput(req.body.password);

  // Reassign sanitized values to req.body
  req.body.emailId = emailId;
  req.body.password = password;

  // Validate sanitized inputs
  if (!emailId || !password) {
    throw new Error("Email address or password should not be empty!");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Enter a valid email address.");
  }
};

const validateProfileEditData = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "about",
    "age",
    "gender",
    "skills",
    "photoUrl",
  ];

  // Initialize the validation result
  const invalidFields = Object.keys(req.body).filter(
    (field) => !allowedEditFields.includes(field)
  );

  // Check if there are any disallowed fields
  if (invalidFields.length > 0) {
    return {
      isValid: false,
      invalidFields,
    };
  }

  // Validate 'skills' - it should be an array of strings and not more than 10 items
  if (req.body.skills && !Array.isArray(req.body.skills)) {
    throw new Error("Skills should be an array of strings.");
  }
  if (req.body.skills && req.body.skills.length > 10) {
    throw new Error("Skills should be less than or equal to 10.");
  }

  // Validate 'photoUrl' - it should be a valid URL if provided
  if (req.body.photoUrl && !validator.isURL(req.body.photoUrl)) {
    throw new Error("Photo URL is not valid.");
  }

  // Validate 'age' - it should be a number greater than 0 if provided
  if (req.body.age) {
    const age = Number(req.body.age);
    if (isNaN(age) || age <= 0) {
      throw new Error("Enter a valid age.");
    }
  }

  if (
    req.body.gender &&
    !["male", "female", "others"].includes(req.body.gender)
  ) {
    throw new Error("Gender must be one of 'male', 'female', or 'others'.");
  }

  // Return validation result
  return {
    isValid: true,
    invalidFields: [],
  };
};

const validateEditPasswordData = async (req) => {
  if (!req.body.emailId || !req.body.password) {
    throw new Error("Both emailId and password are required.");
  }

  const emailId = normalizeEmail(req.body.emailId);
  const password = sanitizeInput(req.body.password);

  const user = await UserModel.findOne({ emailId: emailId });
  if (!user) {
    throw new Error("Invalid user credentials");
  }

  const isPasswordStrong = validator.isStrongPassword(password, {
    minLength: 8, // Minimum password length
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });

  if (!isPasswordStrong) {
    throw new Error(
      "Password is not strong enough. It must contain at least one uppercase letter, one number, and one symbol."
    );
  }

  // If everything passes, return the sanitized data (or anything else you want to return)
  return {
    emailId,
    password,
  };
};

const validateSendConnectionRequest = async (req) => {
  const { toUserId, status } = req.params;

  // Validate the toUserId is a valid MongoDB ObjectId
  if (!validator.isMongoId(toUserId)) {
    throw new Error("Invalid User ID format.");
  }

  const validStatuses = ["ignored", "interested"];
  if (!validStatuses.includes(status)) {
    throw new Error(
      `Invalid connection request status. Must be one of: ${validStatuses.join(
        ", "
      )}`
    );
  }

  return { toUserId, status };
};

const validateReviewConnectionRequest = async (req) => {
  const { requestId, status } = req.params;

  if (!validator.isMongoId(requestId)) {
    throw new Error("Invalid request ID format.");
  }

  const validStatuses = ["accepted", "rejected"];
  if (!validStatuses.includes(status)) {
    throw new Error(
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`
    );
  }

  return { requestId, status };
};

export {
  validateSignupData,
  validateLoginData,
  validateProfileEditData,
  validateEditPasswordData,
  validateSendConnectionRequest,
  validateReviewConnectionRequest,
};
