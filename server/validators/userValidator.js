/**
 * Validation rules and middleware for User Authentication and Profile Management
 */

// RFC 5322 compliant email regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// E.164 and international phone number pattern
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;

/**
 * Validates registration payload
 */
export const validateRegisterInput = (data = {}) => {
  const errors = [];
  const { name, email, password, phone, role } = data;

  // Name validation
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name is required.' });
  } else if (name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters long.' });
  } else if (name.trim().length > 70) {
    errors.push({ field: 'name', message: 'Name cannot exceed 70 characters.' });
  }

  // Email validation
  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    errors.push({ field: 'email', message: 'Email address is required.' });
  } else if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
    errors.push({ field: 'email', message: 'Please provide a valid email address.' });
  }

  // Password validation
  if (!password || typeof password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required.' });
  } else if (password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters long.' });
  }

  // Phone validation (Optional)
  if (phone && typeof phone === 'string' && phone.trim().length > 0) {
    if (!PHONE_REGEX.test(phone.trim())) {
      errors.push({ field: 'phone', message: 'Please provide a valid contact phone number.' });
    }
  }

  // Role validation (Optional)
  if (role && !['user', 'admin'].includes(role)) {
    errors.push({ field: 'role', message: 'Role must be either "user" or "admin".' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates login payload
 */
export const validateLoginInput = (data = {}) => {
  const errors = [];
  const { email, password } = data;

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    errors.push({ field: 'email', message: 'Email address is required.' });
  } else if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
    errors.push({ field: 'email', message: 'Please provide a valid email address format.' });
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push({ field: 'password', message: 'Password is required.' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates profile update payload
 */
export const validateProfileUpdateInput = (data = {}) => {
  const errors = [];
  const { name, phone, address } = data;

  if (name !== undefined) {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Name cannot be empty.' });
    } else if (name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Name must be at least 2 characters long.' });
    }
  }

  if (phone !== undefined && phone !== null && String(phone).trim().length > 0) {
    if (!PHONE_REGEX.test(String(phone).trim())) {
      errors.push({ field: 'phone', message: 'Please provide a valid phone number.' });
    }
  }

  if (address !== undefined && address !== null && typeof address === 'string') {
    if (address.length > 500) {
      errors.push({ field: 'address', message: 'Address cannot exceed 500 characters.' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates password change payload
 */
export const validatePasswordChangeInput = (data = {}) => {
  const errors = [];
  const { currentPassword, newPassword } = data;

  if (!currentPassword || typeof currentPassword !== 'string') {
    errors.push({ field: 'currentPassword', message: 'Current password is required.' });
  }

  if (!newPassword || typeof newPassword !== 'string') {
    errors.push({ field: 'newPassword', message: 'New password is required.' });
  } else if (newPassword.length < 6) {
    errors.push({ field: 'newPassword', message: 'New password must be at least 6 characters long.' });
  } else if (currentPassword && currentPassword === newPassword) {
    errors.push({ field: 'newPassword', message: 'New password must be different from current password.' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// ==========================================
// Express Middleware Wrappers
// ==========================================

export const validateRegister = (req, res, next) => {
  const { isValid, errors } = validateRegisterInput(req.body);
  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: errors[0].message,
      errors
    });
  }
  // Sanitize body
  req.body.name = req.body.name.trim();
  req.body.email = req.body.email.trim().toLowerCase();
  next();
};

export const validateLogin = (req, res, next) => {
  const { isValid, errors } = validateLoginInput(req.body);
  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: errors[0].message,
      errors
    });
  }
  req.body.email = req.body.email.trim().toLowerCase();
  next();
};

export const validateProfileUpdate = (req, res, next) => {
  const { isValid, errors } = validateProfileUpdateInput(req.body);
  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: errors[0].message,
      errors
    });
  }
  if (req.body.name) req.body.name = req.body.name.trim();
  if (req.body.phone) req.body.phone = req.body.phone.trim();
  next();
};

export const validatePasswordChange = (req, res, next) => {
  const { isValid, errors } = validatePasswordChangeInput(req.body);
  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: errors[0].message,
      errors
    });
  }
  next();
};

export const validateAddressInput = (data = {}) => {
  const errors = [];
  const { name, phone, addressLine1, city, postalCode } = data;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Recipient name is required (at least 2 characters).' });
  }

  if (!phone || typeof phone !== 'string' || !PHONE_REGEX.test(phone.trim())) {
    errors.push({ field: 'phone', message: 'Valid contact phone number is required.' });
  }

  if (!addressLine1 || typeof addressLine1 !== 'string' || addressLine1.trim().length < 4) {
    errors.push({ field: 'addressLine1', message: 'Address Line 1 is required.' });
  }

  if (!city || typeof city !== 'string' || city.trim().length === 0) {
    errors.push({ field: 'city', message: 'City is required.' });
  }

  if (!postalCode || typeof postalCode !== 'string' || postalCode.trim().length < 4) {
    errors.push({ field: 'postalCode', message: 'Valid postal code is required.' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateAddress = (req, res, next) => {
  const { isValid, errors } = validateAddressInput(req.body);
  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: errors[0].message,
      errors
    });
  }
  next();
};

export const validateOrderActionInput = (data = {}) => {
  const errors = [];
  const { reason } = data;

  if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
    errors.push({ field: 'reason', message: 'Please provide a valid reason (at least 5 characters).' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateOrderAction = (req, res, next) => {
  const { isValid, errors } = validateOrderActionInput(req.body);
  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: errors[0].message,
      errors
    });
  }
  next();
};

export default {
  validateRegisterInput,
  validateLoginInput,
  validateProfileUpdateInput,
  validatePasswordChangeInput,
  validateAddressInput,
  validateOrderActionInput,
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validateAddress,
  validateOrderAction
};
