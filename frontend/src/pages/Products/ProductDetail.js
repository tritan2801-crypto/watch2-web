/**
 * Page Orchestrator: ProductDetailPage
 */
import MainNavbar from '../../components/MainNavbar.js';
import Footer from '../Home/Footer.js';
import { createDialog } from '../../components/ui/dialog.js';

const API_BASE_URL = "http://localhost:8000/api";

function getProductSpecs(product) {
    const title = product.title || '';
    const size = product.size || '40mm';
    let specs = {
        movement: 'Quartz Nhật Bản (Miyota)',
        strap: 'Dây da thật',
        waterResistance: '5 ATM',
        caseSize: size
    };

    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('classic')) {
        specs.movement = 'Quartz Nhật Bản (Miyota)';
        specs.strap = 'Dây da thật';
        specs.waterResistance = '5 ATM';
    } else if (lowerTitle.includes('ceramic') || lowerTitle.includes('coronado')) {
        specs.movement = 'Quartz Nhật Bản (Seiko)';
        specs.strap = 'Dây gốm Ceramic';
        specs.waterResistance = '3 ATM';
    } else if (lowerTitle.includes('stella') || lowerTitle.includes('nova')) {
        specs.movement = 'Quartz Nhật Bản (Miyota)';
        specs.strap = 'Lưới thép vàng hồng';
        specs.waterResistance = '3 ATM';
    } else if (lowerTitle.includes('chrono')) {
        specs.movement = 'Quartz bấm giờ (Chrono)';
        specs.strap = 'Dây Ceramic đen nhám';
        specs.waterResistance = '10 ATM';
    } else if (lowerTitle.includes('legacy')) {
        specs.movement = 'Máy cơ tự động (Automatic)';
        specs.strap = 'Dây da Ý cao cấp';
        specs.waterResistance = '3 ATM';
    } else if (lowerTitle.includes('ocean') || lowerTitle.includes('drive')) {
        specs.movement = 'Máy cơ tự động (Automatic)';
        specs.strap = 'Thép không gỉ 316L';
        specs.waterResistance = '20 ATM';
    }
    return specs;
}

