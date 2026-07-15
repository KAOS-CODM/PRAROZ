// =========================
// Dark Mode Manager
// =========================

document.addEventListener("DOMContentLoaded", () => {
    const html = document.documentElement;
    const toggleButton = document.getElementById("theme-toggle");

    // -------------------------
    // Cookie Helpers
    // -------------------------
    function setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));

        document.cookie =
            `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    }

    function getCookie(name) {
        const cookieName = name + "=";
        const cookies = document.cookie.split(";");

        for (let cookie of cookies) {
            cookie = cookie.trim();

            if (cookie.indexOf(cookieName) === 0) {
                return decodeURIComponent(cookie.substring(cookieName.length));
            }
        }

        return null;
    }

    // -------------------------
    // Apply Theme
    // -------------------------
    function applyTheme(theme) {
        if (theme === "dark") {
            html.classList.add("dark");
        } else {
            html.classList.remove("dark");
        }
    }

    // -------------------------
    // Initial Theme
    // -------------------------
    const savedTheme = getCookie("theme");

    if (savedTheme === "dark" || savedTheme === "light") {
        applyTheme(savedTheme);
    } else {
        // First visit: follow system preference
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        applyTheme(prefersDark ? "dark" : "light");
    }

    if (toggleButton) {
        toggleButton.textContent = html.classList.contains("dark")
            ? "☀️"
            : "🌙";
    }

    // -------------------------
    // Toggle Theme
    // -------------------------
    /*if (toggleButton) {
        toggleButton.addEventListener("click", () => {
            const isDark = html.classList.toggle("dark");

            setCookie(
                "theme",
                isDark ? "dark" : "light",
                365
            );
        });
    }*/
    if (toggleButton) {
        toggleButton.addEventListener("click", () => {
            const isDark = html.classList.toggle("dark");
    
            toggleButton.textContent = isDark ? "☀️" : "🌙";
    
            setCookie(
                "theme",
                isDark ? "dark" : "light",
                365
            );
        });
    }

    // -------------------------
    // Follow OS Changes
    // (only if user hasn't chosen a theme)
    // -------------------------
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    mediaQuery.addEventListener("change", (event) => {
        if (!getCookie("theme")) {
            applyTheme(event.matches ? "dark" : "light");
        }
    });

    // ----------------------
    // Cookie Notice
    // ----------------------
    if (!getCookie("themeCookieNotice")) {
    
        const notice = document.createElement("div");
    
        notice.className =
            "fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 rounded-lg bg-slate-800 text-white px-5 py-3 shadow-xl max-w-md text-sm";
    
        notice.innerHTML = `
            <span>
                We use a small cookie to remember your light/dark theme preference.
            </span>
        `;
    
        const button = document.createElement("button");
    
        button.className =
            "rounded bg-slate-600 hover:bg-slate-500 px-3 py-1 transition";
    
        button.textContent = "Got it";
    
        button.addEventListener("click", () => {
            setCookie("themeCookieNotice", "dismissed", 365);
            notice.remove();
        });
    
        notice.appendChild(button);
    
        document.body.appendChild(notice);
    }
});

/*document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("theme-toggle");
    const root = document.documentElement;

    // ----------------------
    // Cookie helpers
    // ----------------------
    function setCookie(name, value, days) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
    }

    function getCookie(name) {
        return document.cookie
            .split("; ")
            .find(row => row.startsWith(name + "="))
            ?.split("=")[1];
    }

    // ----------------------
    // Apply saved theme
    // ----------------------
    const savedTheme = getCookie("theme");

    if (savedTheme === "dark") {
        root.classList.add("dark");
    } else {
        root.classList.remove("dark");
    }

    if (toggle) {
        toggle.textContent = root.classList.contains("dark")
            ? "☀️"
            : "🌙";
    }

    // ----------------------
    // Toggle theme
    // ----------------------
    if (toggle) {
        toggle.addEventListener("click", () => {
            const isDark = root.classList.toggle("dark");

            toggle.textContent = isDark ? "☀️" : "🌙";

            setCookie(
                "theme",
                isDark ? "dark" : "light",
                365
            );
        });
    }

    // ----------------------
    // Cookie Notice
    // ----------------------
    if (!getCookie("themeCookieNotice")) {

        const notice = document.createElement("div");

        notice.className =
            "fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 rounded-lg bg-slate-800 text-white px-5 py-3 shadow-xl max-w-md text-sm";

        notice.innerHTML = `
            <span>
                We use a small cookie to remember your light/dark theme preference.
            </span>
        `;

        const button = document.createElement("button");

        button.className =
            "rounded bg-slate-600 hover:bg-slate-500 px-3 py-1 transition";

        button.textContent = "Got it";

        button.addEventListener("click", () => {
            setCookie("themeCookieNotice", "dismissed", 365);
            notice.remove();
        });

        notice.appendChild(button);

        document.body.appendChild(notice);
    }
});

/*document.addEventListener('DOMContentLoaded', () => {
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
    document.body.classList.add('dark');
    //document.documentElement.classList.add('dark');
    if (toggle) toggle.textContent = '☀️';
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark');
      //const isDark = document.documentElement.classList.toggle('dark');
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
*/