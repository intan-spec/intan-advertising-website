// API helper functions for Neon database integration
// Use environment-specific API URL
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000'  // Local development
    : 'https://your-backend-url.railway.app';  // Production backend URL

// Products API
const ProductsAPI = {
    // Get all products
    async getAll() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/products`);
            if (!response.ok) throw new Error('Failed to fetch products');
            return await response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    // Get single product
    async getById(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
            if (!response.ok) throw new Error('Failed to fetch product');
            return await response.json();
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    },

    // Create new product
    async create(productData) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    location: productData.location,
                    image: productData.image,
                    category: productData.category,
                    status: productData.status,
                    size: productData.size,
                    area: productData.area,
                    orientation: productData.orientation,
                    viewing_direction: productData.viewingDirection,
                    traffic: productData.traffic,
                    description: productData.description,
                    maps_url: productData.mapsUrl,
                    drive_url: productData.driveUrl,
                    video_url: productData.videoUrl,
                    availability_date: productData.availabilityDate || null
                })
            });
            
            if (!response.ok) throw new Error('Failed to create product');
            return await response.json();
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    },

    // Update product
    async update(id, productData) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    location: productData.location,
                    image: productData.image,
                    category: productData.category,
                    status: productData.status,
                    size: productData.size,
                    area: productData.area,
                    orientation: productData.orientation,
                    viewing_direction: productData.viewingDirection,
                    traffic: productData.traffic,
                    description: productData.description,
                    maps_url: productData.mapsUrl,
                    drive_url: productData.driveUrl,
                    video_url: productData.videoUrl,
                    availability_date: productData.availabilityDate || null
                })
            });
            
            if (!response.ok) throw new Error('Failed to update product');
            return await response.json();
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    },

    // Delete product
    async delete(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete product');
            return await response.json();
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }
};

// Admin API
const AdminAPI = {
    // Login
    async login(username, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            
            if (!response.ok) throw new Error('Invalid credentials');
            return await response.json();
        } catch (error) {
            console.error('Error during login:', error);
            throw error;
        }
    },

    // Verify session
    async verifySession(token) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/verify/${token}`);
            if (!response.ok) throw new Error('Failed to verify session');
            return await response.json();
        } catch (error) {
            console.error('Error verifying session:', error);
            return { valid: false };
        }
    },

    // Logout
    async logout(token) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/logout/${token}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to logout');
            return await response.json();
        } catch (error) {
            console.error('Error during logout:', error);
            throw error;
        }
    }
};

// Helper function to convert database product to frontend format
function convertDatabaseProduct(dbProduct) {
    return {
        id: dbProduct.id,
        location: dbProduct.location,
        image: dbProduct.image,
        category: dbProduct.category,
        status: dbProduct.status,
        size: dbProduct.size,
        area: dbProduct.area,
        orientation: dbProduct.orientation,
        viewingDirection: dbProduct.viewing_direction,
        traffic: dbProduct.traffic,
        description: dbProduct.description,
        mapsUrl: dbProduct.maps_url,
        driveUrl: dbProduct.drive_url,
        videoUrl: dbProduct.video_url,
        availabilityDate: dbProduct.availability_date,
        lastUpdated: dbProduct.last_updated
    };
}

// Helper function to convert frontend product to database format
function convertFrontendProduct(frontendProduct) {
    return {
        location: frontendProduct.location,
        image: frontendProduct.image,
        category: frontendProduct.category,
        status: frontendProduct.status,
        size: frontendProduct.size,
        area: frontendProduct.area,
        orientation: frontendProduct.orientation,
        viewingDirection: frontendProduct.viewingDirection,
        traffic: frontendProduct.traffic,
        description: frontendProduct.description,
        mapsUrl: frontendProduct.mapsUrl,
        driveUrl: frontendProduct.driveUrl,
        videoUrl: frontendProduct.videoUrl,
        availabilityDate: frontendProduct.availabilityDate
    };
}