const WHATSAPP_NUMBER = "919238585559";
const STORAGE_KEY = "ciatel_vendor_products_v1";
const DELETED_IDS_KEY = "ciatel_deleted_product_ids_v1";

const baseProducts = [
  {
    id: "p1",
    name: "Dual Band Wi-Fi Modem",
    category: "ISP Equipment",
    brand: "CiaTel",
    description: "Stable broadband modem for home users, office connections and local ISP installations.",
    price: "Ask for latest rate",
    moq: "Single / bulk available",
    image: "",
    isVendorAdded: false,
  },
  {
    id: "p2",
    name: "FTTH ONT Device",
    category: "Fiber Products",
    brand: "CiaTel",
    description: "Reliable ONT unit for FTTH deployment, subscriber setup and broadband activation.",
    price: "Project and dealer rates",
    moq: "10 pcs onwards",
    image: "",
    isVendorAdded: false,
  },
  {
    id: "p3",
    name: "Fiber Drop Cable Roll",
    category: "Fiber Products",
    brand: "CiaTel",
    description: "Outdoor-ready fiber drop cable for local operator installation and network expansion.",
    price: "Per roll pricing",
    moq: "Bulk preferred",
    image: "",
    isVendorAdded: false,
  },
  {
    id: "p4",
    name: "Cable TV Splitter",
    category: "Cable TV Supply",
    brand: "CiaTel",
    description: "Distribution-ready cable TV splitter for multi-point signal management.",
    price: "Wholesale rate on inquiry",
    moq: "20 pcs onwards",
    image: "",
    isVendorAdded: false,
  },
  {
    id: "p5",
    name: "GPON Router Combo",
    category: "ISP Equipment",
    brand: "CiaTel",
    description: "Combined router and fiber-ready device for fast deployment and customer setup.",
    price: "Custom pricing available",
    moq: "Retail and project supply",
    image: "",
    isVendorAdded: false,
  },
  {
    id: "p6",
    name: "Patch Cord Pack",
    category: "Accessories",
    brand: "CiaTel",
    description: "Essential patch cord pack for installers, maintenance teams and quick service visits.",
    price: "Bulk accessory quote",
    moq: "50 units onwards",
    image: "",
    isVendorAdded: false,
  },
  {
    id: "p7",
    name: "Fiber Joint Enclosure",
    category: "Fiber Products",
    brand: "CiaTel",
    description: "Protective enclosure for organized splicing and long-life outdoor fiber safety.",
    price: "Ask for project rate",
    moq: "5 pcs onwards",
    image: "",
    isVendorAdded: false,
  },
  {
    id: "p8",
    name: "Coaxial Cable Bundle",
    category: "Cable TV Supply",
    brand: "CiaTel",
    description: "Durable coaxial cable for cable TV operators and long-run signal routing.",
    price: "Rate on inquiry",
    moq: "Per bundle",
    image: "",
    isVendorAdded: false,
  },
];

const generalMessages = {
  "header-quote":
    "Hello, I want a quote for your ISP, Fiber and Cable TV products. Please share the available options.",
  "footer-contact":
    "Hello, I want to contact CiaTel Store regarding your products.",
  "floating-cta":
    "Hello, I want to inquire about your products on WhatsApp.",
};

function loadVendorProducts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

function saveVendorProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function loadDeletedProductIds() {
  try {
    const saved = localStorage.getItem(DELETED_IDS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

function saveDeletedProductIds(ids) {
  localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(ids));
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Image read failed"));
    reader.readAsDataURL(file);
  });
}

function getAllProducts() {
  const deletedIds = new Set(loadDeletedProductIds());
  return [...baseProducts, ...loadVendorProducts()].filter((product) => !deletedIds.has(product.id));
}

function deleteProductById(productId) {
  const vendorProducts = loadVendorProducts();
  if (vendorProducts.some((product) => product.id === productId)) {
    saveVendorProducts(vendorProducts.filter((product) => product.id !== productId));
    return;
  }

  const deletedIds = loadDeletedProductIds();
  if (!deletedIds.includes(productId)) {
    deletedIds.push(productId);
    saveDeletedProductIds(deletedIds);
  }
}

function resetVendorManagedProducts() {
  saveVendorProducts([]);
  saveDeletedProductIds([]);
}

function buildWhatsAppUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function openWhatsApp(message) {
  window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
}

function getProductInitials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getCategories(products) {
  return ["All", ...new Set(products.map((product) => product.category))];
}

