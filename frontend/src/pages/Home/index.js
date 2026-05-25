/**
 * Page Orchestrator: HomePage
 */
import MainNavbar from '../../components/MainNavbar.js';
import Hero from './Hero.js';
import Categories from './Categories.js';
import BestSellers from './BestSellers.js';
import NewArrivals from './NewArrivals.js';
import BrandStory from './BrandStory.js';
import Footer from './Footer.js';
import ValueProps from './ValueProps.js';
import { createDialog } from '../../components/ui/dialog.js';

const API_BASE_URL = window.API_BASE_URL || "http://localhost:8000/api";

export default class HomePage {
    constructor() {
        this.app = document.getElementById('app');
        this.user = null;
        this.products = [];
        this.cart = this.loadCart();
        
        // Component Instances
        this.navbar = null;
        this.bestSellers = null;
        this.newArrivals = null;
        
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
        // Ensure quantity is positive
        quantity = parseInt(quantity);
        if (isNaN(quantity) || quantity <= 0) return;

        // Check stock limit
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
        // Force reflow
        toast.offsetHeight;
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

    // --- API Interactions ---
    async fetchProducts() {
        try {
            const res = await fetch(`${API_BASE_URL}/products`);
            const data = await res.json();
            if (data.success) {
                this.products = data.data.map(p => {
                    if (p.category && p.category.toLowerCase() === 'watches') {
                        p.category = 'Womens Watches';
                    }
                    return p;
                });
                if (this.bestSellers) this.bestSellers.setProducts(this.products);
                if (this.newArrivals) this.newArrivals.setProducts(this.products);
            } else {
                this.showToast("Không thể tải danh sách sản phẩm.", "error");
            }
        } catch (e) {
            console.error("Lỗi lấy sản phẩm:", e);
            this.showToast("Không kết nối được tới máy chủ API.", "error");
        }
    }

    async checkAuthStatus() {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/me`, { credentials: 'include' });
            if (res.status === 200) {
                const data = await res.json();
                if (data.success) {
                    this.user = data.data;
                    if (this.navbar) this.navbar.setUser(this.user);
                }
            }
        } catch (e) {
            console.error("Lỗi kiểm tra đăng nhập:", e);
        }
    }

    // --- UI Modals & Drawers ---
    
    // 1. Cart Drawer has been removed (Cart is now a standalone page)

    // 2. Quick View Modal
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

        // Set up interactive click actions
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

    // --- Page Orchestration & Render ---
    render() {
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
        this.navbar.setCartCount(this.getCartCount());
        
        // 2. Instantiate Dynamic Product Sections
        this.bestSellers = new BestSellers({
            onProductClick: (p) => this.openQuickView(p),
            onAddToCart: (p) => this.addToCart(p, 1)
        });

        this.newArrivals = new NewArrivals({
            onProductClick: (p) => this.openQuickView(p),
            onAddToCart: (p) => this.addToCart(p, 1)
        });

        // 3. Mount to DOM
        this.app.appendChild(this.navbar.render());
        this.app.appendChild(Hero.render());
        this.app.appendChild(this.bestSellers.render());
        this.app.appendChild(Categories.render());
        this.app.appendChild(this.newArrivals.render());
        this.app.appendChild(BrandStory.render());
        this.app.appendChild(ValueProps.render());
        this.app.appendChild(Footer.render());

        // 4. Bind Custom Global Event for Newsletter Toast Feedback
        document.addEventListener('newsletter-signup', (e) => {
            this.showToast(`Đã đăng ký nhận tin với email: ${e.detail.email}`);
        });

        // 5. Initial Data Load & Session Check
        this.checkAuthStatus();
        this.fetchProducts();
    }
}


