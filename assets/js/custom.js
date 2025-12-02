document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form.php-email-form');
  if (!form) return;

  // Real-time validation setup
  const nameField = document.getElementById('name');
  const surnameField = document.getElementById('surname');
  const emailField = document.getElementById('email');
  const phoneField = document.getElementById('phone');
  const addressField = document.getElementById('address');

  // Check if all required fields exist before setting up validation
  if (!nameField || !surnameField || !emailField || !phoneField || !addressField) {
    console.warn('One or more form fields not found. Validation will not be set up.');
    return;
  }

  // Validation functions
  function validateNameField(value) {
    const trimmedValue = value.trim();
    // Check if not empty and contains only letters (must start with a letter, then can include spaces, hyphens, and apostrophes)
    return trimmedValue !== '' && /^[A-Za-z]+[A-Za-z\s'-]*$/.test(trimmedValue);
  }

  function validateEmail(value) {
    const trimmedValue = value.trim();
    // Check if not empty and matches email format
    // More comprehensive email regex that handles most common cases
    return trimmedValue !== '' && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmedValue);
  }

  function validatePhone(value) {
    const trimmedValue = value.trim();
    // Check if not empty and contains at least some digits (allows various phone formats with spaces, dashes, parentheses)
    return trimmedValue !== '' && /\d/.test(trimmedValue);
  }

  function validateAddress(value) {
    const trimmedValue = value.trim();
    // Check if not empty, has at least 5 characters, and contains at least one alphanumeric character
    return trimmedValue !== '' && trimmedValue.length >= 5 && /[a-zA-Z0-9]/.test(trimmedValue);
  }

  // Helper function to apply validation state to a field
  function applyValidationState(field, isValid) {
    if (isValid) {
      field.classList.remove('is-invalid');
      field.classList.add('is-valid');
    } else {
      field.classList.remove('is-valid');
      field.classList.add('is-invalid');
    }
  }

  // Real-time validation on input
  function setupFieldValidation(field, validationFunc) {
    if (!field) return;

    const validateField = () => {
      const isValid = validationFunc(field.value);
      applyValidationState(field, isValid);
    };

    // Validate on input and blur events
    field.addEventListener('input', validateField);
    field.addEventListener('blur', validateField);
  }

  // Setup validation for all fields (except ratings)
  setupFieldValidation(nameField, validateNameField);
  setupFieldValidation(surnameField, validateNameField);
  setupFieldValidation(emailField, validateEmail);
  setupFieldValidation(phoneField, validatePhone);
  setupFieldValidation(addressField, validateAddress);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate all fields before submission
    const isNameValid = validateNameField(nameField.value);
    const isSurnameValid = validateNameField(surnameField.value);
    const isEmailValid = validateEmail(emailField.value);
    const isPhoneValid = validatePhone(phoneField.value);
    const isAddressValid = validateAddress(addressField.value);

    // Update validation states using helper function
    applyValidationState(nameField, isNameValid);
    applyValidationState(surnameField, isSurnameValid);
    applyValidationState(emailField, isEmailValid);
    applyValidationState(phoneField, isPhoneValid);
    applyValidationState(addressField, isAddressValid);

    // Only proceed if all validations pass
    if (!isNameValid || !isSurnameValid || !isEmailValid || !isPhoneValid || !isAddressValid) {
      return;
    }

    // collect values
    const fd = new FormData(form);
    const data = {};
    for (const [key, value] of fd.entries()) {
      data[key] = value;
    }

    let output = document.getElementById('form-output');

    // clear previous content and render lines
    output.innerHTML = '';
    Object.entries(data).forEach(([k, v]) => {
      const line = document.createElement('div');
      text = `${niceLabel(k)}: ${Array.isArray(v) ? v.join(', ') : v}`;
      line.textContent = text;
      console.log(text);
      output.appendChild(line);
    });

    // print average rating
    let average_rating = calculateAverageRating(data);
    const line = document.createElement('div');
    line.textContent = `${data.name} ${data.surname}: `;
    const span = document.createElement('span');
    span.textContent = `${average_rating}`;
    let color = average_rating > 6 ? 'green' : average_rating > 3 ? 'orange' : 'red';
    span.style.color = color;
    output.appendChild(line);
    line.appendChild(span);
  });

  function calculateAverageRating(data) {
    const ratingKeys = Object.keys(data).filter(key => key.startsWith('rating'));
    const ratings = ratingKeys.map(key => parseFloat(data[key]));
    const sum = ratings.reduce((a, b) => a + b, 0);
    return sum / ratings.length;
  }

  function niceLabel(name) {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }
});
