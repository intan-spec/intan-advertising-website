const express = require('express');
const cors = require('cors');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:8000',
        'https://localhost:8000',
        'http://127.0.0.1:8000',
        'https://your-netlify-site.netlify.app',  // Replace with your Netlify URL
        'https://intan-advertising-website.onrender.com'  // Render frontend URL
    ],
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('.'));

// Database connection
const sql = neon(process.env.DATABASE_URL);

// Initialize database tables
async function initializeDatabase() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                location VARCHAR(255) NOT NULL,
                image TEXT,
                category VARCHAR(100) NOT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'Available',
                size VARCHAR(100),
                area VARCHAR(100),
                orientation VARCHAR(50),
                viewing_direction VARCHAR(100),
                traffic VARCHAR(50),
                description TEXT,
                maps_url TEXT,
                drive_url TEXT,
                video_url TEXT,
                availability_date DATE,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        await sql`
            CREATE TABLE IF NOT EXISTS admin_sessions (
                id SERIAL PRIMARY KEY,
                session_token VARCHAR(255) UNIQUE NOT NULL,
                username VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL
            )
        `;
        
        console.log('Database tables initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

// API Routes

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await sql`SELECT * FROM products ORDER BY created_at DESC`;
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await sql`SELECT * FROM products WHERE id = ${id}`;
        
        if (product.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(product[0]);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Create new product
app.post('/api/products', async (req, res) => {
    try {
        const {
            location,
            image,
            category,
            status,
            size,
            area,
            orientation,
            viewing_direction,
            traffic,
            description,
            maps_url,
            drive_url,
            video_url,
            availability_date
        } = req.body;

        const result = await sql`
            INSERT INTO products (
                location, image, category, status, size, area, orientation,
                viewing_direction, traffic, description, maps_url, drive_url,
                video_url, availability_date, last_updated
            ) VALUES (
                ${location}, ${image}, ${category}, ${status}, ${size}, ${area},
                ${orientation}, ${viewing_direction}, ${traffic}, ${description},
                ${maps_url}, ${drive_url}, ${video_url}, ${availability_date},
                CURRENT_TIMESTAMP
            ) RETURNING *
        `;

        res.status(201).json(result[0]);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            location,
            image,
            category,
            status,
            size,
            area,
            orientation,
            viewing_direction,
            traffic,
            description,
            maps_url,
            drive_url,
            video_url,
            availability_date
        } = req.body;

        const result = await sql`
            UPDATE products SET
                location = ${location},
                image = ${image},
                category = ${category},
                status = ${status},
                size = ${size},
                area = ${area},
                orientation = ${orientation},
                viewing_direction = ${viewing_direction},
                traffic = ${traffic},
                description = ${description},
                maps_url = ${maps_url},
                drive_url = ${drive_url},
                video_url = ${video_url},
                availability_date = ${availability_date},
                last_updated = CURRENT_TIMESTAMP
            WHERE id = ${id}
            RETURNING *
        `;

        if (result.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(result[0]);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await sql`DELETE FROM products WHERE id = ${id} RETURNING *`;
        
        if (result.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Simple authentication (in production, use proper password hashing)
        if (username === 'admin' && password === 'admin123') {
            const sessionToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            
            await sql`
                INSERT INTO admin_sessions (session_token, username, expires_at)
                VALUES (${sessionToken}, ${username}, ${expiresAt})
            `;
            
            res.json({ success: true, token: sessionToken });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Verify admin session
app.get('/api/admin/verify/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const session = await sql`
            SELECT * FROM admin_sessions 
            WHERE session_token = ${token} AND expires_at > CURRENT_TIMESTAMP
        `;
        
        if (session.length > 0) {
            res.json({ valid: true });
        } else {
            res.json({ valid: false });
        }
    } catch (error) {
        console.error('Error verifying session:', error);
        res.status(500).json({ error: 'Session verification failed' });
    }
});

// Admin logout
app.delete('/api/admin/logout/:token', async (req, res) => {
    try {
        const { token } = req.params;
        await sql`DELETE FROM admin_sessions WHERE session_token = ${token}`;
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
});

// Initialize database and start server
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Frontend available at http://localhost:${PORT}`);
    });
});