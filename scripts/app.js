const sections = document.querySelectorAll("section");

// navigation scrolls to the sections
const navigationScroll = () => {
  const links = [...document.querySelectorAll(".nav-link")];

  links.forEach((link, index) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      sections[index].scrollIntoView({ behavior: "smooth" });
    });
  });
};

navigationScroll();

// explore button
const exploreButton = () => {
  const exploreBtn = document.querySelector(".text-center a");
  const aboutBtn = document.querySelector(".about-btn");
  const storeSection = sections[2];

  exploreBtn.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: storeSection.offsetTop, behavior: "smooth" });
  });

  // to prevent default behavior also in about button
  aboutBtn.addEventListener("click", (event) => {
    event.preventDefault();
  });
};

exploreButton();

// shopping store
class GrandmaStore {
  constructor() {
    this.cartButton = document.getElementById("cart-info");
    this.cart = document.getElementById("cart");
    this.navbarToggler = document.querySelector(".navbar-toggler");
    this.cartBtns = [...document.querySelectorAll(".store-item-icon")];
    this.cartData = document.querySelector(".data-cart");
    this.totalAmounts = document.getElementById("cart-total");
    this.itemsTotal = document.querySelector(".item-total");
    this.itemsCounts = document.getElementById("item-count");
    this.clearCartBtn = document.getElementById("clear-cart");
    // ------------- //
    this.cartItems = Storage.getCart();
    // ------------- //
    this.showCart();
    this.checkOpenCart();
    this.addToCart();
    this.removeItem();
    this.clearCart();
  }

  // to check if user resize and cart is oper
  checkOpenCart() {
    window.addEventListener("resize", () => {
      if (
        window.innerWidth < 992 &&
        this.cart.classList.contains("show-cart")
      ) {
        this.cart.classList.remove("show-cart");
      }
    });
  }

  // openning and closing cart
  showCart() {
    this.cartButton.addEventListener("click", () => {
      this.cart.classList.toggle("show-cart");
    });
    this.navbarToggler.addEventListener("click", () => {
      if (this.cart.classList.contains("show-cart")) {
        this.cart.classList.remove("show-cart");
      }
    });
  }

  addToCart() {
    this.cartBtns.forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        let fullPath = event.currentTarget.parentElement.children[0].src;
        let pos = fullPath.indexOf("img") + 3;
        let partPath = fullPath.slice(pos);

        const item = {};

        let id = event.currentTarget.getAttribute("id");

        // check if item in cart
        let singleItem = this.cartItems.find((item) => item.id === id);
        if (singleItem) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "You can't add the same item to the cart!",
          });
          return;
        }

        let imgSrc = `img-cart${partPath}`;
        let title =
          event.currentTarget.parentElement.nextElementSibling.children[0]
            .children[0].textContent;
        let price =
          event.currentTarget.parentElement.nextElementSibling.children[0]
            .children[1].textContent;
        let finalPrice = +price.slice(1).trim();

        item.img = imgSrc;
        item.title = title;
        item.price = finalPrice;
        item.id = id;

        // add to cart items array
        this.cartItems.push(item);
        // save to local storage
        Storage.saveCart(this.cartItems);
        // update cart
        this.showInCart();
        // update totals
        this.showTotals();
        // show success message

        let regExp = /^\w+/;
        let finalTitle = item.title.match(regExp).join(" ");

        Swal.fire({
          icon: "success",
          title: "Done!",
          text: `${finalTitle} has added to the cart`,
          showConfirmButton: false,
          timer: 2000,
        });
      });
    });
  }

  showInCart() {
    let result = "";
    this.cartItems.map((item) => {
      result += `
        <!-- cart item -->
        <div class="cart-item d-flex justify-content-between text-capitalize my-3" id=${item.id}>
          <img src="${item.img}" class="img-fluid rounded-circle" id="item-img" alt=${item.title}>
          <div class="item-text">
            <p id="cart-item-title" class="font-weight-bold mb-0">${item.title}</p>
            <span>$</span>
            <span id="cart-item-price" class="cart-item-price" class="mb-0">${item.price}</span>
          </div>
          <span id='cart-item-remove' class="cart-item-remove" id=${item.id}>
            <i class="fas fa-trash"></i>
          </span>
        </div>
        <!-- end of cart item -->
      `;
    });

    this.cartData.innerHTML = result;
  }

  showTotals() {
    let totals = this.cartItems.reduce(
      (current, item) => current + item.price,
      0
    );
    this.totalAmounts.textContent = totals;
    this.itemsTotal.textContent = totals;
    this.itemsCounts.textContent = this.cartItems.length;
  }

  removeItem() {
    document.addEventListener("click", (event) => {
      if (event.target.classList.contains("fa-trash")) {
        let id = event.target.parentElement.parentElement.id;
        let remainingItems = this.cartItems.filter((item) => item.id !== id);
        this.cartItems = remainingItems;
        Storage.saveCart(this.cartItems);

        this.showInCart();
        this.showTotals();
      }
    });
  }

  clearCart() {
    this.clearCartBtn.addEventListener("click", (event) => {
      event.preventDefault();
      this.cartItems = [];
      Storage.clearCart();

      this.showInCart();
      this.showTotals();
    });
  }
}

