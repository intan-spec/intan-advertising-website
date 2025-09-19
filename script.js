// Global Variables
let products = [];
let filteredProducts = [];
let currentPage = 1;
let productsPerPage = 9;
let isAdminLoggedIn = false;
let currentEditingProduct = null;
let sortColumn = '';
let sortDirection = 'asc';
let adminToken = null;

// Sample Product Data
// Function to generate SVG placeholder
function generateSVGPlaceholder(width, height, bgColor, textColor, text) {
    return `data:image/svg+xml;base64,${btoa(`
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="${bgColor}"/>
            <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="18" font-weight="bold" 
                  text-anchor="middle" dominant-baseline="middle" fill="${textColor}">${text}</text>
        </svg>
    `)}`;
}

const sampleProducts = [
    {
        id: 1,
        location: "Jl. Ahmad Yani - Bekasi Timur",
        image: generateSVGPlaceholder(400, 200, "#1e3a8a", "#ffffff", "Videotron 1"),
        category: "Videotron",
        status: "Available",
        size: "6m x 12m",
        area: "Bekasi Timur",
        orientation: "Landscape",
        viewingDirection: "North-South",
        traffic: "High",
        description: "Strategic videotron location with high visibility on main road Ahmad Yani.",
        mapsUrl: "https://maps.google.com",
        driveUrl: "https://drive.google.com",
        videoUrl: "https://youtube.com",
        availabilityDate: "",
        lastUpdated: new Date().toISOString()
    },
    {
        id: 2,
        location: "Jl. Raya Bekasi - Bekasi Barat",
        image: generateSVGPlaceholder(400, 200, "#8b5cf6", "#ffffff", "Billboard 1"),
        category: "Billboard",
        status: "Booked",
        size: "4m x 8m",
        area: "Bekasi Barat",
        orientation: "Landscape",
        viewingDirection: "East-West",
        traffic: "Medium",
        description: "Premium billboard location with excellent brand exposure.",
        mapsUrl: "https://maps.google.com",
        driveUrl: "https://drive.google.com",
        videoUrl: "https://youtube.com",
        availabilityDate: "2024-03-15",
        lastUpdated: new Date().toISOString()
    },
    {
        id: 3,
        location: "Mall Bekasi Square - Bekasi Selatan",
        image: generateSVGPlaceholder(400, 200, "#60a5fa", "#ffffff", "Signage 1"),
        category: "Signage",
        status: "Sold",
        size: "2m x 3m",
        area: "Bekasi Selatan",
        orientation: "Portrait",
        viewingDirection: "Multi-directional",
        traffic: "Very High",
        description: "Indoor signage at popular shopping mall with heavy foot traffic.",
        mapsUrl: "https://maps.google.com",
        driveUrl: "https://drive.google.com",
        videoUrl: "https://youtube.com",
        availabilityDate: "2024-06-01",
        lastUpdated: new Date().toISOString()
    },
    {
        id: 4,
        location: "Jl. Kalimalang - Bekasi Utara",
        image: generateSVGPlaceholder(400, 200, "#1e3a8a", "#ffffff", "Videotron 2"),
        category: "Videotron",
        status: "Available",
        size: "8m x 16m",
        area: "Bekasi Utara",
        orientation: "Landscape",
        viewingDirection: "North-South",
        traffic: "High",
        description: "Large videotron with digital display capabilities on busy Kalimalang road.",
        mapsUrl: "https://maps.google.com",
        driveUrl: "https://drive.google.com",
        videoUrl: "https://youtube.com",
        availabilityDate: "",
        lastUpdated: new Date().toISOString()
    },
    {
        id: 5,
        location: "Summarecon Bekasi - Bekasi Barat",
        image: generateSVGPlaceholder(400, 200, "#8b5cf6", "#ffffff", "Billboard 2"),
        category: "Billboard",
        status: "Available",
        size: "6m x 10m",
        area: "Bekasi Barat",
        orientation: "Landscape",
        viewingDirection: "East-West",
        traffic: "Very High",
        description: "Premium location near Summarecon mall with excellent visibility.",
        mapsUrl: "https://maps.google.com",
        driveUrl: "https://drive.google.com",
        videoUrl: "https://youtube.com",
        availabilityDate: "",
        lastUpdated: new Date().toISOString()
    },
    {
        id: 6,
        location: "Terminal Bekasi - Bekasi Timur",
        image: generateSVGPlaceholder(400, 200, "#60a5fa", "#ffffff", "Signage 2"),
        category: "Signage",
        status: "Available",
        size: "3m x 4m",
        area: "Bekasi Timur",
        orientation: "Landscape",
        viewingDirection: "Multi-directional",
        traffic: "High",
        description: "Strategic signage location at main transportation hub.",
        mapsUrl: "https://maps.google.com",
        driveUrl: "https://drive.google.com",
        videoUrl: "https://youtube.com",
        availabilityDate: "",
        lastUpdated: new Date().toISOString()
    }
];