export default class ProductDetailPage {
    constructor(productId) {
        this.productId = productId;
        this.app = document.getElementById('app');
        this.user = null;
        this.product = null;
        this.relatedProducts = [];
        this.cart = this.loadCart();
        
        // Component Instances
        this.navbar = null;
        
        // UI Elements
        this.cartDrawer = null;
        this.cartBackdrop = null;
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

    saveCart() {
        localStorage.setItem('mvmt_cart', JSON.stringify(this.cart));
        if (this.navbar) {
            this.navbar.setCartCount(this.getCartCount());
        }
    }

    getCartCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    getCartSubtotal() {
        return this.cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    }

    addToCart(product, quantity = 1) {
        quantity = parseInt(quantity);
        if (isNaN(quantity) || quantity <= 0) return;

        const cartItem = this.cart.find(item => item.product.id === product.id);
        const currentQtyInCart = cartItem ? cartItem.quantity : 0;
        
        if (product.stock < currentQtyInCart + quantity) {
            this.showToast(`Sản phẩm '${product.title}' chỉ còn ${product.stock} sản phẩm trong kho.`, 'error');
            return;
        }

        if (cartItem) {
            cartItem.quantity += quantity;
        } else {
            this.cart.push({ product, quantity });
        }
        this.saveCart();
        this.showToast(`Đã thêm ${quantity} x ${product.title} vào giỏ hàng! <a href="#/cart" class="underline ml-2 text-accent font-sans">Xem giỏ hàng</a>`);
    }

    updateCartQuantity(productId, newQty) {
        const item = this.cart.find(i => i.product.id === productId);
        if (!item) return;

        newQty = parseInt(newQty);
        if (newQty <= 0) {
            this.removeFromCart(productId);
            return;
        }

        if (item.product.stock < newQty) {
            this.showToast(`Sản phẩm này chỉ còn ${item.product.stock} trong kho.`, 'error');
            item.quantity = item.product.stock;
        } else {
            item.quantity = newQty;
        }
        this.saveCart();
    }

    removeFromCart(productId) {
        const index = this.cart.findIndex(i => i.product.id === productId);
        if (index > -1) {
            const title = this.cart[index].product.title;
            this.cart.splice(index, 1);
            this.saveCart();
            this.showToast(`Đã xóa ${title} khỏi giỏ hàng.`);
        }
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
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

    // --- Authentication ---
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

    // 1. Cart Drawer has been removed (Cart is now a standalone page)

    // --- Quick View Modal ---
    openQuickView(product) {
        const content = document.createElement('div');
        content.className = "grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-10 bg-white dark:bg-[#1a1a1a] text-primary dark:text-white transition-colors duration-500";
        content.innerHTML = `
            <!-- Left Side Image -->
            <div class="bg-bgLight dark:bg-[#121212] h-48 md:h-auto md:aspect-[4/5] overflow-hidden flex items-center justify-center border border-gray-100 dark:border-accent/10 shrink-0">
                <img src="${product.image_url}" alt="${product.title}" class="w-full h-full object-cover">
            </div>
            
            <!-- Right Side Info -->
            <div class="flex flex-col justify-center">
                <span class="text-[10px] text-accent font-semibold uppercase tracking-[0.2em] mb-2">${product.category}</span>
                <h3 class="font-serif text-2xl md:text-3xl font-normal text-primary dark:text-white mb-2 leading-tight">${product.title}</h3>
                <span class="text-xs text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider font-semibold">Size: ${product.size}</span>
                
                <div class="text-2xl font-bold text-accent mb-6 font-sans">${window.formatPrice(product.price)}</div>
                
                <p class="text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6 font-sans">
                    ${product.description || 'Không có mô tả cho sản phẩm này.'}
                </p>
                
                <div class="flex items-center gap-2 mb-2 text-xs font-semibold ${product.stock > 0 ? 'text-green-500' : 'text-sale'}">
                    <i class="fa-solid ${product.stock > 0 ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
                    <span>${product.stock > 0 ? `Còn hàng (${product.stock} chiếc)` : 'Hết hàng'}</span>
                </div>
                
                <div class="flex flex-col gap-3 mt-4">
                    ${product.stock > 0 ? `
                        <div class="flex items-center border border-gray-200 dark:border-accent/30 bg-white dark:bg-[#121212] w-32 mb-1">
                            <button id="qvMinus" class="w-10 h-10 flex justify-center items-center text-sm text-primary dark:text-white hover:text-accent dark:hover:text-accent transition-colors outline-none"><i class="fa-solid fa-minus"></i></button>
                            <input id="qvQty" type="text" value="1" readonly class="w-12 text-center text-sm font-bold text-primary dark:text-white bg-transparent focus:outline-none select-none">
                            <button id="qvPlus" class="w-10 h-10 flex justify-center items-center text-sm text-primary dark:text-white hover:text-accent dark:hover:text-accent transition-colors outline-none"><i class="fa-solid fa-plus"></i></button>
                        </div>
                        <button id="qvAddToCart" class="w-full bg-accent text-white text-xs font-bold tracking-widest uppercase py-4 hover:bg-accentHover transition-all duration-300 outline-none">THÊM VÀO GIỎ</button>
                    ` : ''}
                    <a href="#/product/${product.id}" id="qvViewDetails" class="w-full text-center border border-gray-300 dark:border-accent/40 text-primary dark:text-white text-xs font-bold tracking-widest uppercase py-4 hover:bg-primary hover:text-white dark:hover:bg-white dark:hover:text-primary hover:border-primary dark:hover:border-white transition-all duration-300 block font-sans">CHI TIẾT SẢN PHẨM</a>
                </div>
            </div>
        `;

        const dialog = createDialog({
            content: content,
            className: 'w-[90%] max-w-4xl rounded-none bg-white dark:bg-[#1a1a1a] border border-accent/30 dark:border-accent/60 shadow-[0_0_50px_rgba(0,0,0,0.05)] dark:shadow-[0_0_50px_rgba(197,160,89,0.15)]',
            closeBtnClassName: 'text-primary dark:text-white/70 hover:text-accent dark:hover:text-accent'
        });

        const btnViewDetails = content.querySelector('#qvViewDetails');
        if (btnViewDetails) {
            btnViewDetails.onclick = () => {
                dialog.hide();
            };
        }

        if (product.stock > 0) {
            const qtyInput = content.querySelector('#qvQty');
            const btnMinus = content.querySelector('#qvMinus');
            const btnPlus = content.querySelector('#qvPlus');
            const btnAdd = content.querySelector('#qvAddToCart');

            let qtyVal = 1;
            btnMinus.onclick = () => {
                if (qtyVal > 1) {
                    qtyVal--;
                    qtyInput.value = qtyVal;
                }
            };
            btnPlus.onclick = () => {
                if (qtyVal < product.stock) {
                    qtyVal++;
                    qtyInput.value = qtyVal;
                } else {
                    this.showToast(`Sản phẩm này chỉ còn ${product.stock} trong kho.`, 'error');
                }
            };
            btnAdd.onclick = () => {
                this.addToCart(product, qtyVal);
                dialog.hide();
            };
        }

        dialog.show();
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
            } else {
                this.showToast("Lỗi đăng xuất.", "error");
            }
        } catch (e) {
            console.error(e);
            this.showToast("Không kết nối được tới máy chủ API.", "error");
        }
    }

