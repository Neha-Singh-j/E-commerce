document.addEventListener("DOMContentLoaded", () => {
  const wishlistButtons = document.querySelectorAll(".wishlist-btn");

  wishlistButtons.forEach((button) => {
    button.addEventListener("click", async (e) => {
      const productId = e.currentTarget.dataset.productId;

      try {
        const response = await fetch(`/products/${productId}/like`, {
          method: "POST",
        });

        if (response.ok) {
          e.currentTarget.classList.toggle("liked");
        } else {
          alert("Login required to add to wishlist!");
        }
      } catch (error) {
        console.error("Error liking product:", error);
      }
    });
  });
});
