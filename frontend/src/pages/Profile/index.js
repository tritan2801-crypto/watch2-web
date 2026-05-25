/**
 * Page Orchestrator: ProfilePage
 */
import MainNavbar from '../../components/MainNavbar.js';
import Footer from '../Home/Footer.js';

const API_BASE_URL = window.API_BASE_URL || "http://localhost:8000/api";

export default class ProfilePage {
    constructor() {
        this.app = document.getElementById('app');
        this.user = null;
        this.orders = [];
        this.activeTab = 'profile'; // 'profile', 'password', 'orders'
        this.navbar = null;
        this.toastContainer = null;
    }

    // --- State Management ---
    loadCart() {
        try {
            const data = localStorage.getItem('mvmt_cart');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    getCartCount() {
        const cart = this.loadCart();
        return cart.reduce((total, item) => total + item.quantity, 0);
    }

    // --- Toast Notifications ---
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

    // --- API Calls ---
    async checkAuthStatus() {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/me`, { credentials: 'include' });
            const data = await res.json();
            if (data.success && data.data) {
                this.user = data.data;
                if (this.navbar) this.navbar.setUser(data.data);
                return true;
            }
            return false;
        } catch (e) {
            console.error("Lỗi kiểm tra phiên đăng nhập:", e);
            return false;
        }
    }

    async fetchOrders() {
        if (!this.user) return;
        try {
            const res = await fetch(`${API_BASE_URL}/orders/me`, { credentials: 'include' });
            const data = await res.json();
            if (data.success && data.data) {
                this.orders = data.data;
            }
        } catch (e) {
            console.error("Lỗi tải lịch sử đơn hàng:", e);
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
                this.showToast("Bạn đã đăng xuất thành công.");
                window.location.hash = "#/";
            }
        } catch (e) {
            console.error(e);
            this.showToast("Lỗi kết nối tới máy chủ.", "error");
        }
    }

    async updateProfile(e) {
        e.preventDefault();
        const form = e.target;
        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const btn = form.querySelector('button[type="submit"]');

        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i> ĐANG CẬP NHẬT...`;

        try {
            const res = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email }),
                credentials: 'include'
            });
            const data = await res.json();