    // --- API Data Fetching ---
    async fetchProductDetails() {
        try {
            const res = await fetch(`${API_BASE_URL}/products/${this.productId}`);
            if (!res.ok) throw new Error("Product not found");
            const data = await res.json();
            if (data.success && data.data) {
                this.product = data.data;
                if (this.product.category && this.product.category.toLowerCase() === 'watches') {
                    this.product.category = 'Womens Watches';
                }
            } else {
                throw new Error("Product data not found");
            }
        } catch (e) {
            console.error(e);
            this.product = null;
        }
    }

    async fetchRelatedProducts() {
        if (!this.product) return;
        try {
            const res = await fetch(`${API_BASE_URL}/products`);
            const data = await res.json();
            if (data.success && data.data) {
                const products = data.data.map(p => {
                    if (p.category && p.category.toLowerCase() === 'watches') {
                        p.category = 'Womens Watches';
                    }
                    return p;
                });
                // Filter items of the same category, excluding current product
                let filtered = products.filter(p => p.category === this.product.category && p.id !== this.product.id);
                // If not enough related products, backfill with others
                if (filtered.length < 4) {
                    const extra = data.data.filter(p => p.id !== this.product.id && p.category !== this.product.category);
                    filtered = [...filtered, ...extra];
                }
                this.relatedProducts = filtered.slice(0, 4);
            }
        } catch (e) {
            console.error("Lỗi khi tải sản phẩm liên quan:", e);
        }
    }

