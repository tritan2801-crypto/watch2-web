/**
 * Central Entry Point & Hash Router
 */
window.formatPrice = (price) => {
    return parseInt(price).toLocaleString('vi-VN') + 'đ';
};
import HomePage from './pages/Home/index.js';
import ProductsPage from './pages/Products/index.js';
import ProductDetailPage from './pages/Products/ProductDetail.js';
import CartPage from './pages/Cart/index.js';
import ProfilePage from './pages/Profile/index.js';
import AuthPage from './pages/Auth/index.js';
import ThankYouPage from './pages/ThankYou/index.js';
import AdminPage from './pages/Admin/index.js';

/**
 * Global Fetch Interceptor to decouple admin session from user-facing pages
 */
const originalFetch = window.fetch;
window.fetch = async function(...args) {
    const url = args[0];
    const urlString = typeof url === 'string' ? url : (url && url.url ? url.url : '');
    const isAuthMe = urlString.includes('/auth/me');
    const isAdminRoute = window.location.hash.startsWith('#/admin') || window.location.hash.startsWith('#admin');

    if (isAuthMe && !isAdminRoute) {
        try {
            const response = await originalFetch.apply(this, args);
            if (response.status === 200) {
                const clone = response.clone();
                const data = await clone.json();
                if (data.success && data.data && data.data.email === 'admin@mvmt.com') {
                    // Return simulated 401 Unauthorized for admin on user pages
                    return new Response(JSON.stringify({
                        success: false,
                        error: 'Chưa đăng nhập.'
                    }), {
                        status: 401,
                        statusText: 'Unauthorized',
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            }
            return response;
        } catch (e) {
            console.error("Fetch interceptor error:", e);
            return originalFetch.apply(this, args);
        }
    }
    return originalFetch.apply(this, args);
};

class AppRouter {
    constructor() {
        this.currentPage = null;
    }

    init() {
        // Router events
        window.addEventListener('hashchange', () => this.route());
        window.addEventListener('load', () => this.route());
    }

    async route() {
        const hash = window.location.hash || '#/';
        const app = document.getElementById('app');

        const isProductsRoute = hash.startsWith('#/products') || hash.startsWith('#products');
        const isCartRoute = hash.startsWith('#/cart') || hash.startsWith('#cart');
        const isProfileRoute = hash.startsWith('#/profile') || hash.startsWith('#profile');
        const isAuthRoute = hash.startsWith('#/login') || hash.startsWith('#login') || hash.startsWith('#/auth') || hash.startsWith('#auth');
        const isThankYouRoute = hash.startsWith('#/thankyou') || hash.startsWith('#thankyou');
        const isAdminRoute = hash.startsWith('#/admin') || hash.startsWith('#admin');
        const productMatch = hash.match(/^#\/product\/(\d+)$/) || hash.match(/^#product\/(\d+)$/);

        // Fetch current session details
        let user = null;
        try {
            const res = await fetch("http://localhost:8000/api/auth/me", { credentials: 'include' });
            if (res.status === 200) {
                const data = await res.json();
                if (data.success) {
                    user = data.data;
                }
            }
        } catch (e) {
            console.error("Router session check error:", e);
        }

        // ROUTE GUARDS:
        // 1. Admin Guard: If accessing the admin page, must be logged in as admin
        if (isAdminRoute) {
            if (!user || user.email !== 'admin@mvmt.com') {
                window.location.hash = '#/login';
                return;
            }
        }

        // 2. Authenticated Customer Guard: If user is logged in (as customer) and tries to go to login page, send to profile.
        if (user && isAuthRoute) {
            window.location.hash = '#/profile';
            return;
        }

        // --- Render Views ---
        if (isAuthRoute) {
            if (this.currentPage instanceof AuthPage) {
                return;
            }
            console.log("Loading Auth Page...");
            if (app) app.innerHTML = '';
            this.currentPage = new AuthPage();
            this.currentPage.render();
        } else if (isAdminRoute) {
            if (this.currentPage instanceof AdminPage) {
                return;
            }
            console.log("Loading Admin Page...");
            if (app) app.innerHTML = '';
            this.currentPage = new AdminPage();
            this.currentPage.render();
        } else if (isThankYouRoute) {
            if (this.currentPage instanceof ThankYouPage) {
                return;
            }
            console.log("Loading Thank You Page...");
            if (app) app.innerHTML = '';
            this.currentPage = new ThankYouPage();
            this.currentPage.render();
        } else if (isCartRoute) {
            if (this.currentPage instanceof CartPage) {
                return;
            }
            console.log("Loading Cart Page...");
            if (app) app.innerHTML = '';
            this.currentPage = new CartPage();
            this.currentPage.render();
        } else if (isProfileRoute) {
            if (this.currentPage instanceof ProfilePage) {
                return;
            }
            console.log("Loading Profile Page...");
            if (app) app.innerHTML = '';
            this.currentPage = new ProfilePage();
            this.currentPage.render();
        } else if (productMatch) {
            const productId = parseInt(productMatch[1]);
            if (this.currentPage instanceof ProductDetailPage && this.currentPage.productId === productId) {
                return;
            }
            console.log(`Loading Product Detail Page for ID ${productId}...`);
            if (app) app.innerHTML = '';
            this.currentPage = new ProductDetailPage(productId);
            this.currentPage.render();
        } else if (isProductsRoute) {
            if (this.currentPage instanceof ProductsPage) {
                // If we are already on ProductsPage, let it handle hash change internally
                this.currentPage.handleHashRoute();
                return;
            }
            console.log("Loading Products Catalog Page...");
            if (app) app.innerHTML = '';
            this.currentPage = new ProductsPage();
            this.currentPage.render();
        } else {
            if (this.currentPage instanceof HomePage) {
                // Already on HomePage, no need to re-render
                return;
            }
            console.log("Loading Home Page...");
            if (app) app.innerHTML = '';
            this.currentPage = new HomePage();
            this.currentPage.render();
        }
    }
}

// Start application
const router = new AppRouter();
router.init();

// --- Premium Luxury Global Micro-Interactions & UX ---

// 1. Dynamic Preloader
const preloader = document.createElement('div');
preloader.className = 'preloader';
preloader.innerHTML = `
    <div class="preloader-spinner"></div>
    <div class="preloader-brand">Đồng hồ A Tuấn</div>
`;
document.body.appendChild(preloader);

const fadeOutPreloader = () => {
    preloader.classList.add('fade-out');
    setTimeout(() => {
        if (document.body.contains(preloader)) {
            preloader.remove();
        }
    }, 800);
};

// Fade out when loaded, with a fallback
if (document.readyState === 'complete') {
    setTimeout(fadeOutPreloader, 400);
} else {
    window.addEventListener('load', () => setTimeout(fadeOutPreloader, 400));
    // Fallback if load event takes too long
    setTimeout(fadeOutPreloader, 2000);
}

// 2. Custom Trailing Cursor (Desktop only)
if (!('ontouchstart' in window) && window.innerWidth >= 1024) {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    const follower = document.createElement('div');
    follower.className = 'custom-cursor-follower';
    
    document.body.appendChild(cursor);
    document.body.appendChild(follower);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
        
        follower.style.left = `${e.clientX}px`;
        follower.style.top = `${e.clientY}px`;
    });

    document.addEventListener('mouseover', (e) => {
        const target = e.target;
        if (target.closest('a') || target.closest('button') || target.closest('.cursor-pointer') || target.closest('[id*="btn"]') || target.closest('[id*="Btn"]')) {
            cursor.classList.add('custom-cursor-hover');
            follower.classList.add('custom-cursor-follower-hover');
        }
    });

    document.addEventListener('mouseout', (e) => {
        const target = e.target;
        if (target.closest('a') || target.closest('button') || target.closest('.cursor-pointer') || target.closest('[id*="btn"]') || target.closest('[id*="Btn"]')) {
            cursor.classList.remove('custom-cursor-hover');
            follower.classList.remove('custom-cursor-follower-hover');
        }
    });
}

// 3. Scroll to Top button
const btnScrollTop = document.createElement('button');
btnScrollTop.className = 'scroll-to-top';
btnScrollTop.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
document.body.appendChild(btnScrollTop);

window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
        btnScrollTop.classList.add('show');
    } else {
        btnScrollTop.classList.remove('show');
    }
});

btnScrollTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
