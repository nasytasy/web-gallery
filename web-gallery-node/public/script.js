document.addEventListener("DOMContentLoaded", function () {
    const galleryContainer = document.querySelector(".gallery");
    const mainContainer = document.createElement("div");
    mainContainer.id = "main-content";
    document.body.appendChild(mainContainer);

    const productsUrl = "/products.json";
    const commentsUrl = "/comments.json";

    function loadGallery() {
        const existingBackButton = document.getElementById("back-to-gallery");
        if (existingBackButton) existingBackButton.remove();

        mainContainer.innerHTML = "";
        mainContainer.appendChild(galleryContainer);

        fetch(productsUrl)
            .then(response => response.json())
            .then(products => {
                galleryContainer.innerHTML = "" ;

                products.forEach(product => {
                    const img = document.createElement("img");
                    img.src = product.src;
                    img.alt = product.title;
                    img.dataset.id = product.id;
                    img.style.cursor = "pointer";

                    img.addEventListener("click", function () {
                        loadProductDetails(product, products);
                    });

                    galleryContainer.appendChild(img);
                });
            })
            .catch(error => console.error("Error loading gallery:",error));
    }

    function loadProductDetails(product, products) {
        mainContainer.innerHTML = `
            <div class="header">
                <button id="back-to-gallery" class="back-button">← Back to Gallery</button>
                Product Details
            </div>

            <div class="product-container">
                <div class="product-image">
                    <img id="product-img" src="${product.src}" alt="${product.title}">
                </div>
                <div class="product-info">
                    <h2>${product.title}</h2>
                    <p class="product-meta">Author: <span id="author-name">${product.author}</span></p>
                    <p class="product-meta">Resolution: <span id="image-resolution">${product.resolution}</span></p>
                    <button id="download-btn">Download</button>
                </div>
            </div>

            <div class="toggle-buttons">
                <button id="suggested-btn" class="active">Suggested</button>
                <button id="comments-btn">Comments</button>
            </div>

            <div id="suggested-section" class="section">
                <h3 style="color: white;">Suggested Images</h3>
                <div class="suggested-images">${generateSuggestedImages(product.id, products)}</div>
            </div>

            <div id="comments-section" class="section" style="display: none;">
                <h3 style="color: white;">Leave a Comment</h3>
                <input type="text" id="comment-name" placeholder="Your Name">
                <textarea id="comment-text" placeholder="Write your comment here..."></textarea>
                <button id="submit-comment">Submit</button>

                <h3>Comments</h3>
                <ul id="comment-list"></ul>
            </div>
        `;


        document.getElementById("back-to-gallery").addEventListener("click", loadGallery);

        document.getElementById("download-btn").addEventListener("click", function () {
            const a = document.createElement("a");
            a.href = product.src;
            a.download = product.title.replace(/\s+/g, "_") + ".jpg";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });

        document.querySelectorAll(".suggested-images img").forEach(img => {
            img.addEventListener("click", function () {
                const selectedProduct = products.find(p => p.id == this.dataset.id);
                if (selectedProduct) {
                    loadProductDetails(selectedProduct, products);
                }
            });
        });

        setupToggleSections();
        loadComments(product.id);
    }

    function generateSuggestedImages(currentId, products) {
        const suggested = products.filter(p => p.id !==currentId)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        return suggested.map(p => `<img src="${p.src}" alt="${p.title}" data-id="${p.id}" class="suggested-img">`).join("");
    }

    function setupToggleSections() {
        document.getElementById("suggested-btn").addEventListener("click", function () {
            document.getElementById("suggested-section").style.display = "block";
            document.getElementById("comments-section").style.display = "none";
        });

        document.getElementById("comments-btn").addEventListener("click", function () {
            document.getElementById("suggested-section").style.display = "none";
            document.getElementById("comments-section").style.display = "block";
        });
    }

    function loadComments(productId) {
        const commentsList = document.getElementById("comment-list");
        const submitBtn = document.getElementById("submit-comment");

        function fetchComments() {
            fetch(commentsUrl)
                .then(response => response.json())
                .then(comments => {
                    commentsList.innerHTML = "";
                    (comments[productId] || []).forEach(comment => {
                        const li = document.createElement("li");
                        li.innerHTML = `<strong>${comment.name}</strong>: ${comment.text}`;
                        commentsList.appendChild(li);
                    });
                })
                .catch(error => console.error("Error loading comments:", error));
        }

        function saveComment(name, text) {
            fetch("/add-comment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, name, text })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById("comment-name").value = "";
                    document.getElementById("comment-text").value = "";
                    fetchComments(productId);
                } else {
                    alert("Error saving comment.");
                }
            })
            .catch(error => console.error("Error saving comment:", error));
        }

        if (submitBtn) {
            submitBtn.addEventListener("click", function () {
                const name = document.getElementById("comment-name").value.trim();
                const text = document.getElementById("comment-text").value.trim();

                if (name === "" || text === "") {
                    alert("Please enter your name and a comment.");
                    return;
                }

                saveComment(name, text);
            });
        }

        fetchComments();
    }



   
    loadGallery();
});
