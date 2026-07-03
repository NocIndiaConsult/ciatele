const WHATSAPP_NUMBER = "919238585559";
const SUPABASE_URL = "https://uopvohhybdlmsbkssmcy.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvcHZvaGh5YmRsbXNia3NzbWN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxOTU4NzYsImV4cCI6MjA5NDc3MTg3Nn0.v4MVCRKGfrTuyW_zdj-JZlhKV-YCtilOosvb608tUgA";
const STORAGE_BUCKET = "product-images";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const starterProducts = [
  {
    name: "Dual Band Wi-Fi Modem",
    category: "ISP Equipment",
    brand: "CiaTelecom",
    description: "Stable broadband modem for home users, office connections and local ISP installations.",
    price: "Ask for latest rate",
    moq: "Single / bulk available",
    image_url: null,
    is_active: true,
  },
  {
    name: "FTTH ONT Device",
    category: "Fiber Products",
    brand: "CiaTelecom",
    description: "Reliable ONT unit for FTTH deployment, subscriber setup and broadband activation.",
    price: "Project and dealer rates",
    moq: "10 pcs onwards",
    image_url: null,
    is_active: true,
  },
  {
    name: "Fiber Drop Cable Roll",
    category: "Fiber Products",
    brand: "CiaTelecom",
    description: "Outdoor-ready fiber drop cable for local operator installation and network expansion.",
    price: "Per roll pricing",
    moq: "Bulk preferred",
    image_url: null,
    is_active: true,
  },
  {
    name: "Cable TV Splitter",
    category: "Cable TV Supply",
    brand: "CiaTelecom",
    description: "Distribution-ready cable TV splitter for multi-point signal management.",
    price: "Wholesale rate on inquiry",
    moq: "20 pcs onwards",
    image_url: null,
    is_active: true,
  },
  {
    name: "GPON Router Combo",
    category: "ISP Equipment",
    brand: "CiaTelecom",
    description: "Combined router and fiber-ready device for fast deployment and customer setup.",
    price: "Custom pricing available",
    moq: "Retail and project supply",
    image_url: null,
    is_active: true,
  },
  {
    name: "Patch Cord Pack",
    category: "Accessories",
    brand: "CiaTelecom",
    description: "Essential patch cord pack for installers, maintenance teams and quick service visits.",
    price: "Bulk accessory quote",
    moq: "50 units onwards",
    image_url: null,
    is_active: true,
  },
  {
    name: "Fiber Joint Enclosure",
    category: "Fiber Products",
    brand: "CiaTelecom",
    description: "Protective enclosure for organized splicing and long-life outdoor fiber safety.",
    price: "Ask for project rate",
    moq: "5 pcs onwards",
    image_url: null,
    is_active: true,
  },
  {
    name: "Coaxial Cable Bundle",
    category: "Cable TV Supply",
    brand: "CiaTelecom",
    description: "Durable coaxial cable for cable TV operators and long-run signal routing.",
    price: "Rate on inquiry",
    moq: "Per bundle",
    image_url: null,
    is_active: true,
  },
];

const generalMessages = {
  "header-quote":
    "Hello, I want a quote for your ISP, Fiber and Cable TV products. Please share the available options.",
  "footer-contact":
    "Hello, I want to contact CiaTelecom Services regarding your products.",
  "floating-cta":
    "Hello, I want to inquire about your products on WhatsApp.",
};

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isFetchStyleError(error) {
  const message = error && error.message ? error.message.toLowerCase() : "";
  return message.includes("failed to fetch") || message.includes("network") || message.includes("fetch");
}