    // --- Render Method ---
    async render() {
        this.app.innerHTML = `
            <div class="flex justify-center items-center py-40">
                <i class="fa-solid fa-spinner fa-spin text-3xl text-accent"></i>
            </div>
        `;

        // 1. Initial Load & Session Check
        await this.checkAuthStatus();
        await this.fetchProductDetails();

        if (!this.product) {
            this.renderError();
            return;
        }

        await this.fetchRelatedProducts();

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

        // 3. Render Product Detail Shell
        const specs = getProductSpecs(this.product);

        const pageShell = document.createElement('div');
        pageShell.className = "bg-white dark:bg-bgDark pt-20 transition-colors duration-500";
        pageShell.innerHTML = `
            <!-- Breadcrumbs -->
            <div class="border-b border-accent/50 dark:border-accent/40">
                <div class="max-w-7xl mx-auto px-6 md:px-12 py-5 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-sans tracking-wide">
                    <a href="#/" class="hover:text-accent transition-colors">Trang chủ</a>
                    <span class="text-gray-300 dark:text-gray-700 mx-1">&gt;</span>
                    <a href="#/products" class="hover:text-accent transition-colors">Cửa hàng</a>
                    <span class="text-gray-300 dark:text-gray-700 mx-1">&gt;</span>
                    <span class="text-primary dark:text-white font-medium">${this.product.title}</span>
                </div>
            </div>

            <!-- Product Details Container -->
            <div class="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                    
                    <!-- Left Image Frame -->
                    <div class="bg-bgLight dark:bg-bgDarkSoft aspect-[4/5] overflow-hidden flex items-center justify-center border border-gray-100 dark:border-neutral-900/50 relative group transition-colors duration-500">
                        ${parseInt(this.product.is_new) === 1 ? `<span class="absolute top-6 left-6 bg-primary dark:bg-white dark:text-primary text-white text-[9px] font-bold tracking-wider px-3 py-1 uppercase z-10">NEW</span>` : ''}
                        ${parseInt(this.product.is_bestseller) === 1 ? `<span class="absolute top-6 left-6 bg-accent text-white text-[9px] font-bold tracking-wider px-3 py-1 uppercase z-10">BEST SELLER</span>` : ''}
                        <img src="${this.product.image_url}" alt="${this.product.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                    </div>

                    <!-- Right Specs Information -->
                    <div class="flex flex-col">
                        <span class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-2">${this.product.category}</span>
                        <h1 class="font-serif text-3xl md:text-4xl lg:text-5xl font-normal text-primary dark:text-white mb-3 leading-tight tracking-wide">${this.product.title}</h1>
                        <span class="text-xs text-gray-500 dark:text-gray-400 font-semibold tracking-wider uppercase mb-5">Size: ${this.product.size}</span>
                        
                        <div class="text-2xl font-bold text-primary dark:text-white mb-6">${window.formatPrice(this.product.price)}</div>
                        
                        <div class="border-t border-neutral-100 dark:border-neutral-900/50 my-6"></div>
                        
                        <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-8 font-sans">
                            ${this.product.description || 'Sản phẩm đồng hồ sang trọng cao cấp từ bộ sưu tập mới nhất. Thiết kế mặt số tinh tế kết hợp sự hài hòa của màu sắc và chất liệu kim loại cao cấp mang lại vẻ đẹp vượt thời gian.'}
                        </p>

                        <!-- Specifications Grid -->
                        <div class="grid grid-cols-2 gap-x-8 gap-y-6 border-y border-accent/50 dark:border-accent/40 py-6 my-8">
                            <div class="flex items-center gap-4">
                                <div class="p-2.5 bg-neutral-50 dark:bg-bgDarkSoft border border-neutral-100/50 dark:border-neutral-800/40 rounded-none shrink-0 transition-colors">
                                    <svg class="w-6 h-6 stroke-[#c5a059] fill-none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                        <circle cx="12" cy="12" r="3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M12 5V9M12 15V19M5 12H9M15 12H19" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                                <div>
                                    <span class="block text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider mb-1">Bộ máy</span>
                                    <span class="text-xs font-bold text-primary dark:text-white tracking-wide uppercase">${specs.movement}</span>
                                </div>
                            </div>
                            <div class="flex items-center gap-4">
                                <div class="p-2.5 bg-neutral-50 dark:bg-bgDarkSoft border border-neutral-100/50 dark:border-neutral-800/40 rounded-none shrink-0 transition-colors">
                                    <svg class="w-6 h-6 stroke-[#c5a059] fill-none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="7" y="2" width="10" height="20" rx="2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M7 8H17M7 16H17M12 2V22" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                                <div>
                                    <span class="block text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider mb-1">Dây đeo</span>
                                    <span class="text-xs font-bold text-primary dark:text-white tracking-wide uppercase">${specs.strap}</span>
                                </div>
                            </div>
                            <div class="flex items-center gap-4">
                                <div class="p-2.5 bg-neutral-50 dark:bg-bgDarkSoft border border-neutral-100/50 dark:border-neutral-800/40 rounded-none shrink-0 transition-colors">
                                    <svg class="w-6 h-6 stroke-[#c5a059] fill-none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2C12 2 19 9 19 13C19 16.866 15.866 20 12 20C8.13401 20 5 16.866 5 13C5 9 12 2 12 2Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M9 13C9 13 10.5 14.5 12 14.5C13.5 14.5 15 13 15 13" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                                <div>
                                    <span class="block text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider mb-1">Chống nước</span>
                                    <span class="text-xs font-bold text-primary dark:text-white tracking-wide uppercase">${specs.waterResistance}</span>
                                </div>
                            </div>
                            <div class="flex items-center gap-4">
                                <div class="p-2.5 bg-neutral-50 dark:bg-bgDarkSoft border border-neutral-100/50 dark:border-neutral-800/40 rounded-none shrink-0 transition-colors">
                                    <svg class="w-6 h-6 stroke-[#c5a059] fill-none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M3 12H21M12 3V21" stroke-width="1" stroke-dasharray="2 2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M6 9L3 12L6 15M18 9L21 12L18 15" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                                <div>
                                    <span class="block text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider mb-1">Đường kính mặt</span>
                                    <span class="text-xs font-bold text-primary dark:text-white tracking-wide uppercase">${specs.caseSize}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Purchase Actions -->
                        ${this.product.stock > 0 ? `
                            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <div class="flex items-center justify-between gap-3">
                                    <div class="flex items-center border border-gray-200 dark:border-neutral-800 h-14 w-32 bg-white dark:bg-bgDarkSoft transition-colors focus-within:border-primary dark:focus-within:border-white">
                                        <button id="pdMinus" class="w-10 h-full flex justify-center items-center text-sm text-primary dark:text-white hover:text-accent transition-colors outline-none"><i class="fa-solid fa-minus text-xs"></i></button>
                                        <input id="pdQty" type="text" value="1" readonly class="w-12 text-center text-sm font-bold text-primary dark:text-white focus:outline-none select-none bg-transparent">
                                        <button id="pdPlus" class="w-10 h-full flex justify-center items-center text-sm text-primary dark:text-white hover:text-accent transition-colors outline-none"><i class="fa-solid fa-plus text-xs"></i></button>
                                    </div>
                                    
                                    <button id="pdWishlist" class="sm:hidden w-14 h-14 border border-gray-200 dark:border-neutral-800 flex justify-center items-center text-lg text-primary dark:text-white hover:text-sale hover:border-sale dark:hover:border-neutral-700 transition-all duration-300 outline-none">
                                        <i class="fa-regular fa-heart"></i>
                                    </button>
                                </div>
                                
                                <button id="pdAddToBag" class="flex-grow h-14 bg-primary dark:bg-white text-white dark:text-primary text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-accent dark:hover:bg-accent hover:text-white transition-all duration-300 outline-none">
                                    <i class="fa-solid fa-bag-shopping"></i>
                                    <span>THÊM VÀO GIỎ — ${window.formatPrice(this.product.price)}</span>
                                </button>
                                
                                <button id="pdWishlistDesktop" class="hidden sm:flex w-14 h-14 border border-gray-200 dark:border-neutral-800 justify-center items-center text-lg text-primary dark:text-white hover:text-sale hover:border-sale dark:hover:border-neutral-700 transition-all duration-300 outline-none">
                                    <i class="fa-regular fa-heart"></i>
                                </button>
                            </div>
                            <div class="flex items-center gap-2 mt-4 text-xs font-bold text-green-600 dark:text-green-500">
                                <i class="fa-solid fa-circle-check"></i>
                                <span>Còn hàng (${this.product.stock} chiếc)</span>
                            </div>
                        ` : `
                            <button disabled class="w-full h-14 bg-gray-200 dark:bg-neutral-800 text-gray-400 dark:text-neutral-600 text-xs font-bold tracking-widest uppercase cursor-not-allowed">HẾT HÀNG</button>
                            <div class="flex items-center gap-2 mt-4 text-xs font-bold text-sale">
                                <i class="fa-solid fa-circle-xmark"></i>
                                <span>Hết hàng</span>
                            </div>
                        `}

                        <!-- Value Propositions -->
                        <div class="mt-8 pt-8 border-t border-neutral-100 dark:border-neutral-900/50 flex flex-col gap-4 text-xs text-gray-500 dark:text-gray-400 font-bold tracking-wide uppercase">
                            <div class="flex items-center gap-3">
                                <i class="fa-solid fa-tag text-[#c5a059] w-5 text-center text-base"></i>
                                <span>Giao hàng miễn phí cho đơn từ 1.000.000đ</span>
                            </div>
                            <div class="flex items-center gap-3">
                                <i class="fa-solid fa-arrows-rotate text-[#c5a059] w-5 text-center text-base"></i>
                                <span>Đổi trả dễ dàng trong 60 ngày</span>
                            </div>
                            <div class="flex items-center gap-3">
                                <i class="fa-solid fa-shield-halved text-[#c5a059] w-5 text-center text-base"></i>
                                <span>Bao gồm bảo hành chính hãng 2 năm</span>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- You May Also Like Section -->
                <div class="mt-24 md:mt-32">
                    <div class="flex justify-between items-baseline border-b border-accent/50 dark:border-accent/40 pb-4 mb-8">
                        <h3 class="font-serif text-xl md:text-2xl font-normal text-primary dark:text-white tracking-wide">Có Thể Bạn Cũng Thích</h3>
                        <a href="#/products" class="text-[10px] font-bold tracking-widest uppercase border-b border-primary dark:border-white text-primary dark:text-white hover:text-accent dark:hover:text-accent hover:border-accent dark:hover:border-accent transition-all pb-1">XEM TẤT CẢ</a>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-6" id="relatedProductsGrid"></div>
                </div>
            </div>
        `;

        this.app.appendChild(pageShell);
        this.app.appendChild(Footer.render());

        // Bind related products
        this.renderRelatedProducts();

        // Bind interactive events for current product details
        if (this.product.stock > 0) {
            const qtyInput = pageShell.querySelector('#pdQty');
            const btnMinus = pageShell.querySelector('#pdMinus');
            const btnPlus = pageShell.querySelector('#pdPlus');
            const btnAddToBag = pageShell.querySelector('#pdAddToBag');
            const btnWishlist = pageShell.querySelector('#pdWishlist');

            let qtyVal = 1;

            const updateButtonText = () => {
                const total = parseFloat(this.product.price) * qtyVal;
                btnAddToBag.querySelector('span').textContent = `THÊM VÀO GIỎ — ${window.formatPrice(total)}`;
            };

            btnMinus.onclick = () => {
                if (qtyVal > 1) {
                    qtyVal--;
                    qtyInput.value = qtyVal;
                    updateButtonText();
                }
            };

            btnPlus.onclick = () => {
                if (qtyVal < this.product.stock) {
                    qtyVal++;
                    qtyInput.value = qtyVal;
                    updateButtonText();
                } else {
                    this.showToast(`Sản phẩm này chỉ còn ${this.product.stock} trong kho.`, 'error');
                }
            };

            btnAddToBag.onclick = () => {
                this.addToCart(this.product, qtyVal);
            };

            const btnWishlistDesktop = pageShell.querySelector('#pdWishlistDesktop');
            const handleWishlistClick = (btn) => {
                if (!btn) return;
                const heartIcon = btn.querySelector('i');
                if (heartIcon.classList.contains('fa-regular')) {
                    if (btnWishlist) btnWishlist.querySelector('i').className = "fa-solid fa-heart text-sale";
                    if (btnWishlistDesktop) btnWishlistDesktop.querySelector('i').className = "fa-solid fa-heart text-sale";
                    this.showToast("Đã thêm vào danh sách yêu thích!");
                } else {
                    if (btnWishlist) btnWishlist.querySelector('i').className = "fa-regular fa-heart";
                    if (btnWishlistDesktop) btnWishlistDesktop.querySelector('i').className = "fa-regular fa-heart";
                    this.showToast("Đã xóa khỏi danh sách yêu thích.");
                }
            };

            if (btnWishlist) btnWishlist.onclick = () => handleWishlistClick(btnWishlist);
            if (btnWishlistDesktop) btnWishlistDesktop.onclick = () => handleWishlistClick(btnWishlistDesktop);
        }

        // Bind Custom Global Event for Newsletter
        document.addEventListener('newsletter-signup', (e) => {
            this.showToast(`Đã đăng ký nhận tin với email: ${e.detail.email}`);
        });

        // Cart drawer has been removed (Cart is now a standalone page)
        
        // Scroll back to top on navigation load
        window.scrollTo(0, 0);
    }

