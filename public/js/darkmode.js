document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('theme-toggle');

  // ----------------------
  // Dark mode logic
  // ----------------------
  function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; Secure; SameSite=Lax`;
  }

  function getCookie(name) {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith(name + '='))
      ?.split('=')[1];
  }

  const savedTheme = getCookie('theme') || localStorage.getItem('theme');

  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    if (toggle) toggle.textContent = '☀️';
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark-mode');
      toggle.textContent = isDark ? '☀️' : '🌙';
      setCookie('theme', isDark ? 'dark' : 'light', 365);
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }

  // ----------------------
  // Dynamic cookie notice
  // ----------------------
  if (!localStorage.getItem('themeCookieNotice')) {
    const notice = document.createElement('div');
    notice.id = 'cookie-notice';
    notice.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: #fff;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 10px;
    `;

    const text = document.createElement('span');
    text.textContent = 'We use a small cookie to remember your dark/light theme preference.';

    const button = document.createElement('button');
    button.textContent = 'Got it';
    button.style.cssText = `
      background: #555;
      color: #fff;
      border: none;
      padding: 4px 8px;
      border-radius: 5px;
      cursor: pointer;
    `;

    button.addEventListener('click', () => {
      notice.remove();
      localStorage.setItem('themeCookieNotice', 'dismissed');
    });

    notice.appendChild(text);
    notice.appendChild(button);
    document.body.appendChild(notice);
  }
});
