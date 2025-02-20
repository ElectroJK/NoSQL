document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
  
    const res = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
  
    if (res.ok) {
      window.location.href = "/index.html";
    } else {
      alert("Login failed! Check your credentials.");
    }
  });

  document.querySelectorAll("#togglePassword").forEach(button => {
    button.addEventListener("click", () => {
        const passwordInput = button.previousElementSibling;
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            button.textContent = "Hide";
        } else {
            passwordInput.type = "password";
            button.textContent = "Show";
        }
    });
});

document.getElementById("forgotPasswordForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const newPassword = document.getElementById("newPassword").value;

  const res = await fetch("/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword })
  });

  if (res.ok) {
      alert("Password reset successful! You can now log in.");
      window.location.href = "/login.html";
  } else {
      const errorText = await res.text();
      alert("Password reset failed! " + errorText);
  }
});

document.getElementById("toggleNewPassword")?.addEventListener("click", () => {
  const passwordInput = document.getElementById("newPassword");
  const toggleButton = document.getElementById("toggleNewPassword");
  if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleButton.textContent = "Hide";
  } else {
      passwordInput.type = "password";
      toggleButton.textContent = "Show";
  }
});
  
  document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
  
    const res = await fetch("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });
  
    if (res.ok) {
      window.location.href = "/login.html";
    } else {
      alert("Registration failed!");
    }
  });
  