    renderRelatedProducts() {
        const grid = document.getElementById('relatedProductsGrid');
        if (!grid) return;

        grid.innerHTML = '';
        if (this.relatedProducts.length === 0) {
            grid.innerHTML = `<div class="col-span-full text-center text-gray-400 dark:text-gray-500 py-10 text-xs font-semibold">Không có sản phẩm tương tự.</div>`;
            return;
        }

        this.relatedProducts.forEach(product => {
            const card = document.createElement('div');
            card.className = "group relative bg-white dark:bg-bgDarkSoft p-4 border border-transparent dark:border-neutral-900/40 hover:border-neutral-100 dark:hover:border-neutral-800/60 flex flex-col h-full hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-white/5 transition-all duration-500 transform translate-y-8 opacity-0";
            card.dataset.id = product.id;

            let badgesHtml = '';
            if (parseInt(product.is_new) === 1) {
                badgesHtml += `<span class="bg-primary dark:bg-white dark:text-primary text-white text-[9px] font-bold tracking-wider px-3 py-1 uppercase">MỚI</span>`;
            }
            if (parseInt(product.is_bestseller) === 1) {
                badgesHtml += `<span class="bg-accent text-white text-[9px] font-bold tracking-wider px-3 py-1 uppercase">BÁN CHẠY</span>`;
            }

            card.innerHTML = `
                <div class="relative bg-bgLight dark:bg-bgDark aspect-[4/5] overflow-hidden mb-5 cursor-pointer img-container">
                    <img src="${product.image_url}" alt="${product.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                    <div class="absolute top-4 left-4 flex flex-col gap-2 z-10">
                        ${badgesHtml}
                    </div>
                    <!-- Add To Cart Overlay -->
                    <div class="absolute -bottom-14 left-0 w-full bg-primary/95 dark:bg-white/95 p-4 text-center transition-all duration-300 group-hover:bottom-0 z-20 cart-overlay">
                        <button class="w-full text-white dark:text-primary text-xs font-bold tracking-widest uppercase hover:text-accent dark:hover:text-accent transition-colors btn-add-cart">THÊM VÀO GIỎ</button>
                    </div>
                </div>
                <div class="flex flex-col flex-grow">
                    <span class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 font-sans font-bold">${product.category}</span>
                    <h3 class="text-sm font-semibold text-primary dark:text-white hover:text-accent dark:hover:text-accent transition-colors cursor-pointer mb-1 prod-title">${product.title}</h3>
                    <span class="text-xs text-gray-400 dark:text-gray-500 mb-2">${product.size}</span>
                    <div class="flex items-center gap-2 font-bold text-sm text-primary dark:text-white">
                        <span>${window.formatPrice(product.price)}</span>
                    </div>
                </div>
            `;

            // Event handler to link to details page
            const viewDetailAction = () => {
                window.location.hash = `#/product/${product.id}`;
            };

            card.querySelector('.img-container').onclick = (e) => {
                if (e.target.closest('.cart-overlay')) return;
                viewDetailAction();
            };

            card.querySelector('.prod-title').onclick = viewDetailAction;

            card.querySelector('.btn-add-cart').onclick = () => {
                this.addToCart(product, 1);
            };

            grid.appendChild(card);

            // Scroll reveal
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        card.classList.remove('translate-y-8', 'opacity-0');
                        card.classList.add('translate-y-0', 'opacity-100');
                        observer.unobserve(card);
                    }
                });
            }, { threshold: 0.1 });

            observer.observe(card);
        });
    }

    renderError() {
        this.app.innerHTML = '';
        this.navbar = new MainNavbar({
            onCartClick: () => {},
            onLoginClick: () => { window.location.hash = "#/login"; },
            onLogoutClick: () => this.handleLogout()
        });
        this.app.appendChild(this.navbar.render());

        const errDiv = document.createElement('div');
        errDiv.className = "max-w-md mx-auto my-32 text-center px-6";
        errDiv.innerHTML = `
            <i class="fa-solid fa-circle-exclamation text-sale text-5xl mb-6"></i>
            <h2 class="font-serif text-2xl mb-4 text-primary dark:text-white">Không tìm thấy sản phẩm</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">Mã sản phẩm không hợp lệ hoặc sản phẩm đã bị xóa khỏi hệ thống.</p>
            <a href="#/products" class="inline-block bg-primary dark:bg-white text-white dark:text-primary text-xs font-bold tracking-widest uppercase py-4 px-8 hover:bg-accent dark:hover:bg-accent hover:text-white transition-all duration-300">QUAY LẠI CỬA HÀNG</a>
        `;
        this.app.appendChild(errDiv);
        this.app.appendChild(Footer.render());
    }
}
