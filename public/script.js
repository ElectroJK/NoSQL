document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  loadBooks();
});

async function checkAuth() {
  const res = await fetch("/auth/user");
  if (!res.ok) {
      window.location.href = "login.html";
  }
}

async function loadBooks() {
  try {
      const res = await fetch("/books");
      if (!res.ok) throw new Error("Failed to load books");

      const books = await res.json();
      displayBooks(books);
  } catch (error) {
      alert("Error loading books: " + error.message);
  }
}

function displayBooks(books) {
  const bookList = document.getElementById("bookList");
  bookList.innerHTML = "";

  books.forEach(book => {
      const bookItem = document.createElement("li");
      bookItem.classList.add("book-item");
      bookItem.innerHTML = `
          <span class="book-title">${book.title} by ${book.author}</span>
          <small>Status: ${book.status} | Rating: ${book.rating || "N/A"}</small>
          <div class="book-buttons">
              <button class="update-btn" onclick="updateBook('${book._id}')">✎</button>
              <button class="delete-btn" onclick="deleteBook('${book._id}', this)">🗑</button>
          </div>
      `;
      bookList.appendChild(bookItem);
  });
}

async function addBook() {
  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  const status = document.getElementById("status").value;
  const ratingInput = document.getElementById("rating").value.trim();
  const rating = ratingInput ? Number(ratingInput) : null;

  if (!title || !author) {
      alert("Please fill in all fields.");
      return;
  }

  try {
      const res = await fetch("/books/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, author, status, rating }),
      });

      let data;
      try {
          data = await res.json();
      } catch (e) {
          throw new Error("Invalid response from server");
      }

      if (!res.ok) {
          throw new Error(data?.error || "Error adding book");
      }

      loadBooks();
      document.getElementById("title").value = "";
      document.getElementById("author").value = "";
      document.getElementById("status").value = "Want to Read";
      document.getElementById("rating").value = "";
  } catch (error) {
      alert("Error adding book: " + error.message);
  }
}

async function updateBook(bookId) {
  let newStatus = prompt("Enter new status (Want to Read, Reading, Read):")?.trim();
  const newRatingInput = prompt("Enter new rating (1-5):")?.trim();
  const newRating = newRatingInput ? Number(newRatingInput) : null;

  const validStatuses = ["Want to Read", "Reading", "Read"];
  newStatus = validStatuses.find(status => status.toLowerCase() === newStatus?.toLowerCase());

  if (!newStatus) {
      alert("Invalid status. Choose from: Want to Read, Reading, Read.");
      return;
  }

  if (newRating !== null && (isNaN(newRating) || newRating < 1 || newRating > 5)) {
      alert("Invalid rating. It must be a number between 1 and 5.");
      return;
  }

  try {
      const res = await fetch(`/books/update/${bookId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus, rating: newRating }),
      });

      if (!res.ok) throw new Error("Failed to update book");

      document.getElementById("filterStatus").value = "Want to Read";
      filterBooks();
  } catch (error) {
      alert("Error updating book: " + error.message);
  }
}



async function deleteBook(bookId, btn) {
  try {
      const res = await fetch(`/books/delete/${bookId}`, { method: "POST" });

      if (!res.ok) throw new Error("Error deleting book");

      btn.parentElement.parentElement.remove();
  } catch (error) {
      alert(error.message);
  }
}

function logout() {
  fetch("/auth/logout", { method: "GET" }).then(() => {
      window.location.href = "login.html";
  });
}

async function searchBooks() {
  const query = document.getElementById("search").value.trim();
  if (!query) return loadBooks();

  try {
      const res = await fetch(`/books/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Failed to search books");

      const books = await res.json();
      displayBooks(books);
  } catch (error) {
      alert("Error searching books: " + error.message);
  }
}

async function filterBooks() {
  const status = document.getElementById("filterStatus").value;
  if (!status) return loadBooks();

  try {
      const res = await fetch(`/books/filter?status=${encodeURIComponent(status)}`);
      if (!res.ok) throw new Error("Failed to filter books");

      const books = await res.json();
      displayBooks(books);
  } catch (error) {
      alert("Error filtering books: " + error.message);
  }
}
