//@ts-nocheck

"use-strict";

const backdrop = document.querySelector(".backdrop");
const sideDrawer = document.querySelector(".mobile-nav");
const menuToggle = document.querySelector("#side-menu-toggle");
const productForm = document.querySelector(".product-form");
const formSubmitBtn = document.querySelector(".form__button");
const spinnerDiv = document.querySelector(".spinner");
const closeDiv = document.querySelector(".close");
const messageDiv = document.querySelector(".user-message");
const gridDiv = document.querySelector(".grid");

const fadeIn = function () {
  messageDiv.style.opacity = 1;
};

const backdropClickHandler = function () {
  backdrop.style.display = "none";
  sideDrawer.classList.remove("open");
};

const menuToggleClickHandler = function () {
  backdrop.style.display = "block";
  sideDrawer.classList.add("open");
};

const renderSpinner = function () {
  spinnerDiv.classList.toggle("hidden");
  formSubmitBtn.disabled = true;
  formSubmitBtn.classList.add("hidden");
};

const close = function () {
  messageDiv.style.opacity = 0;
  setTimeout(() => {
    messageDiv.classList.toggle("hidden");
  }, 300);
};

closeDiv?.addEventListener("click", close);
productForm.addEventListener("submit", renderSpinner);
backdrop.addEventListener("click", backdropClickHandler);
menuToggle.addEventListener("click", menuToggleClickHandler);
