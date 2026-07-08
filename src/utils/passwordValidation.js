import * as yup from 'yup';

export const buildPasswordSchema = (authSettings) => {
  let schema = yup.string().required('Password is required');
  
  if (!authSettings) {
    // Default fallback
    const defaultRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])/;
    return schema
      .min(8, 'Password must be at least 8 characters')
      .matches(defaultRegex, 'Please meet all password requirements');
  }

  schema = schema.min(authSettings.minPasswordLength, `Password must be at least ${authSettings.minPasswordLength} characters`);

  if (authSettings.requireUppercase) {
    schema = schema.matches(/[A-Z]/, 'Password must contain at least one uppercase letter');
  }
  if (authSettings.requireLowercase) {
    schema = schema.matches(/[a-z]/, 'Password must contain at least one lowercase letter');
  }
  if (authSettings.requireNumbers) {
    schema = schema.matches(/\d/, 'Password must contain at least one number');
  }
  if (authSettings.requireSpecial) {
    schema = schema.matches(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');
  }

  return schema;
};

export const getPasswordRequirementsList = (authSettings, passwordValue = '') => {
  if (!authSettings) {
    return [
      { label: 'At least 8 characters', met: passwordValue.length >= 8 },
      { label: 'One uppercase letter', met: /[A-Z]/.test(passwordValue) },
      { label: 'One lowercase letter', met: /[a-z]/.test(passwordValue) },
      { label: 'One number', met: /\d/.test(passwordValue) },
      { label: 'One special character', met: /[^a-zA-Z0-9]/.test(passwordValue) },
    ];
  }

  const reqs = [];
  reqs.push({ label: `At least ${authSettings.minPasswordLength} characters`, met: passwordValue.length >= authSettings.minPasswordLength });
  
  if (authSettings.requireUppercase) {
    reqs.push({ label: 'One uppercase letter', met: /[A-Z]/.test(passwordValue) });
  }
  if (authSettings.requireLowercase) {
    reqs.push({ label: 'One lowercase letter', met: /[a-z]/.test(passwordValue) });
  }
  if (authSettings.requireNumbers) {
    reqs.push({ label: 'One number', met: /\d/.test(passwordValue) });
  }
  if (authSettings.requireSpecial) {
    reqs.push({ label: 'One special character', met: /[^a-zA-Z0-9]/.test(passwordValue) });
  }

  return reqs;
};