async function fetchProducts() {
  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

async function uploadProductImage(file) {
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const filePath = `products/${fileName}`;

  const { error } = await supabaseClient.storage.from(STORAGE_BUCKET).upload(filePath, file, {
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data } = supabaseClient.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

async function createProduct(product) {
  const { error } = await supabaseClient.from("products").insert(product);
  if (error) {
    throw error;
  }
}

async function deleteProductById(productId) {
  const { error } = await supabaseClient.from("products").delete().eq("id", productId);
  if (error) {
    throw error;
  }
}

async function loginWithRetry(email, password, statusElement) {
  let lastError = null;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    if (statusElement) {
      statusElement.textContent =
        attempt === 1 ? "Logging in..." : `Retrying secure login (${attempt}/3)...`;
    }

    try {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (!error) {
        return;
      }
      lastError = error;
      if (!isFetchStyleError(error) || attempt === 3) {
        throw error;
      }
    } catch (error) {
      lastError = error;
      if (!isFetchStyleError(error) || attempt === 3) {
        throw error;
      }
    }

    await wait(2500);
  }

  throw lastError || new Error("Login failed");
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

function buildProductWhatsAppMessage(product) {
  return [
    "Hello, I want to inquire about this product.",
    `Product: ${product.name}`,
    `Category: ${product.category}`,
    `Brand: ${product.brand}`,
    `Price Label: ${product.price}`,
    `Minimum Order: ${product.moq}`,
    "Please share availability, final price and booking details.",
  ].join("\n");
}

function createProductDetailMarkup(product) {
  const media = product.image_url
    ? `<img src="${product.image_url}" alt="${product.name}" />`
    : `<div class="media-fallback">${getProductInitials(product.name)}</div>`;

  const specs = [
    { label: "Category", value: product.category },
    { label: "Brand", value: product.brand },
    { label: "Minimum order", value: product.moq },
  ];

  return `
    <div class="detail-overlay" id="productDetailOverlay">
      <div class="detail-card" role="dialog" aria-modal="true" aria-label="${product.name} details">
        <button class="detail-close" type="button" id="detailCloseBtn" aria-label="Close product details">&times;</button>
        <div class="detail-media">${media}</div>
        <div class="detail-copy">
          <div class="detail-badges">
            <span class="badge">${product.category}</span>
            <span class="badge vendor">In Stock</span>
          </div>
          <h2>${product.name}</h2>
          <p class="detail-description">${product.description}</p>
          <div class="detail-specs">
            ${specs
              .map(
                (spec) =>
                  `<div class="detail-spec-row"><span>${spec.label}</span><span>${spec.value}</span></div>`
              )
              .join("")}
          </div>
          <div class="detail-price">${product.price}</div>
          <button class="detail-cta" type="button" id="detailWhatsappBtn">Ask on WhatsApp</button>
        </div>
      </div>
    </div>
  `;
}

function handleDetailKeydown(event) {
  if (event.key === "Escape") {
    closeProductDetail();
  }
}

function closeProductDetail() {
  const mount = document.getElementById("productDetailMount");
  if (mount) {
    mount.innerHTML = "";
  }
  document.body.style.overflow = "";
  document.removeEventListener("keydown", handleDetailKeydown);
  if (window.location.hash.startsWith("#product-")) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }
}

function openProductDetail(product) {
  const mount = document.getElementById("productDetailMount");
  if (!mount) {
    return;
  }

  mount.innerHTML = createProductDetailMarkup(product);
  document.body.style.overflow = "hidden";

  const overlay = document.getElementById("productDetailOverlay");
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeProductDetail();
    }
  });

  document.getElementById("detailCloseBtn").addEventListener("click", closeProductDetail);
  document.getElementById("detailWhatsappBtn").addEventListener("click", () => {
    openWhatsApp(buildProductWhatsAppMessage(product));
  });

  document.addEventListener("keydown", handleDetailKeydown);

  if (product.id) {
    history.replaceState(null, "", `#product-${product.id}`);
  }
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
  let allProducts = [];

  let activeCategory = "All";

  function getFilteredProducts() {
    const term = searchInput.value.trim().toLowerCase();
    const sortMode = sortSelect.value;

    let filtered = allProducts.filter((product) => {
      const matchesCategory = activeCategory === "All" || product.category === activeCategory;
      const haystack =
        `${product.name} ${product.category} ${product.brand} ${product.description}`.toLowerCase();
      return matchesCategory && haystack.includes(term);
    });

    if (sortMode === "az") {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortMode === "vendor") {
      filtered = filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return filtered;
  }

  function renderFilters() {
    filterRow.innerHTML = "";

    getCategories(allProducts).forEach((category) => {
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
    if (product.image_url) {
      return `
        <div class="product-media">
          <img src="${product.image_url}" alt="${product.name}" />
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
          <span class="badge vendor">In Stock</span>
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
      action.addEventListener("click", (event) => {
        event.stopPropagation();
        openWhatsApp(buildProductWhatsAppMessage(product));
      });

      card.addEventListener("click", () => openProductDetail(product));
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `View details for ${product.name}`);
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openProductDetail(product);
        }
      });

      card.appendChild(action);
      productGrid.appendChild(card);
    });
  }

  async function loadStoreProducts() {
    try {
      allProducts = await fetchProducts();
      renderFilters();
      renderProducts();
      openProductFromHash();
    } catch (error) {
      productGrid.innerHTML = '<div class="empty-state">Products are temporarily unavailable. Please try again.</div>';
    }
  }

  function openProductFromHash() {
    if (!window.location.hash.startsWith("#product-")) {
      return;
    }
    const targetId = window.location.hash.replace("#product-", "");
    const match = allProducts.find((product) => String(product.id) === targetId);
    if (match) {
      openProductDetail(match);
    }
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

  loadStoreProducts();
  handleBookingForm();
}

function initAdminPage() {
  const sellerForm = document.getElementById("sellerForm");
  if (!sellerForm) {
    return;
  }

  const adminAuth = document.getElementById("adminAuth");
  const adminApp = document.getElementById("adminApp");
  const loginForm = document.getElementById("loginForm");
  const loginStatus = document.getElementById("loginStatus");
  const adminProductList = document.getElementById("adminProductList");
  const clearVendorProductsButton = document.getElementById("clearVendorProducts");
  const logoutButton = document.getElementById("logoutButton");
  const seedProductsButton = document.getElementById("seedProductsButton");
  const adminStatus = document.getElementById("adminStatus");

  function setAdminState(isLoggedIn) {
    adminAuth.hidden = isLoggedIn;
    adminApp.hidden = !isLoggedIn;
  }

  async function renderAdminProducts() {
    const products = await fetchProducts();
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
      deleteButton.addEventListener("click", async () => {
        await deleteProductById(product.id);
        renderAdminProducts();
      });

      item.appendChild(deleteButton);
      adminProductList.appendChild(item);
    });
  }

  async function warmAdminServices() {
    loginStatus.textContent = "Preparing secure admin connection...";
    try {
      await Promise.allSettled([fetchProducts(), supabaseClient.auth.getSession()]);
      loginStatus.textContent = "";
    } catch (error) {
      loginStatus.textContent = "";
    }
  }

  async function seedStarterProducts() {
    const current = await fetchProducts();
    if (current.length) {
      adminStatus.textContent = "Products already exist, so starter products were not added.";
      return;
    }
    const { error } = await supabaseClient.from("products").insert(starterProducts);
    adminStatus.textContent = error ? "Starter products add failed." : "Starter products added.";
    await renderAdminProducts();
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    try {
      await loginWithRetry(email, password, loginStatus);
    } catch (error) {
      loginStatus.textContent = isFetchStyleError(error)
        ? "Secure server did not respond. Please wait 10 seconds and try again."
        : error.message;
      return;
    }
    loginStatus.textContent = "";
    setAdminState(true);
    await renderAdminProducts();
  });

  sellerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    adminStatus.textContent = "Saving product...";
    const imageInput = document.getElementById("sellerImage");
    const selectedFile = imageInput.files && imageInput.files[0] ? imageInput.files[0] : null;
    let imageUrl = null;

    if (selectedFile) {
      try {
        imageUrl = await uploadProductImage(selectedFile);
      } catch (error) {
        adminStatus.textContent = "Image upload failed.";
        return;
      }
    }

    const product = {
      name: document.getElementById("sellerProductName").value.trim(),
      category: document.getElementById("sellerCategory").value,
      brand: document.getElementById("sellerBrand").value.trim(),
      price: document.getElementById("sellerPrice").value.trim(),
      moq: document.getElementById("sellerMoq").value.trim(),
      image_url: imageUrl,
      description: document.getElementById("sellerDescription").value.trim(),
      is_active: true,
    };

    try {
      await createProduct(product);
      adminStatus.textContent = "Product saved.";
    } catch (error) {
      adminStatus.textContent = error.message || "Product save failed.";
      return;
    }
    sellerForm.reset();
    await renderAdminProducts();
  });

  seedProductsButton.addEventListener("click", seedStarterProducts);

  clearVendorProductsButton.addEventListener("click", async () => {
    adminStatus.textContent = "Removing all visible products...";
    const products = await fetchProducts();
    for (const product of products) {
      await deleteProductById(product.id);
    }
    adminStatus.textContent = "All products deleted.";
    await renderAdminProducts();
  });

  logoutButton.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    setAdminState(false);
    adminStatus.textContent = "";
  });

  supabaseClient.auth.getSession().then(async ({ data }) => {
    const loggedIn = Boolean(data.session);
    setAdminState(loggedIn);
    if (loggedIn) {
      await renderAdminProducts();
    }
  });

  warmAdminServices();
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

