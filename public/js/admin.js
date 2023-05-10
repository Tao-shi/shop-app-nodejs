//@ts-nocheck

"use strict";

const deleteProduct = (btn) => {
  const prodId = btn.parentNode.querySelector("[name=productId]").value;
  const csrf = btn.parentNode.querySelector("[name=_csrf]").value;
  const pagination = document.querySelector(".pagination");
  const grid = document.querySelector(".grid");
  const productElement = btn.closest("article");

    const observer = new MutationObserver(() => {
        
    })
  console.log(pagination);

  fetch(`/admin/product/${prodId}`, {
    method: "DELETE",
    headers: {
      "csrf-token": csrf,
    },
    credentials: "include",
  })
    .then((result) => {
      console.log(result);
      return result.json();
    })
    .then((data) => {
      console.log(data);
      // productElement.remove(); // Newer browsers
        productElement.parentNode.removeChild(productElement);
        console.log(grid.children.length)
        if (grid.children.length < 1) {
         new Mutation   
        }
    })
    .catch((err) => {
      console.log(err);
    });
};
