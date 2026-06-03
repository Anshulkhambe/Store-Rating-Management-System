const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const validatePassword = (password) => {
  if (!password || password.length < 8 || password.length > 16) return false;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return hasUppercase && hasSpecial;
};

function validateUserFields(req, res, next) {
  const { name, email, password, address, role } = req.body;
  const errors = {};

  if (name === undefined || name.trim() === '') {
    errors.name = 'Name is required';
  } else if (name.length < 20 || name.length > 60) {
    errors.name = 'Name must be between 20 and 60 characters';
  }

  if (email === undefined || email.trim() === '') {
    errors.email = 'Email is required';
  } else if (!validateEmail(email)) {
    errors.email = 'Please provide a valid email address';
  }

  if (password === undefined || password.trim() === '') {
    errors.password = 'Password is required';
  } else if (!validatePassword(password)) {
    errors.password = 'Password must be 8-16 characters, containing at least one uppercase letter and one special character';
  }

  if (address === undefined || address.trim() === '') {
    errors.address = 'Address is required';
  } else if (address.length > 400) {
    errors.address = 'Address cannot exceed 400 characters';
  }

  if (role && !['admin', 'user', 'store_owner'].includes(role)) {
    errors.role = 'Invalid user role';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
}

function validatePasswordChange(req, res, next) {
  const { password } = req.body;
  if (!password || !validatePassword(password)) {
    return res.status(400).json({
      error: 'Password must be 8-16 characters, containing at least one uppercase letter and one special character'
    });
  }
  next();
}

module.exports = {
  validateUserFields,
  validatePasswordChange,
};
