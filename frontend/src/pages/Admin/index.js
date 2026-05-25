/**
 * Page Orchestrator: AdminPage (Dedicated Admin Panel for admin@mvmt.com)
 */
const API_BASE_URL = "http://localhost:8000/api";

export default class AdminPage {
    constructor() {
        this.app = document.getElementById('app');
        this.user = null;
        this.activeTab = 'dashboard'; // 'dashboard', 'products', 'categories', 'orders', 'promos'
        this.activeOrderTab = 'all'; // 'all', 'pending', 'confirmed', 'delivered', 'pending_payment', 'paid'
        this.dateRange = '7days'; // 'today', '7days', 'month'
        this.searchQuery = '';
        this.selectedOrder = null;

        // Mock Datasets
        this.mockDataSets = {
            today: {
                totalRevenue: 61250000.00,
                totalOrders: 18,
                avgOrderValue: 3402750.00,
                conversionRate: 2.4,
                revenuePoints: [3000000, 6000000, 12000000, 18000000, 23750000, 35000000, 46250000, 61250000],
                revenueLabels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
                topProducts: [
                    { rank: 1, title: "Chrono Gold - Matte Black", sku: "MC-01-GOLD", category: "Đồng Hồ Nam", sales: 8, revenue: 28000000.00 },
                    { rank: 2, title: "Nova Stella - Rose Blush", sku: "WN-03-STELLA", category: "Đồng Hồ Nữ", sales: 6, revenue: 21000000.00 },
                    { rank: 3, title: "Voyager Blue - Tan Strap", sku: "MV-02-VOY", category: "Đồng Hồ Nam", sales: 4, revenue: 12250000.00 },
                ]
            },
            '7days': {
                totalRevenue: 461250000.00,
                totalOrders: 132,
                avgOrderValue: 3494250.00,
                conversionRate: 2.8,
                revenuePoints: [45000000, 105000000, 170000000, 227500000, 305000000, 377500000, 461250000],
                revenueLabels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
                topProducts: [
                    { rank: 1, title: "Chrono Gold - Matte Black", sku: "MC-01-GOLD", category: "Đồng Hồ Nam", sales: 48, revenue: 168000000.00 },
                    { rank: 2, title: "Nova Stella - Rose Blush", sku: "WN-03-STELLA", category: "Đồng Hồ Nữ", sales: 42, revenue: 147000000.00 },
                    { rank: 3, title: "Voyager Blue - Tan Strap", sku: "MV-02-VOY", category: "Đồng Hồ Nam", sales: 25, revenue: 76562500.00 },
                    { rank: 4, title: "Legacy Slim - Mesh Band", sku: "ML-04-LEGCY", category: "Đồng Hồ Nam", sales: 17, revenue: 69687500.00 },
                ]
            },
            month: {
                totalRevenue: 1972500000.00,
                totalOrders: 568,
                avgOrderValue: 3472500.00,
                conversionRate: 3.1,
                revenuePoints: [375000000, 775000000, 1200000000, 1550000000, 1972500000],
                revenueLabels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', 'Tuần 5'],
                topProducts: [
                    { rank: 1, title: "Chrono Gold - Matte Black", sku: "MC-01-GOLD", category: "Đồng Hồ Nam", sales: 210, revenue: 735000000.00 },
                    { rank: 2, title: "Nova Stella - Rose Blush", sku: "WN-03-STELLA", category: "Đồng Hồ Nữ", sales: 185, revenue: 647500000.00 },
                    { rank: 3, title: "Voyager Blue - Tan Strap", sku: "MV-02-VOY", category: "Đồng Hồ Nam", sales: 112, revenue: 343000000.00 },
                    { rank: 4, title: "Legacy Slim - Mesh Band", sku: "ML-04-LEGCY", category: "Đồng Hồ Nam", sales: 61, revenue: 247000000.00 },
                ]
            }
        };

        this.orders = [
            {
                id: 1024,
                date: '2026-05-24 14:32',
                customer: { name: 'Nguyễn Văn Hải', phone: '0912345678', email: 'hai.nguyen@gmail.com' },
                shippingAddress: { province: 'Thành phố Hồ Chí Minh', district: 'Quận 1', ward: 'Phường Bến Nghé', details: '12 Lê Lợi, P. Bến Nghé' },
                items: [
                    { id: 1, title: 'Chrono Gold - Matte Black', price: 3500000.00, quantity: 1, sku: 'MC-01-GOLD' },
                    { id: 2, title: 'Voyager Blue - Tan Strap', price: 3062500.00, quantity: 1, sku: 'MV-02-VOY' }
                ],
                couponCode: 'WELCOME10',
                subtotal: 6562500.00,
                discount: 656250.00,
                total: 5906250.00,
                status: 'pending',
                paymentStatus: 'pending_payment',
                shippingStatus: 'pending_shipping',
                paymentMethod: 'Chuyển khoản Ngân hàng',
                loading: false
            },
            {
                id: 1023,
                date: '2026-05-23 09:15',
                customer: { name: 'Trần Thị Thu Trang', phone: '0987654321', email: 'trang.ttt@yahoo.com' },
                shippingAddress: { province: 'Thành phố Hà Nội', district: 'Quận Hoàn Kiếm', ward: 'Phường Hàng Đào', details: '45 Hàng Đào' },
                items: [
                    { id: 3, title: 'Nova Stella - Rose Blush', price: 3500000.00, quantity: 2, sku: 'WN-03-STELLA' }
                ],
                couponCode: null,
                subtotal: 7000000.00,
                discount: 0.00,
                total: 7000000.00,
                status: 'confirmed',
                paymentStatus: 'paid',
                shippingStatus: 'pending_shipping',
                paymentMethod: 'Ví MoMo',
                loading: false
            },
            {
                id: 1022,
                date: '2026-05-22 18:40',
                customer: { name: 'Lê Hoàng Long', phone: '0905556677', email: 'long.lh@outlook.com' },
                shippingAddress: { province: 'Thành phố Đà Nẵng', district: 'Quận Hải Châu', ward: 'Phường Thạch Thang', details: '88 Quang Trung' },
                items: [
                    { id: 4, title: 'Legacy Slim - Mesh Band', price: 4125000.00, quantity: 1, sku: 'ML-04-LEGCY' }
                ],
                couponCode: 'MVMT10',
                subtotal: 4125000.00,
                discount: 412500.00,
                total: 3712500.00,
                status: 'completed',
                paymentStatus: 'paid',
                shippingStatus: 'delivered',
                paymentMethod: 'COD (Thanh toán khi nhận hàng)',
                loading: false
            },
            {
                id: 1021,
                date: '2026-05-21 11:22',
                customer: { name: 'Phạm Minh Quân', phone: '0944332211', email: 'quan.pm@gmail.com' },
                shippingAddress: { province: 'Thành phố Hải Phòng', district: 'Quận Hồng Bàng', ward: 'Phường Minh Khai', details: '15 Minh Khai' },
                items: [
                    { id: 2, title: 'Voyager Blue - Tan Strap', price: 3062500.00, quantity: 1, sku: 'MV-02-VOY' }
                ],
                couponCode: null,
                subtotal: 3062500.00,
                discount: 0.00,
                total: 3062500.00,
                status: 'pending',
                paymentStatus: 'paid',
                shippingStatus: 'pending_shipping',
                paymentMethod: 'Thẻ tín dụng (Credit Card)',
                loading: false
            }
        ];
    }

    async checkAuthStatus() {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/me`, { credentials: 'include' });
            const data = await res.json();
            if (data.success && data.data && data.data.email === 'admin@mvmt.com') {
                this.user = data.data;
                return true;
            }
            // If not authenticated or not admin, kick back to login page
            window.location.hash = "#/login";
            return false;
        } catch (e) {
            console.error("Lỗi kiểm tra quyền admin:", e);
            window.location.hash = "#/login";
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
                window.location.hash = "#/login";
            }
        } catch (e) {
            console.error(e);
        }
    }

    async render() {
        try {
            const isAuthorized = await this.checkAuthStatus();
            if (!isAuthorized) return;

            // Inject dynamic styles for gold borders and chart hover tooltip
            if (!document.getElementById('adminPanelStyles')) {
                const style = document.createElement('style');
                style.id = 'adminPanelStyles';
                style.textContent = `
                    /* Admin Gold Border Styling overrides (Light Mode) */
                    .admin-panel-container .border-neutral-250,
                    .admin-panel-container .border-neutral-200,
                    .admin-panel-container .border-r-neutral-200,
                    .admin-panel-container .border-b-neutral-200,
                    .admin-panel-container .border-t-neutral-200,
                    .admin-panel-container .border-l-neutral-200,
                    .admin-panel-container .border-neutral-300,
                    .admin-panel-container .border-neutral-100,
                    .admin-panel-container .divide-neutral-200 > *,
                    .admin-panel-container .divide-neutral-100 > * {
                        border-color: rgba(197, 160, 89, 0.35) !important;
                    }
                    .admin-panel-container line.stroke-neutral-100,
                    .admin-panel-container line.stroke-neutral-300 {
                        stroke: rgba(197, 160, 89, 0.15) !important;
                    }
                    
                    /* Admin Gold Border Styling overrides (Dark Mode) */
                    .dark .admin-panel-container .dark\\:border-neutral-850,
                    .dark .admin-panel-container .dark\\:border-neutral-800,
                    .dark .admin-panel-container .dark\\:border-r-neutral-800,
                    .dark .admin-panel-container .dark\\:border-b-neutral-800,
                    .dark .admin-panel-container .dark\\:border-t-neutral-800,
                    .dark .admin-panel-container .dark\\:border-l-neutral-800,
                    .dark .admin-panel-container .dark\\:divide-neutral-800\\/60 > * {
                        border-color: rgba(197, 160, 89, 0.3) !important;
                    }
                    .dark .admin-panel-container line.dark\\:stroke-neutral-800,
                    .dark .admin-panel-container line.dark\\:stroke-neutral-800\\/80 {
                        stroke: rgba(197, 160, 89, 0.15) !important;
                    }
                    
                    /* SVG Chart animations */
                    @keyframes dashPath {
                        to {
                            stroke-dashoffset: 0;
                        }
                    }
                    @keyframes fadeInDot {
                        to {
                            opacity: 1;
                        }
                    }
                    .chart-line-animated {
                        stroke-dasharray: 1000;
                        stroke-dashoffset: 1000;
                        animation: dashPath 1.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                    }
                    .chart-dot-active {
                        transition: r 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94), fill 0.25s, stroke 0.25s;
                    }
                    .chart-dot-active:hover {
                        r: 7.5px !important;
                        fill: #ffffff !important;
                        stroke: #c5a059 !important;
                        stroke-width: 2.5px !important;
                        cursor: pointer;
                    }
                    .chart-area-fadein {
                        opacity: 0;
                        animation: fadeInDot 1s ease-out 1.2s forwards;
                    }
                    
