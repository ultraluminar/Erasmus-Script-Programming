document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form.php-email-form');
  if (!form) return;

  // --- Validation functions & setup ---
  const nameField = document.getElementById('name');
  const surnameField = document.getElementById('surname');
  const emailField = document.getElementById('email');
  const phoneField = document.getElementById('phone');
  const addressField = document.getElementById('address');

  const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');

  if (!nameField || !surnameField || !emailField || !phoneField || !addressField) {
    console.warn('One or more form fields not found. Validation will not be set up.');
    return;
  }

  // Setup validation for all fields
  setupFieldValidation(nameField, validateNameField);
  setupFieldValidation(surnameField, validateNameField);
  setupFieldValidation(emailField, validateEmail);
  setupFieldValidation(phoneField, validatePhone);
  setupFieldValidation(addressField, validateAddress);

  setupPhoneMask(phoneField);
  updateSubmitState();

  // Submit button state: remain disabled while form invalid
  function isFormValid() {
    return (
      validateNameField(nameField.value) &&
      validateNameField(surnameField.value) &&
      validateEmail(emailField.value) &&
      validatePhone(phoneField.value) &&
      validateAddress(addressField.value)
    );
  }

  function updateSubmitState() {
    if (!submitButton) return;
    submitButton.disabled = !isFormValid();
  }

  function validateNameField(value) {
    const trimmedValue = value.trim();
    return trimmedValue !== '' && /^[A-Za-z]*$/.test(trimmedValue);
  }

  function validateEmail(value) {
    const trimmedValue = value.trim();
    return trimmedValue !== '' && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmedValue);
  }

  function validatePhone(value) {
    const digits = String(value || '').replace(/\D/g, '');
    const national = extractLithuanianNationalNumber(digits);
    return national.length === 7;
  }

  function validateAddress(value) {
    const trimmedValue = value.trim();
    return trimmedValue !== '' && trimmedValue.length >= 5 && /[a-zA-Z0-9]/.test(trimmedValue);
  }

  function applyValidationState(field, isValid) {
    field.classList.toggle('is-valid', !!isValid);
    field.classList.toggle('is-invalid', !isValid);
  }

  function setupFieldValidation(field, validationFunc) {
    if (!field) return;

    const validateField = () => {
      const isValid = validationFunc(field.value);
      applyValidationState(field, isValid);
      updateSubmitState();
    };

    field.addEventListener('input', validateField);
    field.addEventListener('blur', validateField);
  }

  // --- Lithuanian phone masking & digit-only enforcement ---
  // Helper: normalize raw digits and return full 8-digit national mobile number (including leading '6')
  function extractLithuanianNationalNumber(digits) {
    if (!digits) return '';
    if (digits.startsWith('3706')) digits = digits.slice(4);
    if (digits.length > 7) digits = digits.slice(0, 7);
    return digits;
  }

  // Format national digits into "+370 6xx xxxxx" progressively
  function formatLithuanianPhoneFromDigits(digits) {
    const national = extractLithuanianNationalNumber(digits);
    if (!national) return '';
    // Progressive formatting: first 3 digits (6xx), rest (up to 5)
    const firstGroup = national.slice(0, 2);
    const rest = national.slice(2);
    return rest ? `+370 6${firstGroup} ${rest}` : `+370 6${firstGroup}`;
  }

  function setupPhoneMask(field) {
    if (!field) return;

    // Prevent non-digit keystrokes but allow control/navigation keys
    field.addEventListener('keydown', (e) => {
      const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Tab'];
      if (allowed.includes(e.key) || e.ctrlKey || e.metaKey || e.altKey) return;
      if (!/^\d$/.test(e.key)) {
        e.preventDefault();
      }
    });

    // On input, normalize to digits, extract national part and format
    field.addEventListener('input', (e) => {
      const el = e.target;
      const digits = String(el.value || '').replace(/\D/g, '');
      const formatted = formatLithuanianPhoneFromDigits(digits);
      el.value = formatted;
      // Validate after formatting and update submit state
      const isValid = validatePhone(el.value);
      applyValidationState(el, isValid);
      updateSubmitState();
    });

    // On blur, ensure full valid format (if invalid, mark invalid via validation flow)
    field.addEventListener('blur', (e) => {
      const el = e.target;
      const digits = String(el.value || '').replace(/\D/g, '');
      const national = extractLithuanianNationalNumber(digits);
      if (national.length === 7) {
        el.value = formatLithuanianPhoneFromDigits(digits);
        applyValidationState(el, true);
      } else {
        applyValidationState(el, false);
      }
      updateSubmitState();
    });
  }


  // --- Submission ---
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      return;
    }
    // const isNameValid = validateNameField(nameField.value);
    // const isSurnameValid = validateNameField(surnameField.value);
    // const isEmailValid = validateEmail(emailField.value);
    // const isPhoneValid = validatePhone(phoneField.value);
    // const isAddressValid = validateAddress(addressField.value);

    // // Update validation states using helper function
    // applyValidationState(nameField, isNameValid);
    // applyValidationState(surnameField, isSurnameValid);
    // applyValidationState(emailField, isEmailValid);
    // applyValidationState(phoneField, isPhoneValid);
    // applyValidationState(addressField, isAddressValid);

    // // Only proceed if all validations pass
    // if (!isNameValid || !isSurnameValid || !isEmailValid || !isPhoneValid || !isAddressValid) {
    //   return;
    // }

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
      const text = `${niceLabel(k)}: ${Array.isArray(v) ? v.join(', ') : v}`;
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
    const ratings = ratingKeys.map(key => Number.parseFloat(data[key]));
    const sum = ratings.reduce((a, b) => a + b, 0);
    return sum / ratings.length;
  }

  function niceLabel(name) {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }
});