// Initialize Application
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Check admin login status from localStorage (for session persistence)
        adminToken = localStorage.getItem('intanAdminToken');
        if (adminToken) {
            const sessionValid = await AdminAPI.verifySession(adminToken);
            isAdminLoggedIn = sessionValid.valid;
            if (!isAdminLoggedIn) {
                localStorage.removeItem('intanAdminToken');
                adminToken = null;
            }
        }
        
        // Load products from API
        await loadProducts();
        
        showAdminControls();
        
        // Initialize filters and display
        initializeFilters();
        filterAndDisplayProducts();
        
        // Add event listeners
        addEventListeners();
    } catch (error) {
        console.error('Error initializing application:', error);
        // Fallback to sample data if API fails
        products = [...sampleProducts];
        initializeFilters();
        filterAndDisplayProducts();
        addEventListeners();
    }
});

// Load products from API
async function loadProducts() {
    try {
        const apiProducts = await ProductsAPI.getAll();
        products = apiProducts.map(convertDatabaseProduct);
    } catch (error) {
        console.error('Error loading products from API:', error);
        // Fallback to sample data
        products = [...sampleProducts];
    }
}

// Function to convert database product to UI product
function convertDatabaseProduct(product) {
    return {
        id: product.id,
        location: product.location,
        image: product.image,
        category: product.category,
        status: product.status,
        size: product.size,
        area: product.area,
        orientation: product.orientation,
        viewingDirection: product.viewingDirection,
        traffic: product.traffic,
        description: product.description,
        mapsUrl: product.mapsUrl,
        driveUrl: product.driveUrl,
        videoUrl: product.videoUrl,
        availabilityDate: product.availabilityDate,
        lastUpdated: product.lastUpdated
    };
}

// Event Listeners
function addEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterAndDisplayProducts, 300));
    }
    
    // Filter dropdowns
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterAndDisplayProducts);
    }
    
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterAndDisplayProducts);
    }
    
    const areaFilter = document.getElementById('areaFilter');
    if (areaFilter) {
        areaFilter.addEventListener('change', filterAndDisplayProducts);
    }
    
    const sizeSort = document.getElementById('sizeSort');
    if (sizeSort) {
        sizeSort.addEventListener('change', filterAndDisplayProducts);
    }
    
    // Admin login form
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }
    
    // Product form
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
    
    // Table filters
    const tableSearchInput = document.getElementById('tableSearchInput');
    if (tableSearchInput) {
        tableSearchInput.addEventListener('input', debounce(filterTable, 300));
    }
    
    const tableStatusFilter = document.getElementById('tableStatusFilter');
    if (tableStatusFilter) {
        tableStatusFilter.addEventListener('change', filterTable);
    }
    
    const tableCategoryFilter = document.getElementById('tableCategoryFilter');
    if (tableCategoryFilter) {
        tableCategoryFilter.addEventListener('change', filterTable);
    }
    
    const tableAreaFilter = document.getElementById('tableAreaFilter');
    if (tableAreaFilter) {
        tableAreaFilter.addEventListener('change', filterTable);
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function saveProducts() {
    // This function is no longer needed as we save directly through API calls
    // Keep it for compatibility but make it a no-op
    console.log('saveProducts called - data is now saved through API calls');
}

function generateId() {
    return Math.max(...products.map(p => p.id), 0) + 1;
}

function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('id-ID');
}

function getSizeValue(sizeString) {
    if (!sizeString) return 0;
    const matches = sizeString.match(/(\d+(?:\.\d+)?)/g);
    if (matches && matches.length >= 2) {
        return parseFloat(matches[0]) * parseFloat(matches[1]);
    } else if (matches && matches.length >= 1) {
        // Jika hanya ada satu angka, gunakan sebagai nilai tunggal
        return parseFloat(matches[0]);
    }
    return 0;
}

// Filter and Display Functions
function initializeFilters() {
    // Populate area filter options
    const areas = [...new Set(products.map(p => p.area))].sort();
    const areaFilter = document.getElementById('areaFilter');
    const tableAreaFilter = document.getElementById('tableAreaFilter');
    
    areas.forEach(area => {
        const option1 = new Option(area, area);
        const option2 = new Option(area, area);
        areaFilter.add(option1);
        tableAreaFilter.add(option2);
    });
}

function filterAndDisplayProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    const areaFilter = document.getElementById('areaFilter').value;
    const sizeSort = document.getElementById('sizeSort').value;
    
    // Filter products
    filteredProducts = products.filter(product => {
        const matchesSearch = product.location.toLowerCase().includes(searchTerm);
        const matchesStatus = !statusFilter || product.status === statusFilter;
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        const matchesArea = !areaFilter || product.area === areaFilter;
        
        return matchesSearch && matchesStatus && matchesCategory && matchesArea;
    });
    
    // Sort products
    if (sizeSort) {
        filteredProducts.sort((a, b) => {
            const sizeA = getSizeValue(a.size);
            const sizeB = getSizeValue(b.size);
            return sizeSort === 'asc' ? sizeA - sizeB : sizeB - sizeA;
        });
    }
    
    // Reset to first page
    currentPage = 1;
    
    // Display products
    displayProducts();
    displayPagination();
}

function displayProducts() {
    const grid = document.getElementById('productGrid');
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const pageProducts = filteredProducts.slice(startIndex, endIndex);
    
    if (pageProducts.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                <p style="color: var(--text-gray); font-size: 1.125rem;">No products found matching your criteria.</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = pageProducts.map(product => `
        <div class="product-card" data-id="${product.id}" onclick="openProductDetail(${product.id})">
            <div class="product-image" style="background-image: url('${product.image}')">
                <span class="status-badge status-${product.status.toLowerCase()}">${product.status}</span>
            </div>
            <div class="product-content">
                <h3 class="product-title">${product.location}</h3>
                <div class="product-meta">
                    <span><i class="fas fa-tag"></i> ${product.category}</span>
                    <span><i class="fas fa-expand-arrows-alt"></i> ${product.size}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${product.area}</span>
                </div>
                ${product.status === 'Sold' && product.availabilityDate ? 
                    `<p style="font-size: 0.875rem; color: var(--text-gray); margin-bottom: 1rem;">
                        Available from: ${formatDate(product.availabilityDate)}
                    </p>` : ''
                }
                <div class="product-actions">
                    <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); openProductDetail(${product.id})">
                        View Details
                    </button>
                </div>
                <div class="admin-actions ${isAdminLoggedIn ? 'show' : ''}">
                    <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); editProduct(${product.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); deleteProduct(${product.id})" style="background-color: var(--danger); color: white;">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function displayPagination() {
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i> Previous
        </button>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            paginationHTML += `
                <button onclick="changePage(${i})" ${i === currentPage ? 'class="active"' : ''}>
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            paginationHTML += '<span>...</span>';
        }
    }
    
    // Next button
    paginationHTML += `
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            Next <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    pagination.innerHTML = paginationHTML;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        displayProducts();
        displayPagination();
        
        // Scroll to products section
        document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    }
}

// Product Detail Functions
function openProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Populate product detail popup
    document.getElementById('mainProductImage').src = product.image;
    document.getElementById('productDetailTitle').textContent = product.location;
    document.getElementById('productCategory').textContent = product.category;
    document.getElementById('productSize').textContent = product.size;
    document.getElementById('productStatus').textContent = product.status;
    document.getElementById('productStatus').className = `status-badge status-${product.status.toLowerCase()}`;
    document.getElementById('productArea').textContent = product.area;
    document.getElementById('productOrientation').textContent = product.orientation;
    document.getElementById('productViewingDirection').textContent = product.viewingDirection;
    document.getElementById('productTraffic').textContent = product.traffic;
    document.getElementById('productDescription').textContent = product.description;
    
    // Set links
    document.getElementById('googleMapsLink').href = product.mapsUrl || '#';
    document.getElementById('googleDriveLink').href = product.driveUrl || '#';
    document.getElementById('videoPreviewLink').href = product.videoUrl || '#';
    
    // Show popup
    document.getElementById('productDetailPopup').classList.add('show');
}

function closeProductDetail() {
    document.getElementById('productDetailPopup').classList.remove('show');
}

// Admin Functions
function openAdminLogin() {
    document.getElementById('adminLoginPopup').classList.add('show');
}

function closeAdminLogin() {
    document.getElementById('adminLoginPopup').classList.remove('show');
    document.getElementById('adminLoginForm').reset();
}

// Update handleAdminLogin function
async function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    try {
        const response = await AdminAPI.login(username, password);
        isAdminLoggedIn = true;
        adminToken = response.token;
        localStorage.setItem('intanAdminToken', adminToken);
        showAdminControls();
        closeAdminLogin();
        alert('Login successful!');
    } catch (error) {
        console.error('Login error:', error);
        alert('Invalid credentials. Please try again.');
    }
}

function showAdminControls() {
    console.log('showAdminControls called, isAdminLoggedIn:', isAdminLoggedIn); // Debug log
    const adminControlsElement = document.getElementById('adminControls');
    
    if (isAdminLoggedIn) {
        console.log('Showing admin controls'); // Debug log
        adminControlsElement.style.display = 'flex';
        document.querySelectorAll('.admin-actions').forEach(el => el.classList.add('show'));
    } else {
        console.log('Hiding admin controls'); // Debug log
        adminControlsElement.style.display = 'none';
        document.querySelectorAll('.admin-actions').forEach(el => el.classList.remove('show'));
    }
}

async function logout() {
    try {
        if (adminToken) {
            await AdminAPI.logout(adminToken);
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    isAdminLoggedIn = false;
    adminToken = null;
    localStorage.removeItem('intanAdminToken');
    document.getElementById('adminControls').style.display = 'none';
    document.querySelectorAll('.admin-actions').forEach(el => el.classList.remove('show'));
}

// Product Management Functions
function openAddProductForm() {
    if (!isAdminLoggedIn) {
        alert('Anda harus login sebagai admin untuk mengakses fitur ini.');
        openAdminLogin();
        return;
    }
    currentEditingProduct = null;
    document.getElementById('productFormTitle').textContent = 'Add Product';
    document.getElementById('productForm').reset();
    document.getElementById('productFormPopup').classList.add('show');
}

function editProduct(productId) {
    if (!isAdminLoggedIn) {
        alert('Anda harus login sebagai admin untuk mengakses fitur ini.');
        openAdminLogin();
        return;
    }
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    currentEditingProduct = product;
    document.getElementById('productFormTitle').textContent = 'Edit Product';
    
    // Populate form
    document.getElementById('productLocation').value = product.location;
    document.getElementById('productImage').value = product.image;
    document.getElementById('productCategoryForm').value = product.category;
    document.getElementById('productStatusForm').value = product.status;
    document.getElementById('productDescriptionForm').value = product.description;
    document.getElementById('productSizeForm').value = product.size;
    document.getElementById('productOrientationForm').value = product.orientation;
    document.getElementById('productViewingDirectionForm').value = product.viewingDirection;
    document.getElementById('productTrafficForm').value = product.traffic;
    document.getElementById('productAreaForm').value = product.area;
    document.getElementById('productAvailabilityDate').value = product.availabilityDate;
    document.getElementById('productMapsUrl').value = product.mapsUrl;
    document.getElementById('productDriveUrl').value = product.driveUrl;
    document.getElementById('productVideoUrl').value = product.videoUrl;
    
    // Show existing image preview if available
    if (product.image && product.image.trim() !== '') {
        showImagePreview(product.image);
    }
    
    document.getElementById('productFormPopup').classList.add('show');
}

function closeProductForm() {
    document.getElementById('productFormPopup').classList.remove('show');
    currentEditingProduct = null;
    // Reset image preview when closing form
    removeImagePreview();
}

// Image Upload Functions
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
        alert('Format file tidak didukung. Gunakan JPG, JPEG, atau PNG.');
        event.target.value = '';
        return;
    }
    
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
        alert('Ukuran file terlalu besar. Maksimal 5MB.');
        event.target.value = '';
        return;
    }
    
    // Create FileReader to convert image to base64
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64String = e.target.result;
        
        // Store the base64 string in hidden input
        document.getElementById('productImage').value = base64String;
        
        // Show preview
        showImagePreview(base64String);
    };
    
    reader.readAsDataURL(file);
}

function showImagePreview(imageSrc) {
    const previewContainer = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    
    previewImg.src = imageSrc;
    previewContainer.style.display = 'block';
}

function removeImagePreview() {
    const previewContainer = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const fileInput = document.getElementById('productImageFile');
    const hiddenInput = document.getElementById('productImage');
    
    previewContainer.style.display = 'none';
    previewImg.src = '';
    fileInput.value = '';
    hiddenInput.value = '';
}

async function handleProductSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const imageUrl = document.getElementById('productImage').value;
    
    const productData = {
        location: document.getElementById('productLocation').value,
        category: document.getElementById('productCategoryForm').value,
        status: document.getElementById('productStatusForm').value,
        description: document.getElementById('productDescriptionForm').value,
        size: document.getElementById('productSizeForm').value,
        orientation: document.getElementById('productOrientationForm').value,
        viewingDirection: document.getElementById('productViewingDirectionForm').value,
        traffic: document.getElementById('productTrafficForm').value,
        area: document.getElementById('productAreaForm').value,
        availabilityDate: document.getElementById('productAvailabilityDate').value,
        mapsUrl: document.getElementById('productMapsUrl').value,
        driveUrl: document.getElementById('productDriveUrl').value,
        videoUrl: document.getElementById('productVideoUrl').value,
        image: imageUrl && imageUrl.trim() !== '' ? imageUrl : 'https://via.placeholder.com/400x200/1e3a8a/ffffff?text=New+Product'
    };
    
    try {
        if (currentEditingProduct) {
            // Update existing product
            await ProductsAPI.update(currentEditingProduct.id, productData);
            alert('Product updated successfully!');
        } else {
            // Add new product
            await ProductsAPI.create(productData);
            alert('Product added successfully!');
        }
        
        // Reload products from API
        await loadProducts();
        initializeFilters();
        filterAndDisplayProducts();
        closeProductForm();
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Error saving product. Please try again.');
    }
}

// Update deleteProduct function
async function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            await ProductsAPI.delete(productId);
            
            // Reload products from API
            await loadProducts();
            initializeFilters();
            filterAndDisplayProducts();
            alert('Product deleted successfully!');
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error deleting product. Please try again.');
        }
    }
}

// Table Functions
function openAllProductsTable() {
    if (!isAdminLoggedIn) {
        alert('Anda harus login sebagai admin untuk mengakses fitur ini.');
        openAdminLogin();
        return;
    }
    displayAllProductsTable();
    document.getElementById('allProductsPopup').classList.add('show');
}

function closeAllProductsTable() {
    document.getElementById('allProductsPopup').classList.remove('show');
}

function displayAllProductsTable() {
    const tbody = document.getElementById('allProductsTableBody');
    
    tbody.innerHTML = products.map(product => `
        <tr data-id="${product.id}">
            <td><img src="${product.image}" alt="${product.location}" class="table-thumbnail"></td>
            <td>${product.location}</td>
            <td>${product.category}</td>
            <td>${product.size}</td>
            <td><span class="status-badge status-${product.status.toLowerCase()}">${product.status}</span></td>
            <td>${product.area}</td>
            <td><a href="${product.mapsUrl}" target="_blank" class="btn btn-sm btn-secondary">Maps</a></td>
            <td>${formatDate(product.lastUpdated)}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})" style="background-color: var(--danger); color: white; margin-left: 0.5rem;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function filterTable() {
    const searchTerm = document.getElementById('tableSearchInput').value.toLowerCase();
    const statusFilter = document.getElementById('tableStatusFilter').value;
    const categoryFilter = document.getElementById('tableCategoryFilter').value;
    const areaFilter = document.getElementById('tableAreaFilter').value;
    
    const rows = document.querySelectorAll('#allProductsTableBody tr');
    
    rows.forEach(row => {
        const product = products.find(p => p.id == row.dataset.id);
        if (!product) return;
        
        const matchesSearch = product.location.toLowerCase().includes(searchTerm);
        const matchesStatus = !statusFilter || product.status === statusFilter;
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        const matchesArea = !areaFilter || product.area === areaFilter;
        
        const shouldShow = matchesSearch && matchesStatus && matchesCategory && matchesArea;
        row.style.display = shouldShow ? '' : 'none';
    });
}

