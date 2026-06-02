document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('.needs-validation');

  forms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      const email = form.querySelector('input[type="email"]');
      const password = form.querySelector('input[type="password"]');

      if (!form.checkValidity()) {
        event.preventDefault();
        form.classList.add('was-validated');
        return;
      }

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        event.preventDefault();
        alert('Enter a valid email address.');
      }

      if (password && password.value.length < 6) {
        event.preventDefault();
        alert('Password must be at least 6 characters long.');
      }
    });
  });

  const passwordInput = document.querySelector('[data-password-input]');
  const strengthText = document.querySelector('[data-password-strength]');
  const toggleButton = document.querySelector('[data-toggle-password]');

  if (passwordInput && strengthText) {
    passwordInput.addEventListener('input', () => {
      const value = passwordInput.value;
      let strength = 'Weak';

      if (value.length >= 10 && /[A-Z]/.test(value) && /\d/.test(value)) {
        strength = 'Strong';
      } else if (value.length >= 6) {
        strength = 'Medium';
      }

      strengthText.textContent = `Password strength: ${strength}`;
    });
  }

  if (toggleButton && passwordInput) {
    toggleButton.addEventListener('click', () => {
      passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
      toggleButton.textContent = passwordInput.type === 'password' ? 'Show' : 'Hide';
    });
  }

  const searchInput = document.querySelector('[data-event-search]');
  const cards = document.querySelectorAll('[data-event-card]');

  if (searchInput && cards.length > 0) {
    searchInput.addEventListener('input', () => {
      const term = searchInput.value.toLowerCase();

      cards.forEach((card) => {
        const text = card.textContent.toLowerCase();
        card.hidden = !text.includes(term);
      });
    });
  }

  const apiEventList = document.querySelector('[data-api-events]');

  if (apiEventList) {
    fetch('/api/events')
      .then((response) => response.json())
      .then((events) => {
        apiEventList.innerHTML = events
          .map((event) => `<li>${event.title} - ${new Date(event.date).toDateString()}</li>`)
          .join('');
      })
      .catch(() => {
        apiEventList.innerHTML = '<li>Unable to load API events.</li>';
      });
  }
});