            if (data.success) {
                this.user.name = name;
                this.user.email = email;
                if (this.navbar) this.navbar.setUser(this.user);
                this.showToast("Cập nhật thông tin cá nhân thành công!");
                this.renderActiveTabContent();
            } else {
                this.showToast(data.error || "Không thể cập nhật thông tin.", "error");
            }
        } catch (err) {
            console.error(err);
            this.showToast("Lỗi kết nối tới máy chủ.", "error");
        } finally {
            btn.disabled = false;
            btn.innerHTML = "LƯU THAY ĐỔI";
        }
    }

    async updatePassword(e) {
        e.preventDefault();
        const form = e.target;
        const current_password = form.currentPassword.value;
        const new_password = form.newPassword.value;
        const confirm_password = form.confirmPassword.value;
        const btn = form.querySelector('button[type="submit"]');
        const errDiv = document.getElementById('pwError');

        errDiv.classList.add('hidden');

        if (new_password !== confirm_password) {
            errDiv.textContent = "Mật khẩu xác nhận không khớp.";
            errDiv.classList.remove('hidden');
            return;
        }

        if (new_password.length < 6) {
            errDiv.textContent = "Mật khẩu mới phải chứa ít nhất 6 ký tự.";
            errDiv.classList.remove('hidden');
            return;
        }

        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i> ĐANG ĐỔI MẬT KHẨU...`;

        try {
            const res = await fetch(`${API_BASE_URL}/auth/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ current_password, new_password }),
                credentials: 'include'
            });
            const data = await res.json();

            if (data.success) {
                this.showToast("Thay đổi mật khẩu thành công!");
                form.reset();
            } else {
                errDiv.textContent = data.error || "Lỗi đổi mật khẩu.";
                errDiv.classList.remove('hidden');
            }
        } catch (err) {
            console.error(err);
            this.showToast("Lỗi kết nối tới máy chủ.", "error");
        } finally {
            btn.disabled = false;
            btn.innerHTML = "LƯU THAY ĐỔI";
        }
    }

    // --- Page Orchestration & Render ---
    async render() {
        this.app.innerHTML = `
            <div class="flex justify-center items-center py-40">
                <i class="fa-solid fa-spinner fa-spin text-3xl text-accent"></i>
            </div>
        `;

        // 1. Initial Load & Session Check
        const isLoggedIn = await this.checkAuthStatus();

        this.app.innerHTML = '';

        // 2. Instantiate Navbar
        this.navbar = new MainNavbar({
            onCartClick: () => {},
            onLoginClick: () => { window.location.hash = "#/login"; },
            onLogoutClick: () => this.handleLogout()
        });
        
        if (this.user) {
            this.navbar.setUser(this.user);
        }
        this.navbar.setCartCount(this.getCartCount());
        this.app.appendChild(this.navbar.render());

        if (!isLoggedIn) {
            this.renderLoginRequired();
            this.app.appendChild(Footer.render());
            return;
        }

        // Load orders
        await this.fetchOrders();

        // 3. Main layout
        const mainContainer = document.createElement('main');
        mainContainer.className = "min-h-[80vh] pt-28 pb-20 bg-bgLight dark:bg-bgDark transition-colors duration-500";
        mainContainer.innerHTML = `
            <div class="max-w-[1400px] w-full mx-auto px-6 md:px-12">
                <h1 class="font-serif text-3xl font-normal text-primary dark:text-white mb-10 tracking-wide">Trang Cá Nhân</h1>
                
                <div class="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
                    <!-- Left Sidebar Menu -->
                    <div class="bg-white dark:bg-bgDarkSoft border border-accent/50 dark:border-accent/40 p-6 flex flex-col gap-1 shadow-sm transition-colors">
                        <div class="flex items-center gap-4 border-b border-accent/40 dark:border-accent/30 pb-5 mb-5">
                            <div class="w-12 h-12 bg-accent/10 border border-accent/40 rounded-full flex justify-center items-center text-accent text-lg">
                                <i class="fa-solid fa-user"></i>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-xs font-bold text-primary dark:text-white tracking-wide truncate max-w-[180px]">${this.user.name}</span>
                                <span class="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">${this.user.role_name}</span>
                            </div>
                        </div>

                        <button id="menuProfile" class="w-full text-left py-3 px-4 text-xs font-bold tracking-wider uppercase transition-colors outline-none flex items-center gap-3 ${this.activeTab === 'profile' ? 'bg-primary dark:bg-white text-white dark:text-primary' : 'text-gray-500 dark:text-gray-400 hover:bg-bgLight dark:hover:bg-bgDark hover:text-primary dark:hover:text-white'}">
                            <i class="fa-regular fa-id-card text-sm"></i>
                            <span>Thông tin cá nhân</span>
                        </button>
                        
                        <button id="menuPassword" class="w-full text-left py-3 px-4 text-xs font-bold tracking-wider uppercase transition-colors outline-none flex items-center gap-3 ${this.activeTab === 'password' ? 'bg-primary dark:bg-white text-white dark:text-primary' : 'text-gray-500 dark:text-gray-400 hover:bg-bgLight dark:hover:bg-bgDark hover:text-primary dark:hover:text-white'}">
                            <i class="fa-solid fa-key text-sm"></i>
                            <span>Đổi mật khẩu</span>
                        </button>
                        
                        <button id="menuOrders" class="w-full text-left py-3 px-4 text-xs font-bold tracking-wider uppercase transition-colors outline-none flex items-center gap-3 ${this.activeTab === 'orders' ? 'bg-primary dark:bg-white text-white dark:text-primary' : 'text-gray-500 dark:text-gray-400 hover:bg-bgLight dark:hover:bg-bgDark hover:text-primary dark:hover:text-white'}">
                            <i class="fa-solid fa-box text-sm"></i>
                            <span>Lịch sử đơn hàng</span>
                        </button>
                        
                        <div class="border-t border-accent/40 dark:border-accent/30 my-4"></div>
                        
                        <button id="menuLogout" class="w-full text-left py-3 px-4 text-xs font-bold tracking-wider uppercase text-sale dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-colors outline-none flex items-center gap-3">
                            <i class="fa-solid fa-right-from-bracket text-sm"></i>
                            <span>Đăng xuất</span>
                        </button>
                    </div>

                    <!-- Right Main Content Panel -->
                    <div class="lg:col-span-3 bg-white dark:bg-bgDarkSoft border border-accent/50 dark:border-accent/40 p-8 md:p-10 shadow-sm transition-colors" id="profileContentPanel">
                        <!-- Dynamic Content Rendered Here -->
                    </div>
                </div>
            </div>
        `;

        this.app.appendChild(mainContainer);
        this.app.appendChild(Footer.render());

        // Bind sidebar menu events
        const menuProfile = mainContainer.querySelector('#menuProfile');
        const menuPassword = mainContainer.querySelector('#menuPassword');
        const menuOrders = mainContainer.querySelector('#menuOrders');
        const menuLogout = mainContainer.querySelector('#menuLogout');

        const switchTab = (tab) => {
            this.activeTab = tab;
            [menuProfile, menuPassword, menuOrders].forEach(btn => {
                btn.className = "w-full text-left py-3 px-4 text-xs font-bold tracking-wider uppercase transition-colors outline-none flex items-center gap-3 text-gray-500 dark:text-gray-400 hover:bg-bgLight dark:hover:bg-bgDark hover:text-primary dark:hover:text-white";
            });

            if (tab === 'profile') menuProfile.className = "w-full text-left py-3 px-4 text-xs font-bold tracking-wider uppercase transition-colors outline-none flex items-center gap-3 bg-primary dark:bg-white text-white dark:text-primary";
            if (tab === 'password') menuPassword.className = "w-full text-left py-3 px-4 text-xs font-bold tracking-wider uppercase transition-colors outline-none flex items-center gap-3 bg-primary dark:bg-white text-white dark:text-primary";
            if (tab === 'orders') menuOrders.className = "w-full text-left py-3 px-4 text-xs font-bold tracking-wider uppercase transition-colors outline-none flex items-center gap-3 bg-primary dark:bg-white text-white dark:text-primary";

            this.renderActiveTabContent();
        };

        menuProfile.onclick = () => switchTab('profile');
        menuPassword.onclick = () => switchTab('password');
        menuOrders.onclick = () => switchTab('orders');
        menuLogout.onclick = () => this.handleLogout();

        // Render initial active tab
        this.renderActiveTabContent();
        
        window.scrollTo(0, 0);
    }

    renderActiveTabContent() {
        const panel = document.getElementById('profileContentPanel');
        if (!panel) return;

        panel.innerHTML = '';

        if (this.activeTab === 'profile') {
            panel.innerHTML = `
                <h3 class="font-serif text-2xl font-normal text-primary dark:text-white mb-6 pb-4 border-b border-accent/40 dark:border-accent/30">Thông Tin Cá Nhân</h3>
                <form id="formUpdateProfile" class="flex flex-col gap-6 max-w-xl">
                    <div>
                        <label class="block text-[10px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase mb-2">HỌ TÊN CỦA BẠN</label>
                        <input type="text" name="name" value="${this.user.name}" required class="w-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-bgDark px-4 py-3 text-xs tracking-wide text-primary dark:text-white focus:outline-none focus:border-accent transition-colors font-sans">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase mb-2">ĐỊA CHỈ EMAIL</label>
                        <input type="email" name="email" value="${this.user.email}" required class="w-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-bgDark px-4 py-3 text-xs tracking-wide text-primary dark:text-white focus:outline-none focus:border-accent transition-colors font-sans">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-[10px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase mb-2">VAI TRÒ TÀI KHOẢN</label>
                            <input type="text" value="${this.user.role_name}" disabled class="w-full border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-bgDark/40 px-4 py-3 text-xs tracking-wide text-gray-400 dark:text-gray-500 cursor-not-allowed select-none font-sans font-semibold">
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase mb-2">NGÀY THAM GIA</label>
                            <input type="text" value="${new Date(this.user.created_at).toLocaleDateString('vi-VN')}" disabled class="w-full border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-bgDark/40 px-4 py-3 text-xs tracking-wide text-gray-400 dark:text-gray-500 cursor-not-allowed select-none font-sans font-semibold">
                        </div>
                    </div>
                    
                    <button type="submit" class="align-self-start bg-primary dark:bg-white text-white dark:text-primary text-xs font-bold tracking-widest uppercase py-4 px-10 hover:bg-accent dark:hover:bg-accent hover:text-white dark:hover:text-white transition-all duration-300 outline-none mt-4">LƯU THAY ĐỔI</button>
                </form>
            `;
            panel.querySelector('#formUpdateProfile').onsubmit = (e) => this.updateProfile(e);

        } else if (this.activeTab === 'password') {
            panel.innerHTML = `
                <h3 class="font-serif text-2xl font-normal text-primary dark:text-white mb-6 pb-4 border-b border-accent/40 dark:border-accent/30">Đổi Mật Khẩu</h3>
                <form id="formUpdatePassword" class="flex flex-col gap-6 max-w-xl">
                    <div>
                        <label class="block text-[10px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase mb-2">MẬT KHẨU HIỆN TẠI</label>
                        <input type="password" name="currentPassword" required class="w-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-bgDark px-4 py-3 text-xs tracking-wide text-primary dark:text-white focus:outline-none focus:border-accent transition-colors font-sans">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase mb-2">MẬT KHẨU MỚI</label>
                        <input type="password" name="newPassword" required minlength="6" class="w-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-bgDark px-4 py-3 text-xs tracking-wide text-primary dark:text-white focus:outline-none focus:border-accent transition-colors font-sans">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase mb-2">XÁC NHẬN MẬT KHẨU MỚI</label>
                        <input type="password" name="confirmPassword" required minlength="6" class="w-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-bgDark px-4 py-3 text-xs tracking-wide text-primary dark:text-white focus:outline-none focus:border-accent transition-colors font-sans">
                    </div>
                    
                    <div class="text-sale text-xs hidden" id="pwError"></div>
                    <button type="submit" class="align-self-start bg-primary dark:bg-white text-white dark:text-primary text-xs font-bold tracking-widest uppercase py-4 px-10 hover:bg-accent dark:hover:bg-accent hover:text-white dark:hover:text-white transition-all duration-300 outline-none mt-4">LƯU THAY ĐỔI</button>
                </form>
            `;
            panel.querySelector('#formUpdatePassword').onsubmit = (e) => this.updatePassword(e);

        } else if (this.activeTab === 'orders') {
            panel.innerHTML = `
                <h3 class="font-serif text-2xl font-normal text-primary dark:text-white mb-6 pb-4 border-b border-accent/40 dark:border-accent/30">Lịch Sử Đơn Hàng</h3>
                <div class="flex flex-col gap-6" id="profileOrdersList"></div>
            `;
            this.renderOrdersList();
        }
    }

    renderOrdersList() {
        const listDiv = document.getElementById('profileOrdersList');
        if (!listDiv) return;

        if (this.orders.length === 0) {
            listDiv.innerHTML = `
                <div class="text-center py-16 text-gray-400 dark:text-gray-500 flex flex-col items-center">
                    <i class="fa-solid fa-box-open text-4xl mb-4 opacity-50"></i>
                    <p class="text-xs font-semibold tracking-wider uppercase">Bạn chưa có đơn hàng nào.</p>
                </div>
            `;
            return;
        }

        this.orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = "border border-accent/40 dark:border-accent/30 bg-white dark:bg-bgDarkSoft shadow-sm flex flex-col overflow-hidden transition-colors duration-500";
            
            const date = new Date(order.created_at).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Set up order status styles
            let statusClass = "bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-400";
            let statusText = "Chờ xử lý";
            if (order.status === 'completed') {
                statusClass = "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-500 border border-green-100 dark:border-green-900/50";
                statusText = "Đã hoàn thành";
            } else if (order.status === 'pending') {
                statusClass = "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-500 border border-amber-100 dark:border-amber-900/50";
                statusText = "Chờ xử lý";
            } else if (order.status === 'cancelled') {
                statusClass = "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-500 border border-red-100 dark:border-red-900/50";
                statusText = "Đã hủy";
            }

            let itemsHtml = '';
            order.items.forEach(item => {
                itemsHtml += `
                    <div class="flex items-center gap-4 py-4 border-b border-accent/30 dark:border-accent/20 last:border-b-0">
                        <img src="${item.image_url}" alt="${item.product_title}" class="w-12 h-15 object-cover bg-bgLight dark:bg-bgDark border border-gray-100 dark:border-neutral-800 shrink-0">
                        <div class="flex-grow min-w-0">
                            <h5 class="text-xs font-bold text-primary dark:text-white truncate">${item.product_title}</h5>
                            <span class="text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide">Số lượng: ${item.quantity}</span>
                        </div>
                        <span class="text-xs font-bold text-primary dark:text-white shrink-0">${window.formatPrice(item.price)}</span>
                    </div>
                `;
            });

            orderCard.innerHTML = `
                <div class="bg-bgLight/50 dark:bg-bgDark/50 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-accent/40 dark:border-accent/30">
                    <div class="flex flex-col gap-1">
                        <div class="flex items-center gap-3">
                            <span class="text-xs font-bold text-primary dark:text-white tracking-wide">Đơn hàng #${order.id}</span>
                            <span class="text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full ${statusClass}">${statusText}</span>
                        </div>
                        <span class="text-[10px] font-semibold text-gray-400 dark:text-gray-500">${date}</span>
                    </div>
                    
                    <div class="flex flex-col md:items-end gap-1">
                        <span class="text-[10px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase">TỔNG TIỀN</span>
                        <span class="text-sm font-bold text-accent">${window.formatPrice(order.total_amount)}</span>
                    </div>
                </div>
                
                <div class="p-5 flex flex-col md:flex-row md:gap-10 justify-between items-stretch">
                    <!-- Products list -->
                    <div class="flex-grow flex flex-col">
                        <span class="text-[9px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase mb-3">Sản phẩm</span>
                        <div class="flex flex-col">
                            ${itemsHtml}
                        </div>
                    </div>
                    
                    <!-- Vertical Divider in desktop -->
                    <div class="hidden md:block w-px bg-neutral-100 dark:bg-neutral-800 self-stretch my-2"></div>
                    
                    <!-- Shipping Address details -->
                    <div class="w-full md:w-72 mt-5 md:mt-0 flex flex-col justify-start">
                        <span class="text-[9px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase mb-3">Địa chỉ giao hàng</span>
                        <p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-sans">${order.shipping_address}</p>
                    </div>
                </div>
            `;

            listDiv.appendChild(orderCard);
        });
    }

    renderLoginRequired() {
        this.app.innerHTML = '';
        const shell = document.createElement('main');
        shell.className = "min-h-[70vh] pt-32 pb-20 flex justify-center items-center bg-bgLight dark:bg-bgDark transition-colors duration-500";
        shell.innerHTML = `
            <div class="max-w-md w-full bg-white dark:bg-bgDarkSoft border border-accent/50 dark:border-accent/40 p-8 text-center shadow-sm mx-6 transition-colors duration-500">
                <div class="w-16 h-16 bg-sale/10 border border-sale/20 dark:border-sale/30 rounded-full flex justify-center items-center text-sale text-2xl mx-auto mb-6">
                    <i class="fa-solid fa-lock"></i>
                </div>
                <h2 class="font-serif text-2xl font-normal text-primary dark:text-white mb-3">Yêu Cầu Đăng Nhập</h2>
                <p class="text-xs text-gray-500 dark:text-gray-400 font-sans leading-relaxed mb-8 max-w-sm mx-auto">
                    Vui lòng đăng nhập vào tài khoản của bạn để xem thông tin cá nhân, cập nhật thông tin và kiểm tra lịch sử đơn hàng.
                </p>
                <button id="btnLoginRedirect" class="w-full bg-primary dark:bg-white text-white dark:text-primary text-xs font-bold tracking-widest uppercase py-4 hover:bg-accent dark:hover:bg-accent hover:text-white dark:hover:text-white transition-all duration-300 outline-none">ĐĂNG NHẬP NGAY</button>
            </div>
        `;
        this.app.appendChild(shell);

        shell.querySelector('#btnLoginRedirect').onclick = () => {
            if (this.navbar) this.navbar.onLoginClick();
        };
    }
}