function sortTable(column) {
    if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortDirection = 'asc';
    }
    
    products.sort((a, b) => {
        let valueA, valueB;
        
        switch (column) {
            case 'location':
                valueA = a.location.toLowerCase();
                valueB = b.location.toLowerCase();
                break;
            case 'category':
                valueA = a.category;
                valueB = b.category;
                break;
            case 'size':
                valueA = getSizeValue(a.size);
                valueB = getSizeValue(b.size);
                break;
            case 'status':
                valueA = a.status;
                valueB = b.status;
                break;
            case 'area':
                valueA = a.area;
                valueB = b.area;
                break;
            case 'lastUpdated':
                valueA = new Date(a.lastUpdated);
                valueB = new Date(b.lastUpdated);
                break;
            default:
                return 0;
        }
        
        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    
    displayAllProductsTable();
    saveProducts();
}

// Close popups when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('popup-overlay')) {
        e.target.classList.remove('show');
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.popup-overlay.show').forEach(popup => {
            popup.classList.remove('show');
        });
    }
});

// Mobile menu toggle (if needed)
function toggleMobileMenu() {
    const nav = document.querySelector('.nav');
    nav.classList.toggle('mobile-open');
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animateElements = document.querySelectorAll('.product-card, .contact-method');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Performance optimization: Lazy loading for images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', lazyLoadImages);