class Storage {
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    let localStorageCart;
    if (localStorage.getItem("cart")) {
      localStorageCart = JSON.parse(localStorage.getItem("cart"));
    } else {
      localStorageCart = [];
    }

    return localStorageCart;
  }

  static clearCart() {
    localStorage.removeItem("cart");
  }
}

const store = new GrandmaStore();

// execute when loaded to check local storage
document.addEventListener("DOMContentLoaded", () => {
  store.showInCart();
  store.showTotals();
});

// all products
const products = [...document.querySelectorAll(".store-item")];
// input search
const inputSearch = document.getElementById("search-item");

const filterItemsByClicks = () => {
  const buttons = [...document.querySelectorAll(".filter-btn")];

  buttons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      let buttonDataSet = event.currentTarget.dataset.filter;

      // disabled input search
      if (buttonDataSet === "all") {
        inputSearch.disabled = false;
      } else {
        inputSearch.value = "";
        inputSearch.disabled = true;
      }

      // check if we click the same button
      if (button.classList.contains("active-class")) {
        return;
      }

      // remove all old classes
      buttons.forEach((button) => {
        button.classList.remove("active-class");
      });
      // add active class to the current button
      button.classList.add("active-class");

      products.forEach((product) => {
        let productDataSet = product.dataset.item;

        product.style.transition = "0.5s";
        product.style.transform = "scale(0)";

        setTimeout(() => {
          product.style.display = "none";
        }, 500);

        if (buttonDataSet === "all" || buttonDataSet === productDataSet) {
          setTimeout(() => {
            product.style.display = "block";
          }, 500);

          setTimeout(() => {
            product.style.transition = "0.5s";
            product.style.transform = "scale(1)";
          }, 550);
        }
      });
    });
  });
};

filterItemsByClicks();

const filterItemsByKeyup = () => {
  // all products datasets
  const productsDataSets = products.map((product) => product.dataset.item);

  // get unique datasets
  const uniqueDataSets = [...new Set(productsDataSets)];

  // filtered function
  const filteredArr = () => {
    // get input value
    let keyword = inputSearch.value.toLowerCase();

    // filtered data sets
    const filterDataSets = uniqueDataSets.filter(
      (set) => set.indexOf(keyword) > -1
    );

    products.forEach((product) => {
      product.style.display = "none";
      const productDataSet = product.dataset.item;
      if (filterDataSets.indexOf(productDataSet) > -1) {
        product.style.display = "block";
      }
    });

    //--------------------------------------------------//

    // alert message to user if match wrong parameter
    const noProductsParagraph = products[0].parentElement.lastElementChild;

    if (!filterDataSets.length) {
      noProductsParagraph.style.display = "block";
    } else {
      noProductsParagraph.style.display = "none";
    }
    //--------------------------------------------------//
  };

  inputSearch.addEventListener("keyup", filteredArr);
};

filterItemsByKeyup();

const orderCakes = () => {
  const orderBtns = document.querySelectorAll(".order-btn");
  for (const btn of orderBtns) {
    btn.addEventListener("click", (event) => {
      const cakeItem = {};
      // image source
      const cakeSrcImg =
        event.currentTarget.nextElementSibling.nextElementSibling.src;
      // title
      const title =
        event.currentTarget.parentElement.previousElementSibling.textContent;
      // id
      const id = event.currentTarget.id;
      // price
      const price = +prompt("What price do you want for this cake?", 5);

      cakeItem.img = cakeSrcImg;
      cakeItem.title = title;
      cakeItem.price = price;
      cakeItem.id = id;

      /*
        Now we can pass to cart array but I kept it in console cuz,
        I want to make all sweets items only available to buy.
      */

      console.log(cake);
    });
  }
};

orderCakes();

const goToTop = () => {
  const toTopBtn = document.querySelector(".to-top");
  window.addEventListener("scroll", () => {
    if (scrollY > 200) {
      toTopBtn.classList.add("animate");
    } else {
      toTopBtn.classList.remove("animate");
    }
  });

  toTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
};

goToTop();
