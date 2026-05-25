/**
 * Page Orchestrator: AuthPage (Dedicated Login & Register Page)
 */
import MainNavbar from '../../components/MainNavbar.js';
import Footer from '../Home/Footer.js';

const API_BASE_URL = "http://localhost:8000/api";

export default class AuthPage {
    constructor() {
        this.app = document.getElementById('app');
        this.user = null;
        this.cart = this.loadCart();
        this.state = 'login'; // 'login' or 'register'
        
        // Component Instances
        this.navbar = null;
        
        // UI Elements
        this.toastContainer = null;
    }

    loadCart() {
        try {
            const data = localStorage.getItem('mvmt_cart');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    getCartCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    showToast(message, type = 'success') {
        if (!this.toastContainer) {
            this.toastContainer = document.createElement('div');
            this.toastContainer.className = "fixed bottom-5 right-5 z-[3000] flex flex-col gap-3 max-w-sm w-full";
            document.body.appendChild(this.toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = `p-4 text-xs font-semibold tracking-wider uppercase shadow-xl flex justify-between items-center transform translate-y-10 opacity-0 transition-all duration-300 border-l-4 ${
            type === 'success' 
            ? 'bg-primary text-white border-accent' 
            : 'bg-white text-sale border-sale shadow-red-100'
        }`;

        const icon = type === 'success' 
            ? '<i class="fa-solid fa-circle-check text-accent mr-3 text-sm"></i>' 
            : '<i class="fa-solid fa-circle-exclamation text-sale mr-3 text-sm"></i>';

        toast.innerHTML = `
            <div class="flex items-center">
                ${icon}
                <span>${message}</span>
            </div>
            <button class="ml-4 hover:text-accent transition-colors"><i class="fa-solid fa-xmark"></i></button>
        `;

        toast.querySelector('button').onclick = () => {
            toast.classList.remove('opacity-100', 'translate-y-0');
            toast.classList.add('opacity-0', 'translate-y-10');
            setTimeout(() => toast.remove(), 300);
        };

        this.toastContainer.appendChild(toast);
        toast.offsetHeight; // force reflow
        toast.classList.remove('opacity-0', 'translate-y-10');
        toast.classList.add('opacity-100', 'translate-y-0');

        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.remove('opacity-100', 'translate-y-0');
                toast.classList.add('opacity-0', 'translate-y-10');
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    }

    async checkAuthStatus() {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/me`, { credentials: 'include' });
            const data = await res.json();
            if (data.success && data.data) {
                this.user = data.data;
                if (this.navbar) this.navbar.setUser(data.data);
                // Already authenticated, redirect to profile or admin
                if (this.user.email === 'admin@mvmt.com') {
                    window.location.hash = "#/admin";
                } else {
                    window.location.hash = "#/profile";
                }
                return true;
            }
            return false;
        } catch (e) {
            console.error("Lỗi kiểm tra phiên đăng nhập:", e);
            return false;
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
                this.showToast("Bạn đã đăng xuất thành công.");
                this.render();
            }
        } catch (e) {
            console.error(e);
            this.showToast("Lỗi kết nối tới máy chủ.", "error");
        }
    }

    async handleLoginSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const errDiv = form.querySelector('#loginError');
        errDiv.classList.add('hidden');

        const email = form.email.value;
        const password = form.password.value;
        const btn = form.querySelector('button[type="submit"]');

        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i> ĐANG ĐĂNG NHẬP...`;

        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });
            const data = await res.json();
            
            if (data.success) {
                this.user = data.data;
                if (this.navbar) this.navbar.setUser(data.data);
                this.showToast(`Chào mừng trở lại, ${this.user.name}!`);
                
                // Redirect back to profile page or open admin in a new tab
                if (this.user.email === 'admin@mvmt.com') {
                    window.open('#/admin', '_blank');
                    window.location.hash = "#/";
                } else {
                    setTimeout(() => {
                        window.location.hash = "#/profile";
                    }, 500);
                }
            } else {
                errDiv.textContent = data.error || "Sai tài khoản hoặc mật khẩu.";
                errDiv.classList.remove('hidden');
            }
        } catch (err) {
            errDiv.textContent = "Không kết nối được tới máy chủ API.";
            errDiv.classList.remove('hidden');
        } finally {
            btn.disabled = false;
            btn.innerHTML = "ĐĂNG NHẬP";
        }
    }

    async handleRegisterSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const errDiv = form.querySelector('#registerError');
        errDiv.classList.add('hidden');

        const name = form.name.value;
        const email = form.email.value;
        const password = form.password.value;
        const btn = form.querySelector('button[type="submit"]');

        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i> ĐANG TẠO...`;

        try {
            const res = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
                credentials: 'include'
            });
            const data = await res.json();
            
            if (data.success) {
                // Automatically log in
                const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                    credentials: 'include'
                });
                const loginData = await loginRes.json();
                
                if (loginData.success) {
                    this.user = loginData.data;
                    if (this.navbar) this.navbar.setUser(loginData.data);
                }
                
                this.showToast("Tạo tài khoản và đăng nhập thành công!");
                setTimeout(() => {
                    window.location.hash = "#/profile";
                }, 500);
            } else {
                errDiv.textContent = data.error || "Đăng ký không thành công.";
                errDiv.classList.remove('hidden');
            }
        } catch (err) {
            errDiv.textContent = "Không kết nối được tới máy chủ API.";
            errDiv.classList.remove('hidden');
        } finally {
            btn.disabled = false;
            btn.innerHTML = "ĐĂNG KÝ";
        }
    }

    toggleState(state) {
        if (state === this.state) return;
        this.state = state;
        this.renderAuthPanel();
    }

    renderAuthPanel() {
        const container = document.getElementById('authContainer');
        if (!container) return;

        if (this.state === 'login') {
            container.innerHTML = `
                <!-- Login View: Left side is Form, Right side is Men's Watch -->
                <div class="grid grid-cols-1 md:grid-cols-2 w-full h-full">
                    <!-- Left: Form -->
                    <div class="p-8 md:p-12 flex flex-col justify-center bg-white dark:bg-bgDarkSoft border-b md:border-b-0 md:border-r border-gray-100 dark:border-accent/30 transition-colors duration-500">
                        <div class="flex border-b border-gray-100 dark:border-accent/30 mb-8 font-sans">
                            <button class="flex-1 pb-4 text-center text-xs font-bold tracking-widest uppercase border-b-2 border-primary dark:border-accent text-primary dark:text-accent transition-all">ĐĂNG NHẬP</button>
                            <button id="tabRegisterBtn" class="flex-1 pb-4 text-center text-xs font-bold tracking-widest uppercase border-b-2 border-transparent text-gray-400 hover:text-primary dark:hover:text-accent transition-all">ĐĂNG KÝ</button>
                        </div>
                        
                        <form id="formLogin" class="flex flex-col gap-5">
                            <div>
                                <label class="block text-[10px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase mb-2">EMAIL ADDRESS</label>
                                <input type="email" name="email" required class="w-full border border-gray-200 dark:border-accent/30 bg-[#eff4fc]/50 dark:bg-bgDark px-4 py-3.5 text-xs tracking-wide text-primary dark:text-white focus:outline-none focus:border-accent focus:bg-white dark:focus:bg-transparent transition-colors font-sans">
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase mb-2">PASSWORD</label>
                                <div class="relative w-full">
                                    <input type="password" name="password" required class="w-full border border-gray-200 dark:border-accent/30 bg-[#eff4fc]/50 dark:bg-bgDark px-4 py-3.5 pr-10 text-xs tracking-wide text-primary dark:text-white focus:outline-none focus:border-accent focus:bg-white dark:focus:bg-transparent transition-colors font-sans">
                                    <button type="button" class="btn-toggle-password absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary dark:hover:text-accent transition-colors text-sm outline-none">
                                        <i class="fa-regular fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="text-sale text-xs hidden" id="loginError"></div>
                            <button type="submit" class="w-full bg-primary dark:bg-accent text-white text-xs font-bold tracking-widest uppercase py-4 hover:bg-accent dark:hover:bg-accentHover hover:text-white transition-all duration-300 mt-4">ĐĂNG NHẬP</button>
                        </form>
                    </div>

                    <!-- Right: Men's Watch Image -->
                    <div class="hidden md:block relative overflow-hidden bg-primary">
                        <img src="images/chrono_phantom.png" alt="Men's Luxury Watch" class="w-full h-full object-cover filter brightness-[0.75]">
                        <div class="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent flex flex-col justify-end p-12 text-white">
                            <span class="text-[10px] text-accent font-bold tracking-[0.25em] uppercase mb-2">MENS COLLECTION</span>
                            <h3 class="font-serif text-3xl font-normal tracking-wide leading-tight mb-2">Bold & Sophisticated</h3>
                            <p class="text-white/60 text-xs leading-relaxed max-w-xs font-sans">Designed for the go-getters, innovators, and dreamers.</p>
                        </div>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <!-- Register View: Left side is Form, Right side is Women's Watch -->
                <div class="grid grid-cols-1 md:grid-cols-2 w-full h-full">
                    <!-- Left: Form -->
                    <div class="p-8 md:p-12 flex flex-col justify-center bg-white dark:bg-bgDarkSoft border-b md:border-b-0 md:border-r border-gray-100 dark:border-accent/30 transition-colors duration-500">
                        <div class="flex border-b border-gray-100 dark:border-accent/30 mb-8 font-sans">
                            <button id="tabLoginBtn" class="flex-1 pb-4 text-center text-xs font-bold tracking-widest uppercase border-b-2 border-transparent text-gray-400 hover:text-primary dark:hover:text-accent transition-all font-sans">ĐĂNG NHẬP</button>
                            <button class="flex-1 pb-4 text-center text-xs font-bold tracking-widest uppercase border-b-2 border-primary dark:border-accent text-primary dark:text-accent transition-all font-sans">ĐĂNG KÝ</button>
                        </div>
                        
                        <form id="formRegister" class="flex flex-col gap-4">
                            <div>
                                <label class="block text-[10px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase mb-1">FULL NAME</label>
                                <input type="text" name="name" required class="w-full border border-gray-200 dark:border-accent/30 bg-[#eff4fc]/50 dark:bg-bgDark px-4 py-2.5 text-xs tracking-wide text-primary dark:text-white focus:outline-none focus:border-accent focus:bg-white dark:focus:bg-transparent transition-colors font-sans">
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase mb-1">EMAIL ADDRESS</label>
                                <input type="email" name="email" required class="w-full border border-gray-200 dark:border-accent/30 bg-[#eff4fc]/50 dark:bg-bgDark px-4 py-2.5 text-xs tracking-wide text-primary dark:text-white focus:outline-none focus:border-accent focus:bg-white dark:focus:bg-transparent transition-colors font-sans">
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase mb-1">PASSWORD (MIN 6 CHARS)</label>
                                <div class="relative w-full">
                                    <input type="password" name="password" required minlength="6" class="w-full border border-gray-200 dark:border-accent/30 bg-[#eff4fc]/50 dark:bg-bgDark px-4 py-2.5 pr-10 text-xs tracking-wide text-primary dark:text-white focus:outline-none focus:border-accent focus:bg-white dark:focus:bg-transparent transition-colors font-sans">
                                    <button type="button" class="btn-toggle-password absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary dark:hover:text-accent transition-colors text-sm outline-none">
                                        <i class="fa-regular fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="text-sale text-xs hidden" id="registerError"></div>
                            <button type="submit" class="w-full bg-primary dark:bg-accent text-white text-xs font-bold tracking-widest uppercase py-4 hover:bg-accent dark:hover:bg-accentHover hover:text-white transition-all duration-300 mt-4 font-sans">TẠO TÀI KHOẢN</button>
                        </form>
                    </div>

                    <!-- Right: Women's Watch Image -->
                    <div class="hidden md:block relative overflow-hidden bg-primary">
                        <img src="images/womens_ceramic.png" alt="Women's Luxury Watch" class="w-full h-full object-cover filter brightness-[0.75]">
                        <div class="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent flex flex-col justify-end p-12 text-white">
                            <span class="text-[10px] text-accent font-bold tracking-[0.25em] uppercase mb-2">WOMENS COLLECTION</span>
                            <h3 class="font-serif text-3xl font-normal tracking-wide leading-tight mb-2">Elegant & Timeless</h3>
                            <p class="text-white/60 text-xs leading-relaxed max-w-xs font-sans">Sleek styling and minimal design for every modern occasion.</p>
                        </div>
                    </div>
                </div>
            `;
        }

        // Bind events
        const tabRegisterBtn = container.querySelector('#tabRegisterBtn');
        const tabLoginBtn = container.querySelector('#tabLoginBtn');
        const formLogin = container.querySelector('#formLogin');
        const formRegister = container.querySelector('#formRegister');

        if (tabRegisterBtn) {
            tabRegisterBtn.onclick = () => this.toggleState('register');
        }
        if (tabLoginBtn) {
            tabLoginBtn.onclick = () => this.toggleState('login');
        }

        if (formLogin) {
            formLogin.onsubmit = (e) => this.handleLoginSubmit(e);
        }
        if (formRegister) {
            formRegister.onsubmit = (e) => this.handleRegisterSubmit(e);
        }

        // Eye icon toggle password visibility
        container.querySelectorAll('.btn-toggle-password').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                const input = btn.previousElementSibling;
                const icon = btn.querySelector('i');
                if (input.type === "password") {
                    input.type = "text";
                    icon.className = "fa-regular fa-eye-slash";
                } else {
                    input.type = "password";
                    icon.className = "fa-regular fa-eye";
                }
            };
        });
    }

    render() {
        this.app.innerHTML = '';

        // 1. Instantiate Navbar
        this.navbar = new MainNavbar({
            onCartClick: () => {},
            onLoginClick: () => {}, // On auth page already
            onLogoutClick: () => this.handleLogout()
        });
        if (this.user) {
            this.navbar.setUser(this.user);
        }
        this.navbar.setCartCount(this.getCartCount());

        // 2. Main layout content
        const main = document.createElement('main');
        main.className = "min-h-screen pt-20 flex items-center justify-center relative overflow-hidden";
        
        main.innerHTML = `
            <!-- Watch Background Image with Blurred dark overlay -->
            <div class="absolute inset-0 z-0 bg-cover bg-center transition-all duration-500" style="background-image: url('images/story_flatlay.png');">
                <div class="absolute inset-0 bg-black/65 backdrop-blur-md"></div>
            </div>

            <!-- Content Card -->
            <div class="relative z-10 w-[95%] max-w-5xl bg-white dark:bg-bgDarkSoft border border-gray-100 dark:border-accent/50 shadow-2xl flex flex-col md:flex-row overflow-hidden transition-all duration-500 rounded-none my-12" id="authContainer">
                <!-- Inner layout rendered dynamically via renderAuthPanel() -->
            </div>
        `;

        this.app.appendChild(this.navbar.render());
        this.app.appendChild(main);
        this.app.appendChild(Footer.render());

        // Initial render of the panel
        this.renderAuthPanel();

        // Check if user is already logged in
        this.checkAuthStatus();

        window.scrollTo(0, 0);
    }
}
