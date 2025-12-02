document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form.php-email-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

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
