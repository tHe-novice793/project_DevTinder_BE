import validator from "validator";

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

export { validateSignupData, validateLoginData };