function initStorePage() {
  const productGrid = document.getElementById("productGrid");
  if (!productGrid) {
    return;
  }

  const filterRow = document.getElementById("filterRow");
  const searchInput = document.getElementById("productSearch");
  const sortSelect = document.getElementById("sortSelect");
  const bookingForm = document.getElementById("bookingForm");
  const searchButton = document.querySelector(".header-search button");

  let activeCategory = "All";

  function getFilteredProducts() {
    const term = searchInput.value.trim().toLowerCase();
    const sortMode = sortSelect.value;

    let filtered = getAllProducts().filter((product) => {
      const matchesCategory = activeCategory === "All" || product.category === activeCategory;
      const haystack =
        `${product.name} ${product.category} ${product.brand} ${product.description}`.toLowerCase();
      return matchesCategory && haystack.includes(term);
    });

    if (sortMode === "az") {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortMode === "vendor") {
      filtered = filtered.sort((a, b) => Number(b.isVendorAdded) - Number(a.isVendorAdded));
    }

    return filtered;
  }

  function renderFilters() {
    filterRow.innerHTML = "";

    getCategories(getAllProducts()).forEach((category) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `category-chip${category === activeCategory ? " active" : ""}`;
      button.textContent = category;
      button.addEventListener("click", () => {
        activeCategory = category;
        renderFilters();
        renderProducts();
      });
      filterRow.appendChild(button);
    });
  }

  function createProductMedia(product) {
    if (product.image) {
      return `
        <div class="product-media">
          <img src="${product.image}" alt="${product.name}" />
        </div>
      `;
    }

    return `
      <div class="product-media">
        <div class="media-fallback">${getProductInitials(product.name)}</div>
      </div>
    `;
  }

  function renderProducts() {
    const filteredProducts = getFilteredProducts();
    productGrid.innerHTML = "";

    if (!filteredProducts.length) {
      const emptyState = document.createElement("div");
      emptyState.className = "empty-state";
      emptyState.textContent = "No matching products found. Try another search or category.";
      productGrid.appendChild(emptyState);
      return;
    }

    filteredProducts.forEach((product) => {
      const card = document.createElement("article");
      card.className = "product-card";
      card.innerHTML = `
        ${createProductMedia(product)}
        <div class="product-topline">
          <span class="badge">${product.category}</span>
          ${product.isVendorAdded ? '<span class="badge vendor">New</span>' : ""}
        </div>
        <div class="product-copy">
          <h3>${product.name}</h3>
          <p>${product.description}</p>
        </div>
        <div class="product-bottomline">
          <div>
            <div class="product-price">${product.price}</div>
            <div class="meta-line">${product.brand} | ${product.moq}</div>
          </div>
        </div>
      `;

      const action = document.createElement("button");
      action.type = "button";
      action.className = "product-action";
      action.textContent = "Ask on WhatsApp";
      action.addEventListener("click", () => {
        const message = [
          "Hello, I want to inquire about this product.",
          `Product: ${product.name}`,
          `Category: ${product.category}`,
          `Brand: ${product.brand}`,
          `Price Label: ${product.price}`,
          `Minimum Order: ${product.moq}`,
          "Please share availability, final price and booking details.",
        ].join("\n");
        openWhatsApp(message);
      });

      card.appendChild(action);
      productGrid.appendChild(card);
    });
  }

  function handleBookingForm() {
    bookingForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = document.getElementById("customerName").value.trim();
      const phone = document.getElementById("customerPhone").value.trim();
      const item = document.getElementById("customerItem").value.trim();
      const quantity = document.getElementById("customerQty").value.trim();
      const note = document.getElementById("customerMessage").value.trim();

      const message = [
        "Hello, I want to place a booking inquiry.",
        `Name: ${name}`,
        `Mobile: ${phone}`,
        `Interested Item: ${item}`,
        `Requirement: ${quantity}`,
        `Message: ${note || "No additional note"}`,
      ].join("\n");

      openWhatsApp(message);
    });
  }

  searchInput.addEventListener("input", renderProducts);
  sortSelect.addEventListener("change", renderProducts);
  searchButton.addEventListener("click", renderProducts);

  renderFilters();
  renderProducts();
  handleBookingForm();
}

function initAdminPage() {
  const sellerForm = document.getElementById("sellerForm");
  if (!sellerForm) {
    return;
  }

  const adminProductList = document.getElementById("adminProductList");
  const clearVendorProductsButton = document.getElementById("clearVendorProducts");

  function renderAdminProducts() {
    const products = getAllProducts();
    adminProductList.innerHTML = "";

    if (!products.length) {
      const emptyState = document.createElement("div");
      emptyState.className = "empty-state";
      emptyState.textContent = "No products available right now.";
      adminProductList.appendChild(emptyState);
      return;
    }

    products.forEach((product) => {
      const item = document.createElement("article");
      item.className = "admin-product-item";
      item.innerHTML = `
        <div class="admin-product-copy">
          <strong>${product.name}</strong>
          <div class="admin-product-meta">${product.category} | ${product.price}</div>
          <div class="admin-product-meta">${product.brand} | ${product.moq}</div>
        </div>
      `;

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "admin-delete-btn";
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", () => {
        deleteProductById(product.id);
        renderAdminProducts();
      });

      item.appendChild(deleteButton);
      adminProductList.appendChild(item);
    });
  }

  sellerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const vendorProducts = loadVendorProducts();
    const imageInput = document.getElementById("sellerImage");
    const selectedFile = imageInput.files && imageInput.files[0] ? imageInput.files[0] : null;
    let imageValue = "";

    if (selectedFile) {
      try {
        imageValue = await readFileAsDataUrl(selectedFile);
      } catch (error) {
        imageValue = "";
      }
    }

    const product = {
      id: `vendor-${Date.now()}`,
      name: document.getElementById("sellerProductName").value.trim(),
      category: document.getElementById("sellerCategory").value,
      brand: document.getElementById("sellerBrand").value.trim(),
      price: document.getElementById("sellerPrice").value.trim(),
      moq: document.getElementById("sellerMoq").value.trim(),
      image: imageValue,
      description: document.getElementById("sellerDescription").value.trim(),
      isVendorAdded: true,
    };

    vendorProducts.unshift(product);
    saveVendorProducts(vendorProducts);
    sellerForm.reset();
    renderAdminProducts();
  });

  clearVendorProductsButton.addEventListener("click", () => {
    resetVendorManagedProducts();
    renderAdminProducts();
  });

  renderAdminProducts();
}

function handleGeneralWhatsAppButtons() {
  document.querySelectorAll("[data-whatsapp-trigger]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.getAttribute("data-whatsapp-trigger");
      const message = generalMessages[key];
      if (message) {
        openWhatsApp(message);
      }
    });
  });
}

handleGeneralWhatsAppButtons();
initStorePage();
initAdminPage();
