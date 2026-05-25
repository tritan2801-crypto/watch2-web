/**
 * Page Orchestrator: ThankYouPage
 */
import MainNavbar from '../../components/MainNavbar.js';
import Footer from '../Home/Footer.js';
import ThankYouContent from './ThankYouContent.js';

const API_BASE_URL = "http://localhost:8000/api";

export default class ThankYouPage {
    constructor() {
        this.app = document.getElementById('app');
        this.user = null;
        this.navbar = null;
    }

    loadCartCount() {
        try {
            const data = localStorage.getItem('mvmt_cart');
            const cart = data ? JSON.parse(data) : [];
            return cart.reduce((total, item) => total + item.quantity, 0);
        } catch (e) {
            return 0;
        }
    }

    async checkAuthStatus() {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/me`, { credentials: 'include' });
            const data = await res.json();
            if (data.success && data.data) {
                this.user = data.data;
                if (this.navbar) this.navbar.setUser(data.data);
            }
        } catch (e) {
            console.error("Lỗi kiểm tra phiên đăng nhập:", e);
        }
    }

    async handleLogout() {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                this.user = null;
                if (this.navbar) this.navbar.setUser(null);
                window.location.hash = "#/login";
            }
        } catch (e) {
            console.error(e);
        }
    }

    async render() {
        await this.checkAuthStatus();
        this.app.innerHTML = '';

        // 1. Instantiate Navbar
        this.navbar = new MainNavbar({
            onCartClick: () => {},
            onLoginClick: () => { window.location.hash = "#/login"; },
            onLogoutClick: () => this.handleLogout()
        });
        if (this.user) {
            this.navbar.setUser(this.user);
        }
        this.navbar.setCartCount(this.loadCartCount());
        this.app.appendChild(this.navbar.render());

        // 2. Main content container
        const mainContainer = document.createElement('main');
        mainContainer.className = "min-h-[60vh] pt-20 bg-white dark:bg-bgDark transition-colors duration-500 flex items-center justify-center";
        mainContainer.appendChild(ThankYouContent.render());
        this.app.appendChild(mainContainer);

        // 3. Render Footer
        this.app.appendChild(Footer.render());

        window.scrollTo(0, 0);
    }
}
