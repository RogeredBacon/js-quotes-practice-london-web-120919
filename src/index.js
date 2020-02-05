// It might be a good idea to add event listener to make sure this file
// only runs after the DOM has finshed loading.
let allQuotesArray = [];
const quoteNode = document.querySelector("#quote-list");
const form = document.querySelector("#new-quote-form");
let sorted = false;

document.addEventListener("DOMContentLoaded", e => {
  form.addEventListener("submit", e => {
    e.preventDefault();
    const quote = form.querySelector("#new-quote").value;
    const author = form.querySelector("#author").value;
    const body = { quote, author };
    fetchNewQuote(body);
  });

  document.querySelector("#sort-btn").addEventListener("click", e => {
    if (!sorted) {
      allQuotesArray.sort((a, b) => {
        return a.author > b.author;
      });
      sorted = true;
      document.querySelector("#sort-btn").innerText = "Sort by Date";
    } else if (sorted) {
      allQuotesArray.sort((a, b) => {
        return a.id - b.id;
      });
      sorted = false;
      document.querySelector("#sort-btn").innerText = "Sort Alphabetically";
    }
    renderQuotes();
  });

  fetchAllQuotes();
});

function showEditQuote(quote) {}

function newLike(quote) {
  const likeBody = {
    quoteId: quote.id,
    createdAt: Date.now()
  };
  fetchLikeButton(likeBody);
}

function renderQuote(quote) {
  let list = document.createElement("li");
  list.classList.add("quote-card");
  list.innerHTML = `
    <blockquote class="blockquote">
      <p class="mb-0">${quote.quote}</p>
      <footer class="blockquote-footer">${quote.author}</footer>
      <br>
      <button class='btn-success'>Likes: <span>${quote.likes.length}</span></button>
      <button class='btn-edit'>Edit</button>
      <button class='btn-danger'>Delete</button>
    </blockquote>
    `;

  list.querySelector(".btn-success").addEventListener("click", e => {
    newLike(quote);
  });

  list.querySelector(".btn-danger").addEventListener("click", e => {
    fetchDeleteQuote(quote);
  });

  list.querySelector(".btn-edit").addEventListener("click", e => {
    showEditQuote(quote);
  });
  return list;
}

function renderQuotes() {
  quoteNode.innerHTML = "";

  for (let quote of allQuotesArray) {
    quoteNode.appendChild(renderQuote(quote));
  }
}

function fetchNewQuote(body) {
  fetch("http://localhost:3000/quotes/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(body)
  })
    .then(res => res.json())
    .then(res => fetchAllQuotes());
}

function fetchDeleteQuote(quote) {
  fetch("http://localhost:3000/quotes/" + quote.id, {
    method: "DELETE"
  })
    .then(res => res.json())
    .then(res => fetchAllQuotes());
}

function fetchLikeButton(likeBody) {
  fetch("http://localhost:3000/likes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(likeBody)
  })
    .then(res => res.json())
    .then(res => fetchAllQuotes());
}

function fetchAllQuotes() {
  fetch("http://localhost:3000/quotes?_embed=likes")
    .then(res => res.json())
    .then(res => {
      allQuotesArray = res;
      renderQuotes();
    });
}
