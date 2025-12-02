document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form.php-email-form');
  if (!form) return;

  // Real-time validation setup
  const nameField = document.getElementById('name');
  const surnameField = document.getElementById('surname');
  const emailField = document.getElementById('email');
  const phoneField = document.getElementById('phone');
  const addressField = document.getElementById('address');

  // Validation functions
  function validateName(value) {
    // Check if not empty and contains only letters (including spaces, hyphens, and apostrophes for compound names)
    return value.trim() !== '' && /^[A-Za-z\s'-]+$/.test(value.trim());
  }

  function validateSurname(value) {
    // Check if not empty and contains only letters (including spaces, hyphens, and apostrophes for compound names)
    return value.trim() !== '' && /^[A-Za-z\s'-]+$/.test(value.trim());
  }

  function validateEmail(value) {
    // Check if not empty and matches email format
    return value.trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function validatePhone(value) {
    // Check if not empty
    return value.trim() !== '';
  }

  function validateAddress(value) {
    // Check if not empty and has at least 5 characters (meaningful text)
    return value.trim() !== '' && value.trim().length >= 5;
  }

  // Real-time validation on input
  function setupFieldValidation(field, validationFunc) {
    if (!field) return;

    field.addEventListener('input', () => {
      const isValid = validationFunc(field.value);
      if (isValid) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
      } else {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
      }
    });

    // Also validate on blur
    field.addEventListener('blur', () => {
      const isValid = validationFunc(field.value);
      if (isValid) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
      } else {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
      }
    });
  }

  // Setup validation for all fields (except ratings)
  setupFieldValidation(nameField, validateName);
  setupFieldValidation(surnameField, validateSurname);
  setupFieldValidation(emailField, validateEmail);
  setupFieldValidation(phoneField, validatePhone);
  setupFieldValidation(addressField, validateAddress);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate all fields before submission
    const isNameValid = validateName(nameField.value);
    const isSurnameValid = validateSurname(surnameField.value);
    const isEmailValid = validateEmail(emailField.value);
    const isPhoneValid = validatePhone(phoneField.value);
    const isAddressValid = validateAddress(addressField.value);

    // Update validation states
    nameField.classList.toggle('is-invalid', !isNameValid);
    nameField.classList.toggle('is-valid', isNameValid);
    surnameField.classList.toggle('is-invalid', !isSurnameValid);
    surnameField.classList.toggle('is-valid', isSurnameValid);
    emailField.classList.toggle('is-invalid', !isEmailValid);
    emailField.classList.toggle('is-valid', isEmailValid);
    phoneField.classList.toggle('is-invalid', !isPhoneValid);
    phoneField.classList.toggle('is-valid', isPhoneValid);
    addressField.classList.toggle('is-invalid', !isAddressValid);
    addressField.classList.toggle('is-valid', isAddressValid);

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
