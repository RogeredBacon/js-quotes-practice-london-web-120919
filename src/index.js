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
    e.target.reset();
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
      <div class="hidden">
      <form id="edit-quote-form">
        <div class="form-group">
          <label for="edit-quote">Edit Quote</label>
          <input
            type="text"
            class="form-control"
            id="edit-quote"
            value="${quote.quote}"
          />
        </div>
        <div class="form-group">
          <label for="Author">Author</label>
          <input
            type="text"
            class="form-control"
            id="author"
            value="${quote.author}"
          />
        </div>
        <button type="submit" class="btn btn-primary">Submit</button>
      </form>
    </div>
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
    e.target.parentElement.childNodes[5].classList.toggle("hidden");
  });

  list.querySelector("#edit-quote-form").addEventListener("submit", e => {
    e.preventDefault();
    const newQuote = list.querySelector("#edit-quote").value;
    const author = list.querySelector("#author").value;
    const body = { newQuote, author };
    fetchEditQuote(quote.id, body);
  });

  return list;
}

function renderQuotes() {
  quoteNode.innerHTML = "";

  for (let quote of allQuotesArray) {
    quoteNode.appendChild(renderQuote(quote));
  }
}

function fetchEditQuote(id, body) {
  fetch("http://localhost:3000/quotes/" + id, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      quote: body.newQuote,
      author: body.author
    })
  })
    .then(res => res.json())
    .then(res => fetchAllQuotes());
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