                    /* Tooltip layout */
                    .chart-tooltip {
                        position: absolute;
                        background: rgba(17, 17, 17, 0.95);
                        border: 1px solid rgba(197, 160, 89, 0.8);
                        color: #fff;
                        padding: 8px 12px;
                        font-size: 10px;
                        font-family: 'Montserrat', sans-serif;
                        letter-spacing: 0.1em;
                        pointer-events: none;
                        opacity: 0;
                        transform: translate(-50%, -100%);
                        transition: opacity 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94), left 0.1s ease-out, top 0.1s ease-out;
                        z-index: 100;
                        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                        border-radius: 0;
                    }
                    .chart-tooltip::after {
                        content: '';
                        position: absolute;
                        bottom: -5px;
                        left: 50%;
                        transform: translateX(-50%);
                        border-width: 5px 5px 0;
                        border-style: solid;
                        border-color: rgba(17, 17, 17, 0.95) transparent;
                        display: block;
                        width: 0;
                    }
                `;
                document.head.appendChild(style);
            }

            // Determine active tab from URL hash if available (e.g. #/admin/products -> products)
            const hash = window.location.hash || '';
            const match = hash.match(/^#\/admin\/([^\/]+)$/) || hash.match(/^#admin\/([^\/]+)$/);
            if (match && match[1]) {
                this.activeTab = match[1];
            } else {
                this.activeTab = 'dashboard';
            }

            // Render main layout structure
            this.app.innerHTML = `
                <div class="admin-panel-container min-h-screen bg-neutral-50 dark:bg-[#121212] text-neutral-900 dark:text-neutral-100 flex font-sans transition-colors duration-300">
                    <!-- Sidebar Backdrop -->
                    <div id="adminSidebarBackdrop" class="fixed inset-0 bg-black/50 z-40 hidden md:hidden backdrop-blur-sm"></div>

                    <!-- Sidebar -->
                    <aside id="adminSidebar" class="fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-[#1a1a1a] border-r border-neutral-200 dark:border-neutral-800 flex flex-col justify-between transition-transform duration-300 -translate-x-full md:translate-x-0">
                        <div>
                            <!-- Brand Header -->
                            <div class="h-20 flex items-center justify-between px-6 border-b border-neutral-200 dark:border-neutral-800">
                                <a href="#/admin" class="font-serif text-xl font-bold tracking-[0.2em] text-neutral-900 dark:text-white flex items-center gap-2">
                                    <span>A Tuấn</span>
                                    <span class="text-[8px] font-sans tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 uppercase">ADMIN</span>
                                </a>
                                <button id="closeSidebarBtn" class="md:hidden text-neutral-400 hover:text-neutral-950 dark:hover:text-white outline-none">
                                    <i class="fa-solid fa-xmark text-lg"></i>
                                </button>
                            </div>

                            <!-- Nav List -->
                            <nav class="p-4 space-y-1">
                                <button data-tab="dashboard" class="${this.getBtnClass('dashboard')}">
                                    <i class="fa-solid fa-chart-line text-sm w-5"></i>
                                    <span>TỔNG QUAN</span>
                                </button>

                                <button data-tab="products" class="${this.getBtnClass('products')}">
                                    <i class="fa-solid fa-box text-sm w-5"></i>
                                    <span>SẢN PHẨM</span>
                                </button>

                                <button data-tab="categories" class="${this.getBtnClass('categories')}">
                                    <i class="fa-solid fa-folder text-sm w-5"></i>
                                    <span>DANH MỤC</span>
                                </button>

                                <button data-tab="orders" class="${this.getBtnClass('orders')}">
                                    <i class="fa-solid fa-receipt text-sm w-5"></i>
                                    <span>ĐƠN HÀNG</span>
                                </button>

                                <button data-tab="promos" class="${this.getBtnClass('promos')}">
                                    <i class="fa-solid fa-tags text-sm w-5"></i>
                                    <span>MÃ GIẢM GIÁ</span>
                                </button>

                                <button data-tab="users" class="${this.getBtnClass('users')}">
                                    <i class="fa-solid fa-users text-sm w-5"></i>
                                    <span>DỮ LIỆU NGƯỜI DÙNG</span>
                                </button>
                            </nav>
                        </div>

                        <!-- Footer Profile Summary -->
                        <div class="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#1f1f1f]">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center font-bold text-xs">
                                    AD
                                </div>
                                <div class="flex-grow min-w-0">
                                    <div class="text-[10px] font-bold tracking-wider uppercase truncate">${this.user ? this.user.name : ''}</div>
                                    <div class="text-[9px] text-neutral-400 truncate">${this.user ? this.user.email : ''}</div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <!-- Main Content Frame -->
                    <div class="flex-1 flex flex-col md:pl-64 min-w-0">
                        <!-- Top Nav bar -->
                        <header class="h-20 sticky top-0 bg-white/70 dark:bg-[#1a1a1a]/70 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 z-30 flex items-center justify-between px-6 transition-all duration-300">
                            <div class="flex items-center gap-4">
                                <button id="openSidebarBtn" class="md:hidden text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white text-xl outline-none">
                                    <i class="fa-solid fa-bars"></i>
                                </button>
                                <div class="hidden sm:flex items-center gap-2 text-[10px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">
                                    <span>ADMIN PANEL</span>
                                    <span>/</span>
                                    <span id="adminBreadcrumb" class="text-neutral-900 dark:text-white">${this.activeTab}</span>
                                </div>
                            </div>

                            <!-- Top actions -->
                            <div class="flex items-center gap-4">
                                <!-- Theme Toggle -->
                                <button id="adminThemeBtn" class="w-10 h-10 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-900 dark:hover:border-neutral-400 transition-colors duration-200 outline-none">
                                    <i class="fa-regular fa-moon"></i>
                                </button>

                                <!-- Back to store button -->
                                <a href="#/" class="border border-neutral-250 dark:border-neutral-800 hover:border-neutral-900 dark:hover:border-neutral-400 text-[10px] font-bold tracking-widest uppercase px-4 py-2.5 transition-colors">
                                    <i class="fa-solid fa-store mr-1.5"></i> VÀO CỬA HÀNG
                                </a>

                                <div class="border-l border-neutral-200 dark:border-neutral-800 h-6"></div>

                                <button id="adminLogoutBtn" class="text-[10px] font-bold tracking-widest text-red-500 hover:text-red-600 uppercase outline-none">
                                    ĐĂNG XUẤT
                                </button>
                            </div>
                        </header>

                        <!-- Dynamic workspace content block -->
                        <main id="adminWorkspace" class="flex-grow p-6 md:p-8 overflow-y-auto">
                            <!-- Content dynamically loaded via JS -->
                        </main>
                    </div>
                </div>
                
                <!-- Modal Invoice Overlay -->
                <div id="invoiceModal" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm hidden">
                    <!-- Renders dynamically -->
                </div>
            `;

            this.bindGlobalEvents();
            this.renderWorkspace();
            window.scrollTo(0, 0);
        } catch (error) {
            console.error("CRITICAL RENDER ERROR:", error);
            if (this.app) {
                this.app.innerHTML = `
                    <div style="padding: 40px; max-width: 800px; margin: 40px auto; color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                        <h2 style="margin-top: 0; font-size: 20px; border-b: 1px solid #f5c6cb; padding-bottom: 10px;">Lỗi Hiển Thị Admin (Render Error)</h2>
                        <p style="font-weight: bold; font-size: 14px;">Error: ${error.message}</p>
                        <pre style="background: #ffffff; padding: 15px; border: 1px solid #e9ecef; border-radius: 4px; overflow-x: auto; font-size: 12px; line-height: 1.5; color: #333;">${error.stack}</pre>
                        <button onclick="window.location.reload()" style="margin-top: 15px; background: #721c24; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;">Tải lại trang</button>
                    </div>
                `;
            }
        }
    }

    getBtnClass(tabName) {
        return this.activeTab === tabName
            ? "admin-nav-btn w-full flex items-center gap-4 px-4 py-3.5 text-[11px] font-bold tracking-[0.15em] uppercase border transition-all duration-200 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 border-neutral-900 dark:border-white shadow-lg shadow-black/5"
            : "admin-nav-btn w-full flex items-center gap-4 px-4 py-3.5 text-[11px] font-bold tracking-[0.15em] uppercase border transition-all duration-200 bg-transparent border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white";
    }

    switchTab(target) {
        this.activeTab = target;
        const breadcrumb = document.getElementById('adminBreadcrumb');
        if (breadcrumb) breadcrumb.textContent = target;

        // Update active states visual buttons
        const buttons = document.querySelectorAll('.admin-nav-btn');
        buttons.forEach(btn => {
            if (btn.dataset.tab === target) {
                btn.className = "admin-nav-btn w-full flex items-center gap-4 px-4 py-3.5 text-[11px] font-bold tracking-[0.15em] uppercase border transition-all duration-200 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 border-neutral-900 dark:border-white shadow-lg shadow-black/5";
            } else {
                btn.className = "admin-nav-btn w-full flex items-center gap-4 px-4 py-3.5 text-[11px] font-bold tracking-[0.15em] uppercase border transition-all duration-200 bg-transparent border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white";
            }
        });

        this.renderWorkspace();
    }

    bindGlobalEvents() {
        const sidebar = document.getElementById('adminSidebar');
        const backdrop = document.getElementById('adminSidebarBackdrop');

        // Sidebar responsive triggers
        document.getElementById('openSidebarBtn').onclick = () => {
            sidebar.classList.remove('-translate-x-full');
            backdrop.classList.remove('hidden');
        };
        document.getElementById('closeSidebarBtn').onclick = () => {
            sidebar.classList.add('-translate-x-full');
            backdrop.classList.add('hidden');
        };
        backdrop.onclick = () => {
            sidebar.classList.add('-translate-x-full');
            backdrop.classList.add('hidden');
        };

        // Theme Switcher Sync
        const themeBtn = document.getElementById('adminThemeBtn');
        const updateThemeIcon = () => {
            const isDark = document.documentElement.classList.contains('dark');
            themeBtn.innerHTML = isDark 
                ? '<i class="fa-regular fa-sun"></i>' 
                : '<i class="fa-regular fa-moon"></i>';
        };
        updateThemeIcon();

        themeBtn.onclick = (e) => {
            e.preventDefault();
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('mvmt_theme', isDark ? 'dark' : 'light');
            updateThemeIcon();
        };

        // Logout
        document.getElementById('adminLogoutBtn').onclick = () => {
            this.handleLogout();
        };

        // Tab Navigation
        const buttons = document.querySelectorAll('.admin-nav-btn');
        buttons.forEach(btn => {
            btn.onclick = () => {
                const target = btn.dataset.tab;
                
                // Update URL hash, which will trigger hashchange event listener
                window.location.hash = `#/admin/${target}`;
                
                // Close sidebar on mobile
                sidebar.classList.add('-translate-x-full');
                backdrop.classList.add('hidden');
            };
        });

        // Listen to hash changes within Admin Page to switch tabs dynamically
        this.hashChangeListener = () => {
            const workspace = document.getElementById('adminWorkspace');
            if (!workspace) {
                window.removeEventListener('hashchange', this.hashChangeListener);
                return;
            }
            const hash = window.location.hash || '';
            const match = hash.match(/^#\/admin\/([^\/]+)$/) || hash.match(/^#admin\/([^\/]+)$/);
            if (match && match[1]) {
                const target = match[1];
                if (target !== this.activeTab) {
                    this.switchTab(target);
                }
            }
        };
        window.addEventListener('hashchange', this.hashChangeListener);
    }

    renderWorkspace() {
        const workspace = document.getElementById('adminWorkspace');
        this.workspaceEl = workspace; // Store reference
        
        if (this.activeTab === 'dashboard') {
            this.renderDashboard(workspace);
        } else if (this.activeTab === 'orders') {
            this.renderOrders(workspace);
        } else if (this.activeTab === 'products') {
            this.renderProducts(workspace);
        } else if (this.activeTab === 'categories') {
            this.renderCategories(workspace);
        } else if (this.activeTab === 'promos') {
            this.renderPromos(workspace);
        } else if (this.activeTab === 'users') {
            this.renderUsers(workspace);
        } else {
            // Placeholder template for other tabs
            workspace.innerHTML = `
                <div class="space-y-6">
                    <h2 class="font-serif text-2xl font-normal text-neutral-900 dark:text-white uppercase tracking-wider">${this.activeTab.toUpperCase()} MANAGEMENT</h2>
                    <div class="p-12 border border-neutral-200 dark:border-neutral-800 text-center text-neutral-400 dark:text-neutral-500 uppercase tracking-widest text-xs bg-white dark:bg-[#1a1a1a]">
                        Thành phần quản lý này đang được thiết lập hoặc tích hợp trong giai đoạn tiếp theo.
                    </div>
                </div>
            `;
        }
    }

    // --- Tab: Dashboard Analytics ---
    renderDashboard(el) {
        const activeData = this.mockDataSets[this.dateRange] || this.mockDataSets['7days'];
        
        // Calculate SVG line points
        const points = activeData.revenuePoints;
        const max = Math.max(...points);
        const width = 800;
        const height = 240;
        const padding = 30;
        const stepX = (width - padding * 2) / (points.length - 1);
        const scaleY = (height - padding * 2) / max;

        let path = '';
        let coords = [];
        points.forEach((p, idx) => {
            const x = padding + idx * stepX;
            const y = height - padding - (p * scaleY);
            path += `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
            coords.push({ x, y });
        });

        let dotsHtml = coords.map((c, idx) => {
            const val = points[idx];
            const label = activeData.revenueLabels[idx];
            return `<circle cx="${c.x}" cy="${c.y}" r="4.5" fill="#c5a059" class="chart-dot-active stroke-white dark:stroke-[#1a1a1a] opacity-0" stroke-width="1.5" data-val="${window.formatPrice(val)}" data-label="${label}" style="animation: fadeInDot 0.4s ease-out ${1.2 + (idx * 0.1)}s forwards;" />`;
        }).join('');

        el.innerHTML = `
            <div class="space-y-8 animate-fade-in">
                <!-- Top Filters -->
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
                    <div>
                        <h1 class="font-serif text-2xl font-normal text-neutral-900 dark:text-white uppercase tracking-wider">TỔNG QUAN HỆ THỐNG</h1>
                        <p class="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-1">Phân tích hiệu suất & thống kê doanh thu</p>
                    </div>

                    <div class="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 p-1 flex">
                        <button id="rangeTodayBtn" class="px-3 py-1.5 text-[9px] font-bold tracking-widest uppercase transition-colors ${this.dateRange === 'today' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950' : 'text-neutral-500 dark:text-neutral-400'}">Hôm nay</button>
                        <button id="range7DaysBtn" class="px-3 py-1.5 text-[9px] font-bold tracking-widest uppercase transition-colors ${this.dateRange === '7days' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950' : 'text-neutral-500 dark:text-neutral-400'}">7 ngày qua</button>
                        <button id="rangeMonthBtn" class="px-3 py-1.5 text-[9px] font-bold tracking-widest uppercase transition-colors ${this.dateRange === 'month' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950' : 'text-neutral-500 dark:text-neutral-400'}">Tháng này</button>
                    </div>
                </div>

                <!-- Stats Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 p-6 relative overflow-hidden">
                        <div class="flex justify-between items-start">
                            <span class="text-[9px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">TỔNG DOANH THU</span>
                            <span class="text-[9px] text-green-500 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 font-bold uppercase">+12%</span>
                        </div>
                        <div class="mt-4 font-serif text-3xl font-normal text-neutral-900 dark:text-white">${window.formatPrice(activeData.totalRevenue)}</div>
                        <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500/40 via-amber-500 to-transparent"></div>
                    </div>

                    <div class="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 p-6 relative overflow-hidden">
                        <div class="flex justify-between items-start">
                            <span class="text-[9px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">TỔNG ĐƠN HÀNG</span>
                            <span class="text-[9px] text-green-500 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 font-bold uppercase">+8.2%</span>
                        </div>
                        <div class="mt-4 font-serif text-3xl font-normal text-neutral-900 dark:text-white">${activeData.totalOrders}</div>
                        <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500/40 via-amber-500 to-transparent"></div>
                    </div>

                    <div class="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 p-6 relative overflow-hidden">
                        <div class="flex justify-between items-start">
                            <span class="text-[9px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">GIÁ TRỊ TRUNG BÌNH (AOV)</span>
                            <span class="text-[9px] text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 font-bold uppercase">+2.5%</span>
                        </div>
                        <div class="mt-4 font-serif text-3xl font-normal text-neutral-900 dark:text-white">${window.formatPrice(activeData.avgOrderValue)}</div>
                        <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500/40 via-amber-500 to-transparent"></div>
                    </div>

                    <div class="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 p-6 relative overflow-hidden">
                        <div class="flex justify-between items-start">
                            <span class="text-[9px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">TỶ LỆ CHUYỂN ĐỔI</span>
                            <span class="text-[9px] text-red-500 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 font-bold uppercase">-0.4%</span>
                        </div>
                        <div class="mt-4 font-serif text-3xl font-normal text-neutral-900 dark:text-white">${activeData.conversionRate}%</div>
                        <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500/40 via-amber-500 to-transparent"></div>
                    </div>
                </div>

                <!-- Chart -->
                <div class="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 p-6">
                    <div class="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4 mb-6">
                        <div>
                            <h2 class="text-xs font-bold tracking-widest text-neutral-900 dark:text-white uppercase font-sans">BIỂU ĐỒ DOANH THU XU HƯỚNG</h2>
                        </div>
                        <span class="text-[10px] text-amber-500 tracking-widest uppercase font-bold font-sans">Chỉ số: VNĐ</span>
                    </div>

                    <div class="relative w-full aspect-[8/3] min-h-[220px] chart-container-relative">
                        <div id="chartTooltip" class="chart-tooltip"></div>
                        
                        <svg viewBox="0 0 800 240" class="w-full h-full overflow-visible">
                            <!-- Grid lines -->
                            <line x1="30" y1="30" x2="770" y2="30" class="stroke-neutral-100 dark:stroke-neutral-800/80" stroke-width="1" stroke-dasharray="4" />
                            <line x1="30" y1="100" x2="770" y2="100" class="stroke-neutral-100 dark:stroke-neutral-800/80" stroke-width="1" stroke-dasharray="4" />
                            <line x1="30" y1="170" x2="770" y2="170" class="stroke-neutral-100 dark:stroke-neutral-800/80" stroke-width="1" stroke-dasharray="4" />
                            <line x1="30" y1="210" x2="770" y2="210" class="stroke-neutral-300 dark:stroke-neutral-800" stroke-width="1" />

                            <!-- Gradient Area -->
                            <defs>
                                <linearGradient id="adminAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#c5a059" stop-opacity="0.25"/>
                                    <stop offset="100%" stop-color="#c5a059" stop-opacity="0.00"/>
                                </linearGradient>
                            </defs>
                            <path d="${path} L ${coords[coords.length - 1].x.toFixed(1)} 210 L 30 210 Z" fill="url(#adminAreaGradient)" class="chart-area-fadein" />

                            <!-- Line path -->
                            <path d="${path}" fill="none" stroke="#c5a059" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="chart-line-animated" />
                            
                            <!-- Dots -->
                            ${dotsHtml}
                        </svg>

                        <!-- X Axis Labels -->
                        <div class="absolute left-0 right-0 bottom-0 px-[30px] flex justify-between text-[9px] font-bold tracking-wider text-neutral-400 uppercase select-none">
                            ${activeData.revenueLabels.map(l => `<span>${l}</span>`).join('')}
                        </div>
                    </div>
                </div>

                <!-- Top Products Table -->
                <div class="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 p-6">
                    <h2 class="text-xs font-bold tracking-widest text-neutral-900 dark:text-white uppercase mb-6 font-sans">TOP SẢN PHẨM BÁN CHẠY</h2>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase font-sans">
                                    <th class="pb-3 text-center w-12">HẠNG</th>
                                    <th class="pb-3">SẢN PHẨM</th>
                                    <th class="pb-3">SKU</th>
                                    <th class="pb-3">DANH MỤC</th>
                                    <th class="pb-3 text-center">ĐÃ BÁN</th>
                                    <th class="pb-3 text-right">TỔNG DOANH THU</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/60 text-xs font-medium font-sans">
                                ${activeData.topProducts.map(p => `
                                    <tr class="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10 transition-colors">
                                        <td class="py-4 text-center text-[10px] font-bold text-neutral-400">0${p.rank}</td>
                                        <td class="py-4 font-serif text-neutral-900 dark:text-white text-sm font-normal">${p.title}</td>
                                        <td class="py-4 text-neutral-500 dark:text-neutral-400 font-mono text-[10px] tracking-wider">${p.sku}</td>
                                        <td class="py-4">
                                            <span class="text-[9px] font-bold tracking-widest uppercase text-amber-500 bg-amber-500/5 px-2 py-0.5 border border-amber-500/10">${p.category}</span>
                                        </td>
                                        <td class="py-4 text-center font-bold text-neutral-800 dark:text-neutral-300">${p.sales} chiếc</td>
                                        <td class="py-4 text-right font-bold text-amber-500">${window.formatPrice(p.revenue)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Bind filter clicks
        document.getElementById('rangeTodayBtn').onclick = () => { this.dateRange = 'today'; this.renderWorkspace(); };
        document.getElementById('range7DaysBtn').onclick = () => { this.dateRange = '7days'; this.renderWorkspace(); };
        document.getElementById('rangeMonthBtn').onclick = () => { this.dateRange = 'month'; this.renderWorkspace(); };

        // Bind chart tooltip events
        const container = el.querySelector('.chart-container-relative');
        const tooltip = el.querySelector('#chartTooltip');
        const dots = el.querySelectorAll('.chart-dot-active');
        
        dots.forEach(dot => {
            dot.addEventListener('mouseenter', () => {
                const val = dot.getAttribute('data-val');
                const label = dot.getAttribute('data-label');
                
                tooltip.innerHTML = `
                    <div class="font-bold text-accent mb-0.5 text-center">${label}</div>
                    <div class="text-white font-extrabold text-[11px] font-sans">${val}</div>
                `;
                tooltip.style.opacity = '1';
            });
            
            dot.addEventListener('mousemove', (e) => {
                const containerRect = container.getBoundingClientRect();
                const x = e.clientX - containerRect.left;
                const y = e.clientY - containerRect.top - 15;
                
                tooltip.style.left = `${x}px`;
                tooltip.style.top = `${y}px`;
            });
            
            dot.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0';
            });
        });
    }

    // --- Tab: Orders List ---
    parseShippingAddress(str) {
        let fullName = "Khách vãng lai";
        let phone = "Không có";
        let paymentMethod = "COD";
        let detailAddress = str || "";

        if (str && str.includes('|')) {
            const parts = str.split('|');
            for (const part of parts) {
                const trimmed = part.trim();
                if (trimmed.startsWith('Họ tên:')) {
                    fullName = trimmed.replace('Họ tên:', '').trim();
                } else if (trimmed.startsWith('SĐT:')) {
                    phone = trimmed.replace('SĐT:', '').trim();
                } else if (trimmed.startsWith('PTTT:')) {
                    paymentMethod = trimmed.replace('PTTT:', '').trim();
                } else if (trimmed.startsWith('ĐC:')) {
                    detailAddress = trimmed.replace('ĐC:', '').trim();
                }
            }
        }
        return { fullName, phone, paymentMethod, detailAddress };
    }

    calculateNextOrderStatus(currentStatus, paymentStatus, shippingStatus) {
        let status = currentStatus;
        if (status === 'confirmed' && paymentStatus === 'paid' && shippingStatus === 'delivered') {
            status = 'completed';
        }
        if (status === 'completed' && (paymentStatus !== 'paid' || shippingStatus !== 'delivered')) {
            status = 'confirmed';
        }
        return status;
    }

    // --- Tab: Orders List ---
    async renderOrders(el) {
        el.innerHTML = `
            <div class="flex items-center justify-center p-12">
                <i class="fa-solid fa-spinner fa-spin text-amber-500 text-2xl"></i>
            </div>
        `;

        try {
            const res = await fetch(`${API_BASE_URL}/orders`, { credentials: 'include' });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.error || "Không thể lấy dữ liệu đơn hàng.");
            }

            this.orders = data.data.map(o => {
                const parsed = this.parseShippingAddress(o.shipping_address);
                return {
                    id: o.id,
                    date: o.created_at,
                    customer: {
                        name: parsed.fullName,
                        phone: parsed.phone,
                        email: o.user_email || 'Khách vãng lai'
                    },
                    shippingAddress: {
                        province: '',
                        district: '',
                        ward: '',
                        details: parsed.detailAddress
                    },
                    items: (o.items || []).map(item => ({
                        id: item.product_id,
                        title: item.product_title || 'Sản phẩm đã xóa',
                        price: parseFloat(item.price),
                        quantity: parseInt(item.quantity),
                        sku: `WATCH-${item.product_id}`
                    })),
                    couponCode: null,
                    subtotal: parseFloat(o.total_amount),
                    discount: 0.00,
                    total: parseFloat(o.total_amount),
                    status: o.status,
                    paymentStatus: o.payment_status || 'pending_payment',
                    shippingStatus: o.shipping_status || 'pending_shipping',
                    paymentMethod: parsed.paymentMethod,
                    loading: false
                };
            });

            this.renderOrdersList(el);
        } catch (e) {
            el.innerHTML = `
                <div class="p-12 border border-neutral-200 dark:border-neutral-800 text-center text-red-500 bg-white dark:bg-[#1a1a1a]">
                    <i class="fa-solid fa-triangle-exclamation text-2xl mb-2 text-sale"></i>
                    <p class="text-xs font-bold uppercase tracking-wider">Lỗi tải dữ liệu đơn hàng</p>
                    <p class="text-xs text-neutral-400 dark:text-neutral-500 mt-1">${e.message}</p>
                </div>
            `;
        }
    }

    renderOrdersList(el) {
        const filtered = this.orders.filter(order => {
            let matchesTab = true;
            if (this.activeOrderTab === 'pending') matchesTab = order.status === 'pending';
            else if (this.activeOrderTab === 'confirmed') matchesTab = order.status === 'confirmed';
            else if (this.activeOrderTab === 'completed') matchesTab = order.status === 'completed';
            else if (this.activeOrderTab === 'shipping') matchesTab = order.shippingStatus === 'shipping';
            else if (this.activeOrderTab === 'delivered') matchesTab = order.shippingStatus === 'delivered';
            else if (this.activeOrderTab === 'pending_payment') matchesTab = order.paymentStatus === 'pending_payment';
            else if (this.activeOrderTab === 'paid') matchesTab = order.paymentStatus === 'paid';

            let matchesSearch = true;
            if (this.searchQuery) {
                const q = this.searchQuery.toLowerCase();
                matchesSearch = order.id.toString().includes(q) || 
                                order.customer.name.toLowerCase().includes(q) || 
                                order.customer.phone.includes(q);
            }
            return matchesTab && matchesSearch;
        });

        const activeBadgeClass = "border-b-2 border-amber-500 text-amber-500 font-extrabold";
        const inactiveBadgeClass = "border-transparent text-neutral-400 hover:text-neutral-900 dark:hover:text-white";

        el.innerHTML = `
            <div class="space-y-8 animate-fade-in relative">
                <!-- Header Block -->
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
                    <div>
                        <h1 class="font-serif text-2xl font-normal text-neutral-900 dark:text-white uppercase tracking-wider">QUẢN LÝ ĐƠN HÀNG</h1>
                        <p class="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-1">Quản lý giao dịch, vận chuyển & hóa đơn thanh toán</p>
                    </div>

                    <!-- Search -->
                    <div class="relative w-full md:w-80">
                        <input 
                            id="orderSearchInput"
                            type="text" 
                            value="${this.searchQuery}"
                            placeholder="TÌM THEO MÃ ĐƠN, TÊN, SĐT..."
                            class="w-full bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 text-[10px] font-bold tracking-widest uppercase p-4 pr-10 outline-none focus:border-amber-500 transition-colors placeholder-neutral-400 dark:placeholder-neutral-500"
                        />
                        <i class="fa-solid fa-magnifying-glass absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 text-xs"></i>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="border-b border-neutral-200 dark:border-neutral-800">
                    <div class="flex flex-wrap -mb-px">
                        ${[
                            { id: 'all', label: 'TẤT CẢ' },
                            { id: 'pending', label: '📥 ĐANG CHỜ' },
                            { id: 'confirmed', label: '✅ ĐÃ DUYỆT' },
                            { id: 'completed', label: '🎉 HOÀN THÀNH' },
                            { id: 'shipping', label: '🚚 ĐANG GIAO' },
                            { id: 'delivered', label: '📦 ĐÃ GIAO' },
                            { id: 'pending_payment', label: '⏳ CHỜ THANH TOÁN' },
                            { id: 'paid', label: '💳 ĐÃ THANH TOÁN' }
                        ].map(t => `
                            <button 
                                data-order-tab="${t.id}"
                                class="order-tab-btn border-b-2 py-4 px-6 text-[10px] font-bold tracking-widest uppercase transition-all duration-200 outline-none whitespace-nowrap ${this.activeOrderTab === t.id ? activeBadgeClass : inactiveBadgeClass}"
                            >
                                ${t.label}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Table -->
                <div class="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 overflow-hidden relative">
                    ${filtered.some(o => o.loading) ? `
                        <div class="absolute inset-0 bg-white/40 dark:bg-black/20 z-10 backdrop-blur-[1px] flex items-center justify-center">
                            <i class="fa-solid fa-spinner fa-spin text-amber-500 text-2xl"></i>
                        </div>
                    ` : ''}

                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase font-sans">
                                    <th class="p-6">MÃ ĐƠN</th>
                                    <th class="p-6">NGÀY ĐẶT</th>
                                    <th class="p-6">KHÁCH HÀNG</th>
                                    <th class="p-6">ĐỊA CHỈ</th>
                                    <th class="p-6 text-center">TRẠNG THÁI ĐƠN</th>
                                    <th class="p-6 text-center">THANH TOÁN</th>
                                    <th class="p-6 text-center">GIAO HÀNG</th>
                                    <th class="p-6 text-right">TỔNG CỘNG</th>
                                    <th class="p-6 text-center">THAO TÁC</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/60 text-xs font-semibold font-sans">
                                ${filtered.length === 0 ? `
                                    <tr>
                                        <td colspan="9" class="p-12 text-center text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Không tìm thấy đơn hàng nào</td>
                                    </tr>
                                ` : filtered.map(order => `
                                    <tr class="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10 transition-colors">
                                        <td class="p-6 font-bold text-neutral-900 dark:text-white font-mono">#${order.id}</td>
                                        <td class="p-6 text-neutral-400 dark:text-neutral-500 font-mono text-[11px] whitespace-nowrap">${order.date}</td>
                                        <td class="p-6">
                                            <div class="text-[12px] font-bold text-neutral-850 dark:text-neutral-200">${order.customer.name}</div>
                                            <div class="text-[10px] text-neutral-400 font-mono mt-0.5">${order.customer.phone}</div>
                                        </td>
                                        <td class="p-6 max-w-xs truncate">
                                            <div class="text-[11px] truncate">${order.shippingAddress.details}</div>
                                            <div class="text-[9px] text-neutral-400 uppercase tracking-wider truncate mt-0.5">${order.shippingAddress.province || 'Toàn quốc'}</div>
                                        </td>
                                        
                                        <!-- Order Status column -->
                                        <td class="p-6 text-center">
                                            ${order.status === 'pending' ? `
                                                <button 
                                                    data-order-id="${order.id}" 
                                                    class="btn-approve-order w-40 py-1.5 px-3 rounded-none text-[9px] font-bold tracking-wider uppercase border text-center cursor-pointer transition-all duration-200 bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-50 hover:text-white outline-none"
                                                    ${order.loading ? 'disabled' : ''}
                                                >
                                                    ĐANG CHỜ XỬ LÝ
                                                </button>
                                            ` : order.status === 'confirmed' ? `
                                                <span class="inline-block w-40 py-1.5 px-3 border text-[9px] font-bold tracking-wider uppercase text-center bg-blue-500/10 text-blue-500 border-blue-500/20 select-none">
                                                    ĐÃ DUYỆT
                                                </span>
                                            ` : `
                                                <span class="inline-block w-40 py-1.5 px-3 border text-[9px] font-bold tracking-wider uppercase text-center bg-green-500/10 text-green-500 border-green-500/20 select-none">
                                                    HOÀN THÀNH
                                                </span>
                                            `}
                                        </td>

                                        <!-- Payment Status dropdown -->
                                        <td class="p-6 text-center">
                                            <div class="relative inline-block w-48">
                                                <select 
                                                    data-order-id="${order.id}" 
                                                    class="select-payment-status w-full py-1.5 px-3 rounded-none text-[9px] font-bold tracking-wider uppercase border text-center appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all duration-200 ${this.getPaymentStatusBadgeClass(order.paymentStatus)}"
                                                    ${order.loading ? 'disabled' : ''}
                                                >
                                                    <option value="pending_payment" ${order.paymentStatus === 'pending_payment' ? 'selected' : ''}>ĐANG CHỜ THANH TOÁN</option>
                                                    <option value="paid" ${order.paymentStatus === 'paid' ? 'selected' : ''}>ĐÃ THANH TOÁN</option>
                                                </select>
                                                <i class="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[8px] pointer-events-none text-neutral-400"></i>
                                            </div>
                                        </td>

                                        <!-- Shipping Status dropdown -->
                                        <td class="p-6 text-center">
                                            <div class="relative inline-block w-40">
                                                <select 
                                                    data-order-id="${order.id}" 
                                                    class="select-shipping-status w-full py-1.5 px-3 rounded-none text-[9px] font-bold tracking-wider uppercase border text-center appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all duration-200 ${this.getShippingStatusBadgeClass(order.shippingStatus)}"
                                                    ${order.loading ? 'disabled' : ''}
                                                >
                                                    <option value="pending_shipping" ${order.shippingStatus === 'pending_shipping' ? 'selected' : ''}>CHỜ GIAO HÀNG</option>
                                                    <option value="shipping" ${order.shippingStatus === 'shipping' ? 'selected' : ''}>ĐANG GIAO</option>
                                                    <option value="delivered" ${order.shippingStatus === 'delivered' ? 'selected' : ''}>ĐÃ GIAO</option>
                                                </select>
                                                <i class="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[8px] pointer-events-none text-neutral-400"></i>
                                            </div>
                                        </td>

                                        <td class="p-6 text-right font-extrabold text-neutral-900 dark:text-white font-mono">${window.formatPrice(order.total)}</td>
                                        
                                        <!-- Actions -->
                                        <td class="p-6 text-center whitespace-nowrap">
                                            <button 
                                                data-detail-order-id="${order.id}"
                                                class="view-invoice-btn border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-amber-500 hover:text-amber-500 px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-colors outline-none"
                                            >
                                                <i class="fa-solid fa-file-invoice mr-1.5"></i> CHI TIẾT
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Bind search input events
        const searchInput = document.getElementById('orderSearchInput');
        searchInput.oninput = (e) => {
            this.searchQuery = e.target.value;
            this.renderOrdersList(el);
        };

        // Bind tab buttons
        document.querySelectorAll('.order-tab-btn').forEach(btn => {
            btn.onclick = () => {
                this.activeOrderTab = btn.dataset.orderTab;
                this.renderOrdersList(el);
            };
        });

        // Bind Click / Select Changes to API
        document.querySelectorAll('.btn-approve-order').forEach(btn => {
            btn.onclick = async (e) => {
                const oId = parseInt(btn.dataset.orderId);
                const order = this.orders.find(o => o.id === oId);
                if (order) {
                    order.loading = true;
                    this.renderOrdersList(el);
                    
                    const nextStatus = this.calculateNextOrderStatus('confirmed', order.paymentStatus, 'pending_shipping');
                    
                    try {
                        const res = await fetch(`${API_BASE_URL}/orders/${oId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                status: nextStatus,
                                payment_status: order.paymentStatus,
                                shipping_status: 'pending_shipping'
                            }),
                            credentials: 'include'
                        });
                        const data = await res.json();
                        if (data.success) {
                            order.status = nextStatus;
                            order.shippingStatus = 'pending_shipping';
                            this.showToast(`Đã duyệt đơn hàng #${oId} thành công.`);
                        } else {
                            this.showToast(data.error || "Không thể duyệt đơn hàng.", "error");
                        }
                    } catch (err) {
                        this.showToast("Lỗi kết nối API.", "error");
                    } finally {
                        order.loading = false;
                        this.renderOrdersList(el);
                    }
                }
            };
        });

        document.querySelectorAll('.select-payment-status').forEach(select => {
            select.onchange = async (e) => {
                const oId = parseInt(select.dataset.orderId);
                const order = this.orders.find(o => o.id === oId);
                if (order) {
                    order.loading = true;
                    this.renderOrdersList(el);
                    
                    const newPaymentStatus = e.target.value;
                    const nextStatus = this.calculateNextOrderStatus(order.status, newPaymentStatus, order.shippingStatus);
                    
                    try {
                        const res = await fetch(`${API_BASE_URL}/orders/${oId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                status: nextStatus,
                                payment_status: newPaymentStatus,
                                shipping_status: order.shippingStatus
                            }),
                            credentials: 'include'
                        });
                        const data = await res.json();
                        if (data.success) {
                            order.paymentStatus = newPaymentStatus;
                            order.status = nextStatus;
                            this.showToast(`Đã cập nhật trạng thái thanh toán đơn hàng #${oId} thành công.`);
                        } else {
                            this.showToast(data.error || "Không thể cập nhật trạng thái thanh toán.", "error");
                        }
                    } catch (err) {
                        this.showToast("Lỗi kết nối API.", "error");
                    } finally {
                        order.loading = false;
                        this.renderOrdersList(el);
                    }
                }
            };
        });

        document.querySelectorAll('.select-shipping-status').forEach(select => {
            select.onchange = async (e) => {
                const oId = parseInt(select.dataset.orderId);
                const order = this.orders.find(o => o.id === oId);
                if (order) {
                    order.loading = true;
                    this.renderOrdersList(el);
                    
                    const newShippingStatus = e.target.value;
                    const nextStatus = this.calculateNextOrderStatus(order.status, order.paymentStatus, newShippingStatus);
                    
                    try {
                        const res = await fetch(`${API_BASE_URL}/orders/${oId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                status: nextStatus,
                                payment_status: order.paymentStatus,
                                shipping_status: newShippingStatus
                            }),
                            credentials: 'include'
                        });
                        const data = await res.json();
                        if (data.success) {
                            order.shippingStatus = newShippingStatus;
                            order.status = nextStatus;
                            this.showToast(`Đã cập nhật trạng thái giao hàng đơn hàng #${oId} thành công.`);
                        } else {
                            this.showToast(data.error || "Không thể cập nhật trạng thái giao hàng.", "error");
                        }
                    } catch (err) {
                        this.showToast("Lỗi kết nối API.", "error");
                    } finally {
                        order.loading = false;
                        this.renderOrdersList(el);
                    }
                }
            };
        });

        // Bind view invoice clicks
        document.querySelectorAll('.view-invoice-btn').forEach(btn => {
            btn.onclick = () => {
                const oId = parseInt(btn.dataset.detailOrderId);
                const order = this.orders.find(o => o.id === oId);
                if (order) {
                    this.openInvoice(order);
                }
            };
        });
    }

    // --- Tab: Category Management ---
    async renderCategories(el) {
        el.innerHTML = `
            <div class="flex items-center justify-center p-12">
                <i class="fa-solid fa-spinner fa-spin text-amber-500 text-2xl"></i>
            </div>
        `;

        try {
            const res = await fetch(`${API_BASE_URL}/products`);
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.error || "Không thể tải sản phẩm.");
            }

            this.products = data.data;
            this.renderCategoriesList(el);
        } catch (e) {
            el.innerHTML = `
                <div class="p-12 border border-neutral-200 dark:border-neutral-800 text-center text-red-500 bg-white dark:bg-[#1a1a1a]">
                    <i class="fa-solid fa-triangle-exclamation text-2xl mb-2 text-sale"></i>
                    <p class="text-xs font-bold uppercase tracking-wider">Lỗi tải dữ liệu danh mục</p>
                    <p class="text-xs text-neutral-400 dark:text-neutral-500 mt-1">${e.message}</p>
                </div>
            `;
        }
    }

    renderCategoriesList(el) {
        const categoryCounts = {};
        for (const p of this.products) {
            categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
        }

        const uniqueCategories = Object.keys(categoryCounts);

        el.innerHTML = `
            <div class="space-y-8 animate-fade-in relative font-sans">
                <!-- Header Block -->
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
                    <div>
                        <h1 class="font-serif text-2xl font-normal text-neutral-900 dark:text-white uppercase tracking-wider">QUẢN LÝ DANH MỤC</h1>
                        <p class="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-1">Danh sách danh mục sản phẩm từ cơ sở dữ liệu</p>
                    </div>

                    <button 
                        id="addCategoryBtn"
                        class="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold tracking-widest uppercase px-6 py-4 transition-colors outline-none shrink-0"
                    >
                        <i class="fa-solid fa-plus mr-1.5"></i> THÊM DANH MỤC MỚI
                    </button>
                </div>

                <!-- Categories Table -->
                <div class="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase font-sans">
                                    <th class="p-6">TÊN DANH MỤC</th>
                                    <th class="p-6 text-center">SỐ SẢN PHẨM</th>
                                    <th class="p-6 text-center">THAO TÁC</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/60 text-xs font-semibold font-sans">
                                ${uniqueCategories.length === 0 ? `
                                    <tr>
                                        <td colspan="3" class="p-12 text-center text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Không có danh mục nào</td>
                                    </tr>
                                ` : uniqueCategories.map(catName => `
                                    <tr class="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10 transition-colors">
                                        <td class="p-6 font-serif text-sm font-normal text-neutral-900 dark:text-white uppercase tracking-wider">${catName}</td>
                                        <td class="p-6 text-center font-mono font-bold">${categoryCounts[catName]} sản phẩm</td>
                                        <td class="p-6 text-center whitespace-nowrap">
                                            <div class="flex gap-2 justify-center">
                                                <button 
                                                    data-category-name="${catName}"
                                                    class="edit-category-btn border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-amber-500 hover:text-amber-500 px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-colors outline-none"
                                                >
                                                    SỬA TÊN
                                                </button>
                                                <button 
                                                    data-category-name="${catName}"
                                                    class="delete-category-btn border border-neutral-200 dark:border-neutral-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-colors outline-none"
                                                >
                                                    XÓA DANH MỤC
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Bind Add Category Click
        document.getElementById('addCategoryBtn').onclick = () => {
            const catName = prompt("Nhập tên danh mục mới muốn tạo:");
            if (catName && catName.trim()) {
                const trimmed = catName.trim();
                if (!this.extraCategories) {
                    this.extraCategories = [];
                }
                if (!this.extraCategories.includes(trimmed)) {
                    this.extraCategories.push(trimmed);
                }
                this.showToast(`Đã thêm danh mục tạm thời '${trimmed}'. Hãy tạo một sản phẩm mới thuộc danh mục này.`);
                this.openProductModal({ category: trimmed });
            }
        };

        // Bind Rename clicks
        document.querySelectorAll('.edit-category-btn').forEach(btn => {
            btn.onclick = async () => {
                const oldName = btn.dataset.categoryName;
                const newName = prompt(`Nhập tên mới cho danh mục '${oldName}':`, oldName);
                if (newName && newName.trim() && newName.trim() !== oldName) {
                    const trimmedNewName = newName.trim();
                    try {
                        const res = await fetch(`${API_BASE_URL}/categories`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ old_name: oldName, new_name: trimmedNewName }),
                            credentials: 'include'
                        });
                        const result = await res.json();
                        if (result.success) {
                            this.showToast(`Đã đổi tên danh mục từ '${oldName}' thành '${trimmedNewName}' thành công!`);
                            this.renderCategories(el);
                        } else {
                            this.showToast(result.error || "Không thể đổi tên danh mục.", "error");
                        }
                    } catch (err) {
                        this.showToast("Lỗi kết nối API.", "error");
                    }
                }
            };
        });

        // Bind Delete clicks
        document.querySelectorAll('.delete-category-btn').forEach(btn => {
            btn.onclick = async () => {
                const catName = btn.dataset.categoryName;
                if (confirm(`CẢNH BÁO: Bạn chắc chắn muốn xóa danh mục '${catName}'? Tất cả sản phẩm thuộc danh mục này sẽ bị xóa khỏi cơ sở dữ liệu!`)) {
                    try {
                        const res = await fetch(`${API_BASE_URL}/categories`, {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name: catName }),
                            credentials: 'include'
                        });
                        const result = await res.json();
                        if (result.success) {
                            this.showToast(`Đã xóa thành công danh mục '${catName}' cùng các sản phẩm thuộc danh mục này!`);
                            this.renderCategories(el);
                        } else {
                            this.showToast(result.error || "Không thể xóa danh mục.", "error");
                        }
                    } catch (err) {
                        this.showToast("Lỗi kết nối API.", "error");
                    }
                }
            };
        });
    }

    openInvoice(order) {
        this.selectedOrder = order;
        const modal = document.getElementById('invoiceModal');
        
        modal.innerHTML = `
            <div class="bg-white dark:bg-[#1a1a1a] border border-amber-500/50 w-full max-w-3xl overflow-hidden shadow-2xl relative animate-fade-in">
                <!-- Modal Top bar -->
                <div class="h-14 bg-neutral-900 dark:bg-black/90 flex items-center justify-between px-6 border-b border-neutral-800 text-white z-10 relative">
                    <span class="text-[10px] font-bold tracking-[0.2em] uppercase font-sans">CHI TIẾT HÓA ĐƠN #${order.id}</span>
                    <button id="closeInvoiceBtn" class="text-neutral-400 hover:text-white transition-colors outline-none">
                        <i class="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>

                <!-- Invoice Content -->
                <div class="p-8 max-h-[75vh] overflow-y-auto font-sans" id="invoicePrintArea">
                    <div class="flex justify-between items-start border-b border-neutral-200 dark:border-neutral-800 pb-6 mb-6">
                        <div>
                            <div class="font-serif text-2xl font-bold tracking-[0.25em] text-neutral-900 dark:text-white">Đồng hồ A Tuấn</div>
                            <div class="text-[9px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-1">Đồng hồ sang trọng & phong cách tối giản</div>
                        </div>
                        <div class="text-right font-mono">
                            <div class="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-widest">HÓA ĐƠN GIAO DỊCH</div>
                            <div class="text-[10px] text-neutral-400 mt-1">ĐƠN #${order.id}</div>
                            <div class="text-[10px] text-neutral-400">${order.date}</div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-neutral-200 dark:border-neutral-800 pb-6 mb-6 text-xs text-neutral-600 dark:text-neutral-400">
                        <div>
                            <h3 class="text-[9px] font-bold tracking-widest text-neutral-900 dark:text-white uppercase mb-2">KHÁCH HÀNG:</h3>
                            <div class="font-bold text-neutral-900 dark:text-white mb-1">${order.customer.name}</div>
                            <div class="font-mono">SĐT: ${order.customer.phone}</div>
                            <div>Email: ${order.customer.email}</div>
                        </div>
                        
                        <div>
                            <h3 class="text-[9px] font-bold tracking-widest text-neutral-900 dark:text-white uppercase mb-2">ĐỊA CHỈ GIAO HÀNG:</h3>
                            <div>${order.shippingAddress.details}</div>
                            <div>${order.shippingAddress.ward}</div>
                            <div>${order.shippingAddress.district}</div>
                            <div class="font-bold text-neutral-850 dark:text-neutral-200 uppercase mt-0.5">${order.shippingAddress.province}</div>
                        </div>
                    </div>

                    <div class="mb-6">
                        <h3 class="text-[9px] font-bold tracking-widest text-neutral-900 dark:text-white uppercase mb-3">DANH SÁCH SẢN PHẨM:</h3>
                        <table class="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr class="border-b border-neutral-200 dark:border-neutral-800 text-[9px] font-bold tracking-widest text-neutral-400 uppercase font-sans">
                                    <th class="pb-2">SẢN PHẨM</th>
                                    <th class="pb-2">SKU</th>
                                    <th class="pb-2 text-center w-20">ĐƠN GIÁ</th>
                                    <th class="pb-2 text-center w-20">SỐ LƯỢNG</th>
                                    <th class="pb-2 text-right w-28">THÀNH TIỀN</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/40 text-neutral-800 dark:text-neutral-300">
                                ${order.items.map(item => `
                                    <tr>
                                        <td class="py-3 font-serif text-sm font-normal text-neutral-900 dark:text-white">${item.title}</td>
                                        <td class="py-3 font-mono text-[10px] text-neutral-400">${item.sku}</td>
                                        <td class="py-3 text-center font-mono">${window.formatPrice(item.price)}</td>
                                        <td class="py-3 text-center font-bold">${item.quantity}</td>
                                        <td class="py-3 text-right font-extrabold text-neutral-900 dark:text-white font-mono">${window.formatPrice(item.price * item.quantity)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <div class="border-t border-neutral-200 dark:border-neutral-800 pt-6 flex flex-col items-end gap-2 text-xs text-neutral-500">
                        <div class="flex justify-between w-64">
                            <span>Tạm tính:</span>
                            <span class="font-mono font-bold text-neutral-850 dark:text-neutral-200">${window.formatPrice(order.subtotal)}</span>
                        </div>
                        
                        ${order.discount > 0 ? `
                            <div class="flex justify-between w-64 text-amber-500">
                                <span>Giảm giá (${order.couponCode}):</span>
                                <span class="font-mono font-bold">-${window.formatPrice(order.discount)}</span>
                            </div>
                        ` : ''}
                        
                        <div class="flex justify-between w-64 border-t border-neutral-200 dark:border-neutral-800 pt-2 text-neutral-900 dark:text-white font-bold text-sm">
                            <span>Tổng cộng:</span>
                            <span class="font-mono text-amber-500 text-lg font-extrabold">${window.formatPrice(order.total)}</span>
                        </div>

                        <div class="flex justify-between w-64 text-[9px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-2">
                            <span>Phương thức thanh toán:</span>
                            <span class="font-bold text-neutral-700 dark:text-neutral-300 text-right">${order.paymentMethod}</span>
                        </div>
                    </div>

                    <div class="mt-12 text-center text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest border-t border-neutral-200 dark:border-neutral-800 pt-6">
                        <span>CẢM ƠN BẠN ĐÃ MUA SẮM TẠI ĐỒNG HỒ A TUẤN</span>
                    </div>
                </div>

                <!-- Modal Bottom actions -->
                <div class="h-16 bg-neutral-50 dark:bg-[#1a1a1a] border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end px-6 gap-4">
                    <button id="closeInvoiceBtn2" class="border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-5 py-2.5 text-[10px] font-bold tracking-widest uppercase transition-colors outline-none font-sans">
                        Đóng
                    </button>
                    <button id="printInvoiceBtn" class="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 text-[10px] font-bold tracking-widest uppercase transition-colors outline-none flex items-center gap-1.5 font-sans">
                        <i class="fa-solid fa-print"></i> In Hóa Đơn
                    </button>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');

        // Bind modal closures
        const closeModal = () => {
            modal.classList.add('hidden');
            this.selectedOrder = null;
        };
        document.getElementById('closeInvoiceBtn').onclick = closeModal;
        document.getElementById('closeInvoiceBtn2').onclick = closeModal;
        
        // Print action
        document.getElementById('printInvoiceBtn').onclick = () => {
            window.print();
        };
    }

    getStatusBadgeClass(status) {
        switch (status) {
            case 'pending': return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
            case 'confirmed': return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
            case 'completed': return 'bg-green-500/10 text-green-500 border border-green-500/20';
            case 'delivered': return 'bg-green-500/10 text-green-500 border border-green-500/20';
            default: return 'bg-neutral-500/10 text-neutral-500 border border-neutral-500/20';
        }
    }

    getPaymentStatusBadgeClass(status) {
        return status === 'paid'
            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
            : 'bg-red-500/10 text-red-500 border border-red-500/20';
    }

    getShippingStatusBadgeClass(status) {
        switch (status) {
            case 'pending_shipping': return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
            case 'shipping': return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
            case 'delivered': return 'bg-green-500/10 text-green-500 border border-green-500/20';
            default: return 'bg-neutral-500/10 text-neutral-500 border border-neutral-500/20';
        }
    }

    showToast(message, type = 'success') {
        let container = document.getElementById('adminToastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'adminToastContainer';
            container.className = "fixed bottom-5 right-5 z-[3000] flex flex-col gap-3 max-w-sm w-full font-sans";
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `p-4 text-xs font-semibold tracking-wider uppercase shadow-xl flex justify-between items-center border-l-4 ${
            type === 'success' 
            ? 'bg-primary text-white border-accent' 
            : 'bg-white text-sale border-sale border-l-red-500 shadow-red-100'
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
            toast.remove();
        };

        container.appendChild(toast);
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 4000);
    }

    async renderProducts(el) {
        el.innerHTML = `
            <div class="flex items-center justify-center p-12">
                <i class="fa-solid fa-spinner fa-spin text-amber-500 text-2xl"></i>
            </div>
        `;

        try {
            const res = await fetch(`${API_BASE_URL}/products`);
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.error || "Không thể lấy dữ liệu sản phẩm.");
            }

            this.products = data.data;
            this.renderProductsList(el);
        } catch (e) {
            el.innerHTML = `
                <div class="p-12 border border-neutral-200 dark:border-neutral-800 text-center text-red-500 bg-white dark:bg-[#1a1a1a] font-sans">
                    <i class="fa-solid fa-triangle-exclamation text-2xl mb-2 text-sale"></i>
                    <p class="text-xs font-bold uppercase tracking-wider">Lỗi tải dữ liệu sản phẩm</p>
                    <p class="text-xs text-neutral-400 dark:text-neutral-500 mt-1">${e.message}</p>
                </div>
            `;
        }
    }

    renderProductsList(el) {
        const filtered = this.products.filter(p => {
            if (!this.productSearchQuery) return true;
            const q = this.productSearchQuery.toLowerCase();
            return p.title.toLowerCase().includes(q) || 
                   p.category.toLowerCase().includes(q) || 
                   (p.id && p.id.toString().includes(q));
        });

        el.innerHTML = `
            <div class="space-y-8 animate-fade-in relative font-sans">
                <!-- Header Block -->
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
                    <div>
                        <h1 class="font-serif text-2xl font-normal text-neutral-900 dark:text-white uppercase tracking-wider">QUẢN LÝ SẢN PHẨM</h1>
                        <p class="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-1">Danh sách sản phẩm từ cơ sở dữ liệu hệ thống</p>
                    </div>

                    <div class="flex items-center gap-4 flex-wrap md:flex-nowrap w-full md:w-auto">
                        <!-- Search -->
                        <div class="relative w-full md:w-64">
                            <input 
                                id="productSearchInput"
                                type="text" 
                                value="${this.productSearchQuery || ''}"
                                placeholder="TÌM SẢN PHẨM..."
                                class="w-full bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 text-[10px] font-bold tracking-widest uppercase p-4 pr-10 outline-none focus:border-amber-500 transition-colors placeholder-neutral-400 dark:placeholder-neutral-500"
                            />
                            <i class="fa-solid fa-magnifying-glass absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 text-xs"></i>
                        </div>

                        <!-- Add Button -->
                        <button 
                            id="addProductBtn"
                            class="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold tracking-widest uppercase px-6 py-4 transition-colors outline-none shrink-0"
                        >
                            <i class="fa-solid fa-plus mr-1.5"></i> THÊM SẢN PHẨM
                        </button>
                    </div>
                </div>

                <!-- Products Table -->
                <div class="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 overflow-hidden relative">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase font-sans">
                                    <th class="p-6 text-center w-16">ID</th>
                                    <th class="p-6">ẢNH</th>
                                    <th class="p-6">TÊN SẢN PHẨM</th>
                                    <th class="p-6">DANH MỤC</th>
                                    <th class="p-6 text-center">SIZE</th>
                                    <th class="p-6 text-center">KHO HÀNG</th>
                                    <th class="p-6 text-right">ĐƠN GIÁ</th>
                                    <th class="p-6 text-center">NHÃN</th>
                                    <th class="p-6 text-center">THAO TÁC</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/60 text-xs font-semibold font-sans">
                                ${filtered.length === 0 ? `
                                    <tr>
                                        <td colspan="9" class="p-12 text-center text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-sans">Không tìm thấy sản phẩm nào</td>
                                    </tr>
                                ` : filtered.map(p => {
                                    const inStock = p.stock > 0;
                                    const isNew = parseInt(p.is_new) === 1;
                                    const isBest = parseInt(p.is_bestseller) === 1;
                                    return `
                                        <tr class="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10 transition-colors">
                                            <td class="p-6 text-center text-neutral-400 dark:text-neutral-500 font-mono">#${p.id}</td>
                                            <td class="p-6">
                                                <div class="w-12 h-15 bg-neutral-100 dark:bg-[#121212] overflow-hidden flex items-center justify-center border border-neutral-200 dark:border-neutral-800">
                                                    <img src="${p.image_url}" alt="${p.title}" class="w-full h-full object-cover">
                                                </div>
                                            </td>
                                            <td class="p-6">
                                                <div class="text-[12px] font-bold text-neutral-900 dark:text-white">${p.title}</div>
                                                <div class="text-[10px] text-neutral-450 dark:text-neutral-450 truncate max-w-xs mt-0.5">${p.description || 'Không có mô tả'}</div>
                                            </td>
                                            <td class="p-6 uppercase text-[9px] tracking-wider text-amber-500 font-sans">${p.category}</td>
                                            <td class="p-6 text-center font-mono">${p.size || '-'}</td>
                                            <td class="p-6 text-center">
                                                ${inStock 
                                                    ? `<span class="text-green-500 bg-green-500/5 px-2 py-0.5 border border-green-500/15">${p.stock} chiếc</span>`
                                                    : `<span class="text-red-500 bg-red-500/5 px-2 py-0.5 border border-red-500/15">Hết hàng</span>`
                                                }
                                            </td>
                                            <td class="p-6 text-right font-extrabold text-neutral-900 dark:text-white font-mono">${window.formatPrice(p.price)}</td>
                                            <td class="p-6 text-center whitespace-nowrap">
                                                <div class="flex flex-col gap-1 items-center">
                                                    ${isNew ? `<span class="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[8px] font-extrabold tracking-widest px-1.5 py-0.5 uppercase border border-neutral-900 dark:border-white">NEW</span>` : ''}
                                                    ${isBest ? `<span class="bg-amber-500 text-white text-[8px] font-extrabold tracking-widest px-1.5 py-0.5 uppercase border border-amber-500">BEST</span>` : ''}
                                                </div>
                                            </td>
                                            <td class="p-6 text-center whitespace-nowrap">
                                                <div class="flex gap-2 justify-center">
                                                    <button 
                                                        data-edit-id="${p.id}"
                                                        class="edit-product-btn border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-amber-500 hover:text-amber-500 px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-colors outline-none"
                                                    >
                                                        SỬA
                                                    </button>
                                                    <button 
                                                        data-delete-id="${p.id}"
                                                        class="delete-product-btn border border-neutral-200 dark:border-neutral-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-colors outline-none"
                                                    >
                                                        XÓA
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Bind Search Input
        const searchInput = document.getElementById('productSearchInput');
        searchInput.oninput = (e) => {
            this.productSearchQuery = e.target.value;
            this.renderProductsList(el);
        };

        // Bind Add click
        document.getElementById('addProductBtn').onclick = () => {
            this.openProductModal();
        };

        // Bind Edit clicks
        document.querySelectorAll('.edit-product-btn').forEach(btn => {
            btn.onclick = () => {
                const id = parseInt(btn.dataset.editId);
                const product = this.products.find(p => p.id === id);
                if (product) {
                    this.openProductModal(product);
                }
            };
        });

        // Bind Delete clicks
        document.querySelectorAll('.delete-product-btn').forEach(btn => {
            btn.onclick = async () => {
                const id = parseInt(btn.dataset.deleteId);
                const product = this.products.find(p => p.id === id);
                if (product) {
                    if (confirm(`Bạn chắc chắn muốn xóa sản phẩm '${product.title}' khỏi hệ thống?`)) {
                        try {
                            const res = await fetch(`${API_BASE_URL}/products/${id}`, {
                                method: 'DELETE',
                                credentials: 'include'
                            });
                            const result = await res.json();
                            if (result.success) {
                                this.showToast(`Đã xóa thành công sản phẩm '${product.title}'`);
                                this.renderWorkspace();
                            } else {
                                this.showToast(result.error || "Không thể xóa sản phẩm.", "error");
                            }
                        } catch (err) {
                            this.showToast("Không kết nối được tới API.", "error");
                        }
                    }
                }
            };
        });
    }

    openProductModal(product = null) {
        const modal = document.getElementById('invoiceModal'); // Reuses the invoice overlay container

        const defaultData = {
            title: '',
            category: 'Mens Watches',
            price: '',
            size: '40mm',
            image_url: 'images/chrono_gold.png',
            stock: 10,
            description: '',
            is_new: 0,
            is_bestseller: 0
        };

        const isEdit = product !== null && product.id !== undefined;
        const data = product ? { ...defaultData, ...product } : defaultData;

        // Gather unique categories dynamically
        const dbCategories = Array.from(new Set(this.products ? this.products.map(p => p.category) : []));
        const categoriesList = Array.from(new Set([
            "Mens Watches",
            "Womens Watches",
            "Accessories",
            ...dbCategories,
            ...(this.extraCategories || [])
        ]));

        const categoryOptionsHtml = categoriesList.map(cat => {
            const isSelected = data.category === cat || 
                               (cat === "Mens Watches" && (data.category === "Men's Watches" || data.category === "mens")) ||
                               (cat === "Womens Watches" && (data.category === "Women's Watches" || data.category === "womens" || data.category === "Watches"));
            
            let displayText = cat;
            if (cat === "Mens Watches") displayText = "Men's Watches";
            else if (cat === "Womens Watches") displayText = "Women's Watches";

            return `<option value="${cat}" ${isSelected ? 'selected' : ''}>${displayText}</option>`;
        }).join('');

        modal.innerHTML = `
            <div class="bg-white dark:bg-[#1a1a1a] border border-amber-500/50 w-full max-w-2xl overflow-hidden shadow-2xl relative animate-fade-in font-sans">
                <!-- Modal Header -->
                <div class="h-14 bg-neutral-900 dark:bg-black/90 flex items-center justify-between px-6 border-b border-neutral-800 text-white z-10 relative">
                    <span class="text-[10px] font-bold tracking-[0.2em] uppercase font-sans">
                        ${isEdit ? `CẬP NHẬT SẢN PHẨM #${data.id}` : 'THÊM SẢN PHẨM MỚI'}
                    </span>
                    <button id="closeProductModalBtn" class="text-neutral-400 hover:text-white transition-colors outline-none">
                        <i class="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>

                <!-- Product Form Container -->
                <form id="productForm" class="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto text-xs font-sans">
                    
                    <!-- Row 1: Title and Category -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">TÊN SẢN PHẨM *</label>
                            <input 
                                type="text" 
                                name="title" 
                                required 
                                value="${data.title}" 
                                class="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 p-3 outline-none focus:border-amber-500 text-neutral-800 dark:text-white"
                            />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">DANH MỤC *</label>
                            <div class="relative">
                                <select 
                                    name="category" 
                                    required 
                                    class="w-full bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 p-3 outline-none focus:border-amber-500 text-neutral-850 dark:text-neutral-255 appearance-none cursor-pointer"
                                >
                                    ${categoryOptionsHtml}
                                </select>
                                <i class="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[8px] pointer-events-none text-neutral-400"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Row 2: Price, Size and Stock -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">ĐƠN GIÁ (VNĐ) *</label>
                            <input 
                                type="number" 
                                name="price" 
                                step="0.01" 
                                min="0" 
                                required 
                                value="${data.price}" 
                                class="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 p-3 outline-none focus:border-amber-500 text-neutral-800 dark:text-white font-mono"
                            />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">KÍCH THƯỚC (SIZE)</label>
                            <input 
                                type="text" 
                                name="size" 
                                value="${data.size}" 
                                placeholder="Ví dụ: 40mm, 38mm"
                                class="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 p-3 outline-none focus:border-amber-500 text-neutral-850 dark:text-neutral-255"
                            />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">SỐ LƯỢNG KHO *</label>
                            <input 
                                type="number" 
                                name="stock" 
                                min="0" 
                                required 
                                value="${data.stock}" 
                                class="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 p-3 outline-none focus:border-amber-500 text-neutral-855 dark:text-neutral-255 font-mono"
                            />
                        </div>
                    </div>

                    <!-- Row 3: Image URL -->
                    <div class="flex flex-col gap-2">
                        <label class="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">ĐƯỜNG DẪN ẢNH SẢN PHẨM *</label>
                        <input 
                            type="text" 
                            name="image_url" 
                            required 
                            value="${data.image_url}" 
                            class="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 p-3 outline-none focus:border-amber-500 text-neutral-850 dark:text-neutral-255 font-mono"
                        />
                    </div>

                    <!-- Row 4: Description -->
                    <div class="flex flex-col gap-2">
                        <label class="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">MÔ TẢ SẢN PHẨM</label>
                        <textarea 
                            name="description" 
                            rows="4" 
                            class="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 p-3 outline-none focus:border-amber-500 text-neutral-850 dark:text-neutral-200 leading-relaxed resize-none"
                        >${data.description || ''}</textarea>
                    </div>

                    <!-- Row 5: Flags (New / Bestseller) -->
                    <div class="flex items-center gap-8 py-2">
                        <label class="flex items-center gap-2 cursor-pointer select-none">
                            <input 
                                type="checkbox" 
                                name="is_new" 
                                ${parseInt(data.is_new) === 1 ? 'checked' : ''} 
                                class="w-4 h-4 accent-amber-500 rounded-none cursor-pointer"
                            />
                            <span class="text-[10px] font-bold tracking-widest text-neutral-800 dark:text-neutral-200 uppercase font-sans">SẢN PHẨM MỚI (NEW)</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer select-none">
                            <input 
                                type="checkbox" 
                                name="is_bestseller" 
                                ${parseInt(data.is_bestseller) === 1 ? 'checked' : ''} 
                                class="w-4 h-4 accent-amber-500 rounded-none cursor-pointer"
                            />
                            <span class="text-[10px] font-bold tracking-widest text-neutral-800 dark:text-neutral-200 uppercase font-sans">BÁN CHẠY (BEST SELLER)</span>
                        </label>
                    </div>

                </form>

                <!-- Modal Bottom actions -->
                <div class="h-16 bg-neutral-50 dark:bg-[#1a1a1a] border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end px-6 gap-4">
                    <button id="closeProductModalBtn2" type="button" class="border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-5 py-2.5 text-[10px] font-bold tracking-widest uppercase transition-colors outline-none font-sans">
                        Hủy
                    </button>
                    <button id="saveProductBtn" type="button" class="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 text-[10px] font-bold tracking-widest uppercase transition-colors outline-none flex items-center gap-1.5 font-sans">
                        <i class="fa-solid fa-floppy-disk"></i> LƯU SẢN PHẨM
                    </button>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');

        // Bind closures
        const closeModal = () => {
            modal.classList.add('hidden');
        };
        document.getElementById('closeProductModalBtn').onclick = closeModal;
        document.getElementById('closeProductModalBtn2').onclick = closeModal;

        // Bind Save click
        document.getElementById('saveProductBtn').onclick = async () => {
            const form = document.getElementById('productForm');
            if (!form.reportValidity()) return;

            const payload = {
                title: form.title.value,
                category: form.category.value,
                price: parseFloat(form.price.value),
                size: form.size.value,
                image_url: form.image_url.value,
                stock: parseInt(form.stock.value),
                description: form.description.value,
                is_new: form.is_new.checked ? 1 : 0,
                is_bestseller: form.is_bestseller.checked ? 1 : 0
            };

            const btn = document.getElementById('saveProductBtn');
            btn.disabled = true;
            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> ĐANG LƯU...`;

            try {
                const url = isEdit ? `${API_BASE_URL}/products/${data.id}` : `${API_BASE_URL}/products`;
                const method = isEdit ? 'PUT' : 'POST';
                const res = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    credentials: 'include'
                });
                const result = await res.json();
                
                if (result.success) {
                    this.showToast(isEdit ? "Cập nhật sản phẩm thành công!" : "Đã tạo sản phẩm thành công!");
                    closeModal();
                    this.renderWorkspace();
                } else {
                    this.showToast(result.error || "Gặp lỗi khi lưu sản phẩm.", "error");
                    btn.disabled = false;
                    btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> LƯU SẢN PHẨM`;
                }
            } catch (err) {
                this.showToast("Không kết nối được tới API.", "error");
                btn.disabled = false;
                btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> LƯU SẢN PHẨM`;
            }
        };
    }

    async renderPromos(el) {
        el.innerHTML = `
            <div class="flex items-center justify-center p-12">
                <i class="fa-solid fa-spinner fa-spin text-amber-500 text-2xl"></i>
            </div>
        `;

        try {
            const [couponsRes, productsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/coupons`, { credentials: 'include' }),
                fetch(`${API_BASE_URL}/products`)
            ]);
            
            const couponsData = await couponsRes.json();
            const productsData = await productsRes.json();

            if (!couponsData.success) {
                throw new Error(couponsData.error || "Không thể lấy dữ liệu mã giảm giá.");
            }
            if (!productsData.success) {
                throw new Error(productsData.error || "Không thể lấy dữ liệu sản phẩm.");
            }

            this.coupons = couponsData.data;
            this.products = productsData.data;
            this.renderPromosList(el);
        } catch (e) {
            el.innerHTML = `
                <div class="p-12 border border-neutral-200 dark:border-neutral-800 text-center text-red-500 bg-white dark:bg-[#1a1a1a] font-sans">
                    <i class="fa-solid fa-triangle-exclamation text-2xl mb-2 text-sale"></i>
                    <p class="text-xs font-bold uppercase tracking-wider">Lỗi tải dữ liệu mã giảm giá</p>
                    <p class="text-xs text-neutral-400 dark:text-neutral-500 mt-1">${e.message}</p>
                </div>
            `;
        }
    }

    getPromoLiveStatus(p) {
        if (!p.is_active) {
            return { label: 'TẠM DỪNG', badgeClass: 'bg-neutral-500/10 text-neutral-500 border border-neutral-500/20' };
        }
        const now = new Date();
        const startDate = new Date(p.start_date);
        const endDate = new Date(p.end_date);
        
        if (now < startDate) {
            return { label: 'LÊN LỊCH', badgeClass: 'bg-blue-500/10 text-blue-500 border border-blue-500/20' };
        }
        if (now > endDate) {
            return { label: 'HẾT HẠN', badgeClass: 'bg-red-500/10 text-red-500 border border-red-500/20' };
        }
        if (p.total_limit !== null && p.used_count >= p.total_limit) {
            return { label: 'HẾT LƯỢT', badgeClass: 'bg-rose-500/10 text-rose-500 border border-rose-500/20' };
        }
        return { label: 'HOẠT ĐỘNG', badgeClass: 'bg-green-500/10 text-green-500 border border-green-500/20' };
    }

    renderPromosList(el) {
        const filtered = this.coupons.filter(p => {
            if (!this.promoSearchQuery) return true;
            const q = this.promoSearchQuery.toLowerCase();
            return p.code.toLowerCase().includes(q) || 
                   p.name.toLowerCase().includes(q);
        });

        el.innerHTML = `
            <div class="space-y-8 animate-fade-in relative font-sans">
                <!-- Header Block -->
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
                    <div>
                        <h1 class="font-serif text-2xl font-normal text-neutral-900 dark:text-white uppercase tracking-wider">QUẢN LÝ MÃ GIẢM GIÁ</h1>
                        <p class="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-1">Cài đặt, cập nhật và thiết lập các chiến dịch khuyến mãi</p>
                    </div>

                    <div class="flex items-center gap-4 flex-wrap md:flex-nowrap w-full md:w-auto">
                        <!-- Search -->
                        <div class="relative w-full md:w-64">
                            <input 
                                id="promoSearchInput"
                                type="text" 
                                value="${this.promoSearchQuery || ''}"
                                placeholder="TÌM MÃ GIẢM GIÁ..."
                                class="w-full bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 text-[10px] font-bold tracking-widest uppercase p-4 pr-10 outline-none focus:border-amber-500 transition-colors placeholder-neutral-400 dark:placeholder-neutral-500"
                            />
                            <i class="fa-solid fa-magnifying-glass absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 text-xs"></i>
                        </div>

                        <!-- Add Button -->
                        <button 
                            id="addPromoBtn"
                            class="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold tracking-widest uppercase px-6 py-4 transition-colors outline-none shrink-0"
                        >
                            <i class="fa-solid fa-plus mr-1.5"></i> THÊM MÃ MỚI
                        </button>
                    </div>
                </div>

                <!-- Promos Mobile & Tablet Grid (Visible below lg layout) -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-6 font-sans">
                    ${filtered.length === 0 ? `
                        <div class="p-12 border border-neutral-200 dark:border-neutral-800 text-center text-neutral-400 dark:text-neutral-500 uppercase tracking-widest col-span-full bg-white dark:bg-[#1a1a1a]">
                            Không tìm thấy mã giảm giá nào
                        </div>
                    ` : filtered.map(p => {
                        const statusInfo = this.getPromoLiveStatus(p);
                        
                        const totalLimit = p.total_limit;
                        const usedCount = p.used_count || 0;
                        let progressPercent = 0;
                        let progressLabel = `${usedCount} / ${totalLimit !== null ? totalLimit : '∞'}`;
                        if (totalLimit) {
                            progressPercent = Math.min(100, (usedCount / totalLimit) * 100);
                        }

                        const typeLabel = p.applicable_type === 'specific_products' ? 'Sản phẩm cụ thể' : 'Toàn bộ đơn hàng';
                        const discountValue = p.type === 'percentage' 
                            ? `${parseFloat(p.value)}%` 
                            : `${window.formatPrice(p.value)}`;
                        
                        const capLabel = p.type === 'percentage' && p.max_discount_amount 
                            ? ` (Tối đa: ${window.formatPrice(p.max_discount_amount)})` 
                            : '';

                        return `
                            <div class="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 p-6 flex flex-col justify-between space-y-4 hover:border-amber-500/50 transition-colors duration-300">
                                <div>
                                    <!-- Top line: Campaign name & status -->
                                    <div class="flex justify-between items-start gap-2">
                                        <div>
                                            <h3 class="font-serif text-sm font-bold text-neutral-905 dark:text-white uppercase tracking-wider">${p.name}</h3>
                                            <span class="text-[9px] text-neutral-400 uppercase tracking-wider block mt-0.5">${typeLabel}</span>
                                        </div>
                                        <span class="inline-block py-0.5 px-2 border text-[8px] font-bold tracking-wider uppercase text-center rounded-none select-none shrink-0 ${statusInfo.badgeClass}">
                                            ${statusInfo.label}
                                        </span>
                                    </div>

                                    <!-- Code and discount value -->
                                    <div class="mt-4 flex items-center justify-between border-t border-b border-neutral-100 dark:border-neutral-800/60 py-3">
                                        <div class="flex flex-col">
                                            <span class="text-[8px] font-bold tracking-widest text-neutral-400 uppercase">MÃ CODE</span>
                                            <span class="font-mono font-bold text-[13px] text-neutral-900 dark:text-white mt-0.5">${p.code}</span>
                                        </div>
                                        <div class="flex flex-col text-right">
                                            <span class="text-[8px] font-bold tracking-widest text-neutral-400 uppercase">MỨC GIẢM</span>
                                            <span class="font-mono font-bold text-[13px] text-amber-500 mt-0.5">
                                                ${discountValue}${capLabel}
                                            </span>
                                        </div>
                                    </div>

                                    <!-- Limits & dates -->
                                    <div class="mt-4 space-y-2 text-[10px]">
                                        <div class="flex justify-between items-center">
                                            <span class="text-neutral-400 uppercase tracking-wider text-[8px] font-bold">Lượt đã dùng:</span>
                                            <div class="flex items-center gap-2">
                                                <div class="w-16 bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                                                    <div class="bg-amber-500 h-full rounded-full" style="width: ${progressPercent}%"></div>
                                                </div>
                                                <span class="font-mono text-neutral-600 dark:text-neutral-450 font-bold">${progressLabel}</span>
                                            </div>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-neutral-400 uppercase tracking-wider text-[8px] font-bold">Thời hạn:</span>
                                            <span class="font-mono text-neutral-500 text-[9px]">${p.start_date.substring(0, 16)} đến ${p.end_date.substring(0, 16)}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Actions footer -->
                                <div class="pt-4 border-t border-neutral-100 dark:border-neutral-800/60 flex gap-2 justify-end font-sans">
                                    <button 
                                        data-toggle-id="${p.id}"
                                        class="toggle-promo-btn flex-1 border border-neutral-250 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-amber-500 hover:text-amber-500 py-2 text-[9px] font-bold tracking-widest uppercase transition-colors outline-none text-center font-sans"
                                    >
                                        ${p.is_active ? 'TẠM DỪNG' : 'KÍCH HOẠT'}
                                    </button>
                                    <button 
                                        data-edit-id="${p.id}"
                                        class="edit-promo-btn border border-neutral-250 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-amber-500 hover:text-amber-500 px-3 py-2 text-[9px] font-bold tracking-widest uppercase transition-colors outline-none font-sans"
                                    >
                                        SỬA
                                    </button>
                                    <button 
                                        data-delete-id="${p.id}"
                                        class="delete-promo-btn border border-neutral-250 dark:border-neutral-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 px-3 py-2 text-[9px] font-bold tracking-widest uppercase transition-colors outline-none font-sans"
                                    >
                                        XÓA
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <!-- Promos Table (Visible on Desktop / Large screens) -->
                <div class="hidden lg:block bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 overflow-hidden relative font-sans">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse font-sans">
                            <thead>
                                <tr class="border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase font-sans">
                                    <th class="p-6">CHIẾN DỊCH</th>
                                    <th class="p-6">MÃ CODE</th>
                                    <th class="p-6">LOẠI GIẢM GIÁ</th>
                                    <th class="p-6">MỨC GIẢM</th>
                                    <th class="p-6">GIỚI HẠN / ĐÃ DÙNG</th>
                                    <th class="p-6">HẠN SỬ DỤNG</th>
                                    <th class="p-6 text-center">TRẠNG THÁI</th>
                                    <th class="p-6 text-center">THAO TÁC</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/60 text-xs font-semibold font-sans">
                                ${filtered.length === 0 ? `
                                    <tr>
                                        <td colspan="8" class="p-12 text-center text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-sans">Không tìm thấy mã giảm giá nào</td>
                                    </tr>
                                ` : filtered.map(p => {
                                    const statusInfo = this.getPromoLiveStatus(p);
                                    
                                    const totalLimit = p.total_limit;
                                    const usedCount = p.used_count || 0;
                                    let progressPercent = 0;
                                    let progressLabel = `${usedCount} / ${totalLimit !== null ? totalLimit : '∞'}`;
                                    if (totalLimit) {
                                        progressPercent = Math.min(100, (usedCount / totalLimit) * 100);
                                    }

                                    const typeLabel = p.applicable_type === 'specific_products' ? 'Sản phẩm cụ thể' : 'Toàn bộ đơn hàng';
                                    const discountValue = p.type === 'percentage' 
                                        ? `${parseFloat(p.value)}%` 
                                        : `${window.formatPrice(p.value)}`;
                                    
                                    const capLabel = p.type === 'percentage' && p.max_discount_amount 
                                        ? `<div class="text-[9px] text-neutral-400 mt-0.5 font-sans">Tối đa: ${window.formatPrice(p.max_discount_amount)}</div>` 
                                        : '';

                                    return `
                                        <tr class="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10 transition-colors">
                                            <td class="p-6 font-sans">
                                                <div class="text-[12px] font-bold text-neutral-900 dark:text-white font-sans">${p.name}</div>
                                                <div class="text-[9px] text-neutral-400 uppercase tracking-wider mt-0.5 font-sans">${typeLabel}</div>
                                            </td>
                                            <td class="p-6 font-mono font-bold text-neutral-900 dark:text-white">${p.code}</td>
                                            <td class="p-6 uppercase text-[9px] tracking-wider text-neutral-500 font-sans font-sans">
                                                ${p.type === 'percentage' ? 'Phần trăm (%)' : 'Số tiền cố định (VNĐ)'}
                                            </td>
                                            <td class="p-6 font-mono font-bold text-amber-500">
                                                ${discountValue}
                                                ${capLabel}
                                            </td>
                                            <td class="p-6 font-sans">
                                                <div class="flex flex-col font-sans">
                                                    <div class="w-24 bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                                                        <div class="bg-amber-500 h-full rounded-full" style="width: ${progressPercent}%"></div>
                                                    </div>
                                                    <span class="text-[9px] font-mono text-neutral-400 mt-1">${progressLabel} lượt</span>
                                                </div>
                                            </td>
                                            <td class="p-6 text-neutral-400 dark:text-neutral-500 font-mono text-[10px] whitespace-nowrap">
                                                <div>BĐ: ${p.start_date.substring(0, 16)}</div>
                                                <div>KT: ${p.end_date.substring(0, 16)}</div>
                                            </td>
                                            <td class="p-6 text-center whitespace-nowrap">
                                                <span class="inline-block py-1 px-2.5 border text-[9px] font-bold tracking-wider uppercase text-center rounded-none select-none ${statusInfo.badgeClass}">
                                                    ${statusInfo.label}
                                                </span>
                                            </td>
                                            <td class="p-6 text-center whitespace-nowrap">
                                                <div class="flex gap-2 justify-center items-center font-sans">
                                                    <button 
                                                        data-toggle-id="${p.id}"
                                                        class="toggle-promo-btn border border-neutral-250 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-amber-500 hover:text-amber-500 px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-colors outline-none font-sans"
                                                    >
                                                        ${p.is_active ? 'TẠM DỪNG' : 'KÍCH HOẠT'}
                                                    </button>
                                                    <button 
                                                        data-edit-id="${p.id}"
                                                        class="edit-promo-btn border border-neutral-250 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-amber-500 hover:text-amber-500 px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-colors outline-none font-sans"
                                                    >
                                                        SỬA
                                                    </button>
                                                    <button 
                                                        data-delete-id="${p.id}"
                                                        class="delete-promo-btn border border-neutral-250 dark:border-neutral-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-colors outline-none font-sans"
                                                    >
                                                        XÓA
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Bind Search Input
        const searchInput = document.getElementById('promoSearchInput');
        if (searchInput) {
            searchInput.oninput = (e) => {
                this.promoSearchQuery = e.target.value;
                this.renderPromosList(el);
            };
        }

        // Bind Add click
        const addBtn = document.getElementById('addPromoBtn');
        if (addBtn) {
            addBtn.onclick = () => {
                this.openPromoModal();
            };
        }

        // Bind Toggle clicks
        document.querySelectorAll('.toggle-promo-btn').forEach(btn => {
            btn.onclick = async () => {
                const id = parseInt(btn.dataset.toggleId);
                try {
                    const res = await fetch(`${API_BASE_URL}/coupons/${id}/toggle`, {
                        method: 'PATCH',
                        credentials: 'include'
                    });
                    const result = await res.json();
                    if (result.success) {
                        this.showToast(result.message);
                        this.renderPromos(el);
                    } else {
                        this.showToast(result.error || "Không thể thay đổi trạng thái.", "error");
                    }
                } catch (err) {
                    this.showToast("Không kết nối được tới API.", "error");
                }
            };
        });

        // Bind Edit clicks
        document.querySelectorAll('.edit-promo-btn').forEach(btn => {
            btn.onclick = () => {
                const id = parseInt(btn.dataset.editId);
                const coupon = this.coupons.find(c => c.id === id);
                if (coupon) {
                    this.openPromoModal(coupon);
                }
            };
        });

        // Bind Delete clicks
        document.querySelectorAll('.delete-promo-btn').forEach(btn => {
            btn.onclick = async () => {
                const id = parseInt(btn.dataset.deleteId);
                const coupon = this.coupons.find(c => c.id === id);
                if (coupon) {
                    if (confirm(`Bạn chắc chắn muốn xóa mã giảm giá '${coupon.code}'?`)) {
                        try {
                            const res = await fetch(`${API_BASE_URL}/coupons/${id}`, {
                                method: 'DELETE',
                                credentials: 'include'
                            });
                            const result = await res.json();
                            if (result.success) {
                                this.showToast(`Đã xóa thành công mã giảm giá '${coupon.code}'`);
                                this.renderPromos(el);
                            } else {
                                this.showToast(result.error || "Không thể xóa mã giảm giá.", "error");
                            }
                        } catch (err) {
                            this.showToast("Không kết nối được tới API.", "error");
                        }
                    }
                }
            };
        });
    }

    openPromoModal(coupon = null) {
        const modal = document.getElementById('invoiceModal');

        const defaultData = {
            code: '',
            name: '',
            type: 'fixed',
            value: '',
            max_discount_amount: '',
            min_order_value: 0,
            applicable_type: 'all_orders',
            total_limit: '',
            per_user_limit: 1,
            is_stackable: false,
            is_active: true,
            start_date: new Date().toISOString().substring(0, 16),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 16),
            product_ids: []
        };

        const isEdit = coupon !== null && coupon.id !== undefined;
        const data = coupon ? { ...defaultData, ...coupon } : defaultData;

        const formatForInput = (dateStr) => {
            if (!dateStr) return '';
            return dateStr.replace(' ', 'T').substring(0, 16);
        };

        const formattedStart = formatForInput(data.start_date);
        const formattedEnd = formatForInput(data.end_date);

        const productsListHtml = this.products.map(p => {
            const isSelected = data.product_ids && data.product_ids.includes(p.id);
            return `
                <label class="flex items-center gap-3 p-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800/40 cursor-pointer product-select-row" data-title="${p.title.toLowerCase()}">
                    <input 
                        type="checkbox" 
                        name="product_ids" 
                        value="${p.id}"
                        ${isSelected ? 'checked' : ''} 
                        class="w-4 h-4 accent-amber-500 rounded-none cursor-pointer"
                    />
                    <div class="flex items-center gap-2">
                        <img src="${p.image_url}" alt="${p.title}" class="w-8 h-10 object-cover border border-neutral-200 dark:border-neutral-800">
                        <div>
                            <div class="font-bold text-neutral-850 dark:text-neutral-200">${p.title}</div>
                            <div class="text-[9px] text-neutral-400 font-mono font-sans">ID: #${p.id} | ${window.formatPrice(p.price)}</div>
                        </div>
                    </div>
                </label>
            `;
        }).join('');

        modal.innerHTML = `
            <div class="bg-white dark:bg-[#1a1a1a] border border-amber-500/50 w-full max-w-2xl overflow-hidden shadow-2xl relative animate-fade-in font-sans">
                <!-- Modal Header -->
                <div class="h-14 bg-neutral-900 dark:bg-black/90 flex items-center justify-between px-6 border-b border-neutral-800 text-white z-10 relative">
                    <span class="text-[10px] font-bold tracking-[0.2em] uppercase font-sans">
                        ${isEdit ? `CẬP NHẬT MÃ GIẢM GIÁ #${data.id}` : 'THÊM MÃ GIẢM GIÁ MỚI'}
                    </span>
                    <button id="closePromoModalBtn" class="text-neutral-400 hover:text-white transition-colors outline-none">
                        <i class="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>

                <!-- Promo Form Container -->
                <form id="promoForm" class="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto text-xs font-sans">
                    
                    <!-- Row 1: Code and Name -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">MÃ GIẢM GIÁ (CODE) *</label>
                            <input 
                                type="text" 
                                name="code" 
                                required 
                                placeholder="Ví dụ: SUMMER20"
                                value="${data.code}" 
                                class="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 p-3 outline-none focus:border-amber-500 text-neutral-800 dark:text-white font-mono uppercase font-bold"
                            />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">TÊN CHIẾN DỊCH (INTERNAL NAME) *</label>
                            <input 
                                type="text" 
                                name="name" 
                                required 
                                placeholder="Ví dụ: Xả Kho Mùa Hè"
                                value="${data.name}" 
                                class="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 p-3 outline-none focus:border-amber-500 text-neutral-800 dark:text-white"
                            />
                        </div>
                    </div>

                    <!-- Row 2: Type and Value -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">LOẠI GIẢM GIÁ *</label>
                            <div class="relative">
                                <select 
                                    id="promoTypeSelect"
                                    name="type" 
                                    required 
                                    class="w-full bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 p-3 outline-none focus:border-amber-500 text-neutral-850 dark:text-neutral-200 appearance-none cursor-pointer"
                                >
                                    <option value="fixed" ${data.type === 'fixed' ? 'selected' : ''}>Số tiền cố định (VNĐ)</option>
                                    <option value="percentage" ${data.type === 'percentage' ? 'selected' : ''}>Phần trăm (%)</option>
                                </select>
                                <i class="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[8px] pointer-events-none text-neutral-400"></i>
                            </div>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">GIÁ TRỊ GIẢM *</label>
                            <input 
                                type="number" 
                                name="value" 
                                step="0.01" 
                                min="0.01"
                                required 
                                placeholder="Ví dụ: 10 hoặc 15.00"
                                value="${data.value}" 
                                class="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 p-3 outline-none focus:border-amber-500 text-neutral-800 dark:text-white font-mono font-bold"
                            />
                        </div>
                    </div>

                    <!-- Row 3: Max Discount (Percentage Cap) and Min Order Value -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                        <div id="maxDiscountContainer" class="flex flex-col gap-2 ${data.type === 'percentage' ? '' : 'hidden'}">
                            <label class="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">GIẢM TỐI ĐA (CỐ ĐỊNH VNĐ)</label>
                            <input 
                                type="number" 
                                name="max_discount_amount" 
                                step="0.01" 
                                min="0" 
                                placeholder="Không giới hạn"
                                value="${data.max_discount_amount || ''}" 
                                class="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 p-3 outline-none focus:border-amber-500 text-neutral-800 dark:text-white font-mono"
                            />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">GIÁ TRỊ ĐƠN HÀNG TỐI THIỂU *</label>
                            <input 
                                type="number" 
                                name="min_order_value" 
                                step="0.01" 
                                min="0" 
                                required 
                                value="${data.min_order_value}" 
                                class="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 p-3 outline-none focus:border-amber-500 text-neutral-800 dark:text-white font-mono"
                            />
                        </div>
                    </div>

                    <!-- Row 4: Total Limit and Per User Limit -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">TỔNG GIỚI HẠN LƯỢT DÙNG (MÃ TOÀN CẦU)</label>
                            <input 
                                type="number" 
                                name="total_limit" 
                                min="1" 
                                placeholder="Không giới hạn"
                                value="${data.total_limit || ''}" 
                                class="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 p-3 outline-none focus:border-amber-500 text-neutral-800 dark:text-white font-mono"
                            />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">GIỚI HẠN MỖI KHÁCH HÀNG *</label>
                            <input 
                                type="number" 
                                name="per_user_limit" 
                                min="1" 
                                required 
                                value="${data.per_user_limit}" 
                                class="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 p-3 outline-none focus:border-amber-500 text-neutral-800 dark:text-white font-mono"
                            />
                        </div>
                    </div>

                    <!-- Row 5: Start and End Dates -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">THỜI GIAN KÍCH HOẠT *</label>
                            <input 
                                type="datetime-local" 
                                name="start_date" 
                                required 
                                value="${formattedStart}" 
                                class="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 p-3 outline-none focus:border-amber-500 text-neutral-800 dark:text-white"
                            />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">THỜI GIAN KẾT THÚC *</label>
                            <input 
                                type="datetime-local" 
                                name="end_date" 
                                required 
                                value="${formattedEnd}" 
                                class="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 p-3 outline-none focus:border-amber-500 text-neutral-800 dark:text-white"
                            />
                        </div>
                    </div>

                    <!-- Row 6: Toggles (Stackable / Active) -->
                    <div class="flex items-center gap-8 py-2 font-sans font-sans">
                        <label class="flex items-center gap-2 cursor-pointer select-none">
                            <input 
                                type="checkbox" 
                                name="is_stackable" 
                                ${data.is_stackable ? 'checked' : ''} 
                                class="w-4 h-4 accent-amber-500 rounded-none cursor-pointer"
                            />
                            <span class="text-[10px] font-bold tracking-widest text-neutral-800 dark:text-neutral-200 uppercase font-sans">CHO PHÉP CỘNG DỒN MÃ (STACKABLE)</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer select-none">
                            <input 
                                type="checkbox" 
                                name="is_active" 
                                ${data.is_active ? 'checked' : ''} 
                                class="w-4 h-4 accent-amber-500 rounded-none cursor-pointer"
                            />
                            <span class="text-[10px] font-bold tracking-widest text-neutral-800 dark:text-neutral-200 uppercase font-sans">KÍCH HOẠT SỬ DỤNG LIỀN</span>
                        </label>
                    </div>

                    <!-- Row 7: Scope Targeting -->
                    <div class="flex flex-col gap-2 font-sans">
                        <label class="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">PHẠM VI ÁP DỤNG *</label>
                        <div class="relative">
                            <select 
                                id="promoScopeSelect"
                                name="applicable_type" 
                                required 
                                class="w-full bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 p-3 outline-none focus:border-amber-500 text-neutral-850 dark:text-neutral-200 appearance-none cursor-pointer"
                            >
                                <option value="all_orders" ${data.applicable_type === 'all_orders' ? 'selected' : ''}>Toàn bộ đơn hàng (All Orders)</option>
                                <option value="specific_products" ${data.applicable_type === 'specific_products' ? 'selected' : ''}>Sản phẩm chỉ định (Specific Products)</option>
                            </select>
                            <i class="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[8px] pointer-events-none text-neutral-400"></i>
                        </div>
                    </div>

                    <!-- Row 8: Eligible Products List -->
                    <div id="productSelectionContainer" class="flex flex-col gap-2 font-sans ${data.applicable_type === 'specific_products' ? '' : 'hidden'}">
                        <label class="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">CHỌN SẢN PHẨM ÁP DỤNG *</label>
                        <input 
                            id="productSelectSearch"
                            type="text" 
                            placeholder="GÕ ĐỂ TÌM SẢN PHẨM..."
                            class="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 p-2.5 outline-none focus:border-amber-500 text-neutral-800 dark:text-white"
                        />
                        <div class="border border-neutral-200 dark:border-neutral-800 max-h-40 overflow-y-auto bg-white dark:bg-[#121212] select-none" id="productCheckboxesWrapper">
                            ${productsListHtml}
                        </div>
                    </div>

                </form>

                <!-- Modal Bottom actions -->
                <div class="h-16 bg-neutral-50 dark:bg-[#1a1a1a] border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end px-6 gap-4">
                    <button id="closePromoModalBtn2" type="button" class="border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-5 py-2.5 text-[10px] font-bold tracking-widest uppercase transition-colors outline-none font-sans">
                        Hủy
                    </button>
                    <button id="savePromoBtn" type="button" class="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 text-[10px] font-bold tracking-widest uppercase transition-colors outline-none flex items-center gap-1.5 font-sans">
                        <i class="fa-solid fa-floppy-disk"></i> LƯU MÃ GIẢM GIÁ
                    </button>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');

        // Bind closures
        const closeModal = () => {
            modal.classList.add('hidden');
        };
        document.getElementById('closePromoModalBtn').onclick = closeModal;
        document.getElementById('closePromoModalBtn2').onclick = closeModal;

        // Type conditional show/hide
        const typeSelect = document.getElementById('promoTypeSelect');
        const maxDiscountContainer = document.getElementById('maxDiscountContainer');
        typeSelect.onchange = () => {
            if (typeSelect.value === 'percentage') {
                maxDiscountContainer.classList.remove('hidden');
            } else {
                maxDiscountContainer.classList.add('hidden');
            }
        };

        // Scope conditional show/hide
        const scopeSelect = document.getElementById('promoScopeSelect');
        const productSelectionContainer = document.getElementById('productSelectionContainer');
        scopeSelect.onchange = () => {
            if (scopeSelect.value === 'specific_products') {
                productSelectionContainer.classList.remove('hidden');
            } else {
                productSelectionContainer.classList.add('hidden');
            }
        };

        // Product search filter inside list
        const productSearch = document.getElementById('productSelectSearch');
        const selectRows = document.querySelectorAll('.product-select-row');
        if (productSearch) {
            productSearch.oninput = () => {
                const query = productSearch.value.toLowerCase().trim();
                selectRows.forEach(row => {
                    const title = row.getAttribute('data-title');
                    if (title.includes(query)) {
                        row.classList.remove('hidden');
                    } else {
                        row.classList.add('hidden');
                    }
                });
            };
        }

        // Bind Save click
        document.getElementById('savePromoBtn').onclick = async () => {
            const form = document.getElementById('promoForm');
            if (!form.reportValidity()) return;

            const productIds = [];
            if (form.applicable_type.value === 'specific_products') {
                const checkboxes = form.querySelectorAll('input[name="product_ids"]:checked');
                checkboxes.forEach(cb => {
                    productIds.push(parseInt(cb.value));
                });
                if (productIds.length === 0) {
                    alert("Hãy chọn ít nhất một sản phẩm áp dụng.");
                    return;
                }
            }

            const payload = {
                code: form.code.value.toUpperCase().trim(),
                name: form.name.value.trim(),
                type: form.type.value,
                value: parseFloat(form.value.value),
                max_discount_amount: form.max_discount_amount && form.max_discount_amount.value !== '' ? parseFloat(form.max_discount_amount.value) : null,
                min_order_value: parseFloat(form.min_order_value.value),
                applicable_type: form.applicable_type.value,
                total_limit: form.total_limit.value !== '' ? parseInt(form.total_limit.value) : null,
                per_user_limit: parseInt(form.per_user_limit.value),
                is_stackable: form.is_stackable.checked,
                is_active: form.is_active.checked,
                start_date: form.start_date.value.replace('T', ' '),
                end_date: form.end_date.value.replace('T', ' '),
                product_ids: productIds
            };

            const btn = document.getElementById('savePromoBtn');
            btn.disabled = true;
            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> ĐANG LƯU...`;

        };
    }

    // --- Tab: User Behavior (GA4) ---
    async renderUsers(el) {
        el.innerHTML = `
            <div class="flex flex-col items-center justify-center p-12 text-neutral-400 dark:text-neutral-500 uppercase tracking-widest text-xs">
                <i class="fa-solid fa-spinner fa-spin text-2xl mb-4 text-amber-500"></i>
                <span>Đang tải dữ liệu GA4...</span>
            </div>
        `;

        try {
            const res = await fetch(`${API_BASE_URL}/google-analytics/report`, { credentials: 'include' });
            const result = await res.json();

            if (!result.success) {
                throw new Error(result.error || "Không thể lấy báo cáo GA4");
            }

            const { isSimulated, data, message } = result;
            const metrics = data.metrics;
            const chartData = data.trafficChart;
            const topPages = data.topPages;

            el.innerHTML = `
                <div class="space-y-8 animate-fade-in font-sans">
                    <!-- Top Section -->
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
                        <div>
                            <h1 class="font-serif text-2xl font-normal text-neutral-900 dark:text-white uppercase tracking-wider">HÀNH VI NGƯỜI DÙNG (GA4)</h1>
                            <p class="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-1">Phân tích hành trình khách hàng & lưu lượng</p>
                        </div>

                        <div class="flex items-center gap-3">
                            <button id="btnConfigureGA" class="border border-neutral-250 dark:border-neutral-850 hover:border-neutral-900 dark:hover:border-neutral-400 text-[10px] font-bold tracking-widest uppercase px-4 py-2.5 transition-colors font-sans flex items-center gap-1.5 bg-white dark:bg-[#1a1a1a]">
                                <i class="fa-solid fa-gear text-[11px]"></i> CẤU HÌNH GA4
                            </button>
                            <a href="${API_BASE_URL}/google-analytics/export" target="_blank" id="btnExportExcelGA" class="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold tracking-widest uppercase px-4 py-2.5 transition-colors font-sans flex items-center gap-1.5 outline-none">
                                <i class="fa-solid fa-file-excel text-[11px]"></i> XUẤT FILE EXCEL
                            </a>
                        </div>
                    </div>

                    ${isSimulated ? `
                        <div class="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold tracking-widest flex items-center gap-3 uppercase">
                            <i class="fa-solid fa-circle-exclamation text-sm text-amber-500"></i>
                            <span>${message}</span>
                        </div>
                    ` : ''}

                    <!-- Stats Indicators -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div class="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 p-6 relative overflow-hidden">
                            <span class="text-[9px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase block">NGƯỜI DÙNG HÔM NAY</span>
                            <div class="mt-4 font-serif text-3xl font-normal text-neutral-900 dark:text-white flex items-baseline gap-2">
                                <span>${metrics.activeUsersToday}</span>
                                <span class="text-xs font-sans text-neutral-400 font-bold uppercase tracking-widest">Active</span>
                            </div>
                            <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500/40 via-amber-500 to-transparent"></div>
                        </div>

                        <div class="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 p-6 relative overflow-hidden">
                            <span class="text-[9px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase block">LƯỢT TRUY CẬP (7 NGÀY)</span>
                            <div class="mt-4 font-serif text-3xl font-normal text-neutral-900 dark:text-white flex items-baseline gap-2">
                                <span>${metrics.totalSessions7Days}</span>
                                <span class="text-xs font-sans text-neutral-400 font-bold uppercase tracking-widest">Sessions</span>
                            </div>
                            <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500/40 via-amber-500 to-transparent"></div>
                        </div>

                        <div class="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 p-6 relative overflow-hidden">
                            <span class="text-[9px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase block">THỜI GIAN TRÊN TRANG TB</span>
                            <div class="mt-4 font-serif text-3xl font-normal text-neutral-900 dark:text-white flex items-baseline gap-2">
                                <span>${Math.floor(metrics.averageSessionDuration / 60)}m ${metrics.averageSessionDuration % 60}s</span>
                            </div>
                            <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500/40 via-amber-500 to-transparent"></div>
                        </div>

                        <div class="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 p-6 relative overflow-hidden">
                            <span class="text-[9px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase block">TỶ LỆ CHUYỂN ĐỔI ECOMMERCE</span>
                            <div class="mt-4 font-serif text-3xl font-normal text-neutral-900 dark:text-white flex items-baseline gap-2">
                                <span>${metrics.conversionRate}%</span>
                            </div>
                            <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500/40 via-amber-500 to-transparent"></div>
                        </div>
                    </div>

                    <!-- Traffic and Pages split -->
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        <!-- Traffic Chart (Col span 1) -->
                        <div class="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 p-6 flex flex-col justify-between">
                            <div class="border-b border-neutral-200 dark:border-neutral-800 pb-4 mb-4">
                                <h2 class="text-xs font-bold tracking-widest text-neutral-900 dark:text-white uppercase font-sans">TRUY CẬP HÀNG NGÀY</h2>
                            </div>
                            <div class="space-y-4">
                                ${chartData.map(pt => {
                                    const percent = Math.min(100, Math.round((pt.sessions / Math.max(...chartData.map(c => c.sessions))) * 100));
                                    return `
                                        <div class="space-y-1.5">
                                            <div class="flex justify-between items-center text-[10px] font-bold tracking-wider uppercase font-sans">
                                                <span class="text-neutral-850 dark:text-neutral-200">${pt.label}</span>
                                                <span class="text-neutral-400">${pt.activeUsers} Users / ${pt.sessions} Sessions</span>
                                            </div>
                                            <div class="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-none overflow-hidden">
                                                <div class="bg-amber-500 h-full transition-all duration-500" style="width: ${percent}%;"></div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>

                        <!-- Top Pages Table (Col span 2) -->
                        <div class="lg:col-span-2 bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 p-6">
                            <div class="border-b border-neutral-200 dark:border-neutral-800 pb-4 mb-4">
                                <h2 class="text-xs font-bold tracking-widest text-neutral-900 dark:text-white uppercase font-sans">CÁC TRANG TRUY CẬP NHIỀU NHẤT (30 NGÀY QUA)</h2>
                            </div>
                            <div class="overflow-x-auto">
                                <table class="w-full text-left border-collapse">
                                    <thead>
                                        <tr class="border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase font-sans">
                                            <th class="pb-3">TIÊU ĐỀ TRANG / ĐƯỜNG DẪN</th>
                                            <th class="pb-3 text-center">LƯỢT XEM</th>
                                            <th class="pb-3 text-center">ACTIVE USERS</th>
                                            <th class="pb-3 text-right">ENGAGEMENT TIME TB</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/60 text-xs font-medium font-sans">
                                        ${topPages.map(page => `
                                            <tr class="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10 transition-colors">
                                                <td class="py-3">
                                                    <div class="font-serif text-neutral-900 dark:text-white text-sm font-normal">${page.title}</div>
                                                    <div class="text-[9px] text-neutral-400 font-mono tracking-wider mt-0.5">${page.path}</div>
                                                </td>
                                                <td class="py-3 text-center font-bold text-neutral-850 dark:text-neutral-300 font-mono">${page.pageviews}</td>
                                                <td class="py-3 text-center font-bold text-neutral-850 dark:text-neutral-300 font-mono">${page.activeUsers}</td>
                                                <td class="py-3 text-right font-bold text-amber-500 font-mono">${page.avgTimeSeconds}s</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            `;

            // Bind configuration modal trigger
            document.getElementById('btnConfigureGA').onclick = () => {
                this.renderGAConfigurationModal();
            };

            // Bind Export Excel with credential options
            document.getElementById('btnExportExcelGA').onclick = (e) => {
                this.showToast("Đang kết xuất và tải tệp Excel báo cáo...");
            };

        } catch (e) {
            console.error(e);
            el.innerHTML = `
                <div class="p-12 border border-neutral-200 dark:border-neutral-800 text-center bg-white dark:bg-[#1a1a1a] space-y-4">
                    <div class="text-red-500 text-sm font-bold uppercase tracking-wider font-sans">
                        <i class="fa-solid fa-circle-exclamation mr-2"></i> Không thể tải dữ liệu phân tích người dùng
                    </div>
                    <div class="text-xs text-neutral-400 font-sans">${e.message}</div>
                    <button id="btnRetryGA" class="bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 px-4 py-2 text-[10px] font-bold tracking-widest uppercase font-sans">
                        THỬ LẠI
                    </button>
                </div>
            `;
            document.getElementById('btnRetryGA').onclick = () => this.renderUsers(el);
        }
    }

    renderGAConfigurationModal() {
        const modal = document.getElementById('invoiceModal');
        if (!modal) return;

        modal.innerHTML = `
            <div class="bg-white dark:bg-[#1a1a1a] border border-neutral-250 dark:border-neutral-800 w-full max-w-xl shadow-2xl relative animate-scale-up">
                <!-- Modal Top header -->
                <div class="h-16 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-6">
                    <h3 class="font-serif text-sm font-bold tracking-wider text-neutral-900 dark:text-white uppercase">CẤU HÌNH KẾT NỐI GA4 LIVE API</h3>
                    <button id="closeConfigModalBtn" class="text-neutral-400 hover:text-neutral-950 dark:hover:text-white outline-none">
                        <i class="fa-solid fa-xmark text-sm"></i>
                    </button>
                </div>

                <!-- Form container -->
                <form id="gaConfigForm" class="p-6 space-y-6 font-sans">
                    <div class="flex flex-col gap-2 font-sans">
                        <label class="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">GA4 PROPERTY ID *</label>
                        <input 
                            type="text" 
                            name="propertyId" 
                            required 
                            placeholder="Ví dụ: 432198765" 
                            class="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 p-3 outline-none focus:border-amber-500 text-neutral-800 dark:text-white font-mono"
                        />
                        <span class="text-[9px] text-neutral-400 lowercase">Xem trong Admin > Property Settings của trang Google Analytics</span>
                    </div>

                    <div class="flex flex-col gap-2 font-sans">
                        <label class="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">SERVICE ACCOUNT JSON CONTENT *</label>
                        <textarea 
                            name="serviceAccount" 
                            rows="8" 
                            required 
                            placeholder='Dán nội dung tệp tin JSON tải từ Google Cloud Console (Service Account Key) vào đây...' 
                            class="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 p-3 outline-none focus:border-amber-500 text-neutral-800 dark:text-white font-mono text-[10px]"
                        ></textarea>
                        <span class="text-[9px] text-neutral-400 leading-normal">
                            Yêu cầu: Có các trường client_email và private_key. Email của Service Account phải được cấp quyền Viewer trong tài khoản Google Analytics của bạn.
                        </span>
                    </div>
                </form>

                <!-- Modal Bottom actions -->
                <div class="h-16 bg-neutral-50 dark:bg-[#1a1a1a] border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end px-6 gap-4">
                    <button id="closeConfigModalBtn2" type="button" class="border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-5 py-2.5 text-[10px] font-bold tracking-widest uppercase transition-colors outline-none font-sans">
                        Hủy
                    </button>
                    <button id="saveGAConfigBtn" type="button" class="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 text-[10px] font-bold tracking-widest uppercase transition-colors outline-none flex items-center gap-1.5 font-sans">
                        <i class="fa-solid fa-floppy-disk"></i> LƯU CẤU HÌNH
                    </button>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');

        // Bind closures
        const closeModal = () => {
            modal.classList.add('hidden');
        };
        document.getElementById('closeConfigModalBtn').onclick = closeModal;
        document.getElementById('closeConfigModalBtn2').onclick = closeModal;

        // Save action
        document.getElementById('saveGAConfigBtn').onclick = async () => {
            const form = document.getElementById('gaConfigForm');
            if (!form.reportValidity()) return;

            const payload = {
                propertyId: form.propertyId.value.trim(),
                serviceAccount: form.serviceAccount.value.trim()
            };

            const btn = document.getElementById('saveGAConfigBtn');
            btn.disabled = true;
            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> ĐANG LƯU...`;

            try {
                const res = await fetch(`${API_BASE_URL}/google-analytics/config`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    credentials: 'include'
                });
                const result = await res.json();

                if (result.success) {
                    this.showToast("Cấu hình Google Analytics 4 kết nối thành công!");
                    closeModal();
                    this.renderWorkspace();
                } else {
                    this.showToast(result.error || "Gặp lỗi khi lưu cấu hình.", "error");
                    btn.disabled = false;
                    btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> LƯU CẤU HÌNH`;
                }
            } catch (err) {
                this.showToast("Không kết nối được tới máy chủ.", "error");
                btn.disabled = false;
                btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> LƯU CẤU HÌNH`;
            }
        };
    }
}
