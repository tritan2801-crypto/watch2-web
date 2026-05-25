/**
 * Page Orchestrator: CartPage
 */
import MainNavbar from '../../components/MainNavbar.js';
import Footer from '../Home/Footer.js';
import { createDialog } from '../../components/ui/dialog.js';

const API_BASE_URL = "http://localhost:8000/api";

// Fallback datasets for Vietnam 3-level administrative units if Provinces Open API is unreachable
const FALLBACK_PROVINCES = [
    { code: "01", name: "Thành phố Hà Nội" },
    { code: "79", name: "Thành phố Hồ Chí Minh" },
    { code: "48", name: "Thành phố Đà Nẵng" },
    { code: "31", name: "Thành phố Hải Phòng" },
    { code: "74", name: "Tỉnh Bình Dương" },
    { code: "75", name: "Tỉnh Đồng Nai" }
];

const FALLBACK_DISTRICTS = {
    "01": [
        { code: "001", name: "Quận Ba Đình" },
        { code: "002", name: "Quận Hoàn Kiếm" },
        { code: "003", name: "Quận Tây Hồ" },
        { code: "005", name: "Quận Cầu Giấy" }
    ],
    "79": [
        { code: "760", name: "Quận 1" },
        { code: "770", name: "Quận 3" },
        { code: "774", name: "Quận Bình Thạnh" },
        { code: "769", name: "Thành phố Thủ Đức" }
    ],
    "48": [
        { code: "490", name: "Quận Hải Châu" },
        { code: "491", name: "Quận Thanh Khê" }
    ],
    "31": [
        { code: "303", name: "Quận Hồng Bàng" },
        { code: "304", name: "Quận Ngô Quyền" }
    ]
};

const FALLBACK_WARDS = {
    "001": [
        { code: "00001", name: "Phường Phúc Xá" },
        { code: "00004", name: "Phường Trúc Bạch" },
        { code: "00006", name: "Phường Vĩnh Phúc" }
    ],
    "002": [
        { code: "00037", name: "Phường Hàng Bạc" },
        { code: "00040", name: "Phường Hàng Đào" },
        { code: "00055", name: "Phường Tràng Tiền" }
    ],
    "760": [
        { code: "26734", name: "Phường Bến Nghé" },
        { code: "26743", name: "Phường Bến Thành" },
        { code: "26745", name: "Phường Phạm Ngũ Lão" }
    ],
    "769": [
        { code: "26863", name: "Phường Thủ Thiêm" },
        { code: "26864", name: "Phường An Khánh" },
        { code: "26866", name: "Phường Thảo Điền" }
    ]
};

const getFallbackDistricts = (provinceCode) => {
    return FALLBACK_DISTRICTS[provinceCode] || [
        { code: provinceCode + "1", name: "Quận Huyện Trung Tâm" },
        { code: provinceCode + "2", name: "Quận Huyện Ngoại Thành" }
    ];
};

const getFallbackWards = (districtCode) => {
    return FALLBACK_WARDS[districtCode] || [
        { code: districtCode + "1", name: "Phường Xã Trung Tâm" },
        { code: districtCode + "2", name: "Phường Xã Ngoại Thành" }
    ];
};

export default class CartPage {
    constructor() {
        this.app = document.getElementById('app');
        this.user = null;
        this.cart = this.loadCart();
        this.discountPercent = 0;
        this.appliedCoupon = null;
        this.step = 1;
        
        // Dynamic Geography Caches
        this.provinces = [];
        this.districtCache = {};
        this.wardCache = {};
        
        // Checkout Form State Persistence
        this.formData = {
            fullName: '',
            phone: '',
            provinceCode: '',
            provinceName: '',
            districtCode: '',
            districtName: '',
            wardCode: '',
            wardName: '',
            detailAddress: '',
            paymentMethod: 'COD'
        };
        
        // Component Instances
        this.navbar = null;
        
        // UI Elements
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
        this.renderCartLayout();
        
        if (this.appliedCoupon) {
            this.revalidateCoupon();
        }
    }

    getCartCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    getCartSubtotal() {
        return this.cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
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

    // --- Dynamic Vietnam Geography API ---
    async fetchProvinces() {
        console.log("[fetchProvinces] Called. Cache count:", this.provinces ? this.provinces.length : 0);
        if (this.provinces && this.provinces.length > 0) {
            return this.provinces;
        }
        try {
            console.log("[fetchProvinces] Fetching from API: https://esgoo.net/api-tinhthanh/1/0.htm");
            const res = await axios.get("https://esgoo.net/api-tinhthanh/1/0.htm");
            console.log("[fetchProvinces] Response data status:", res.status);
            
            let rawProvinces = [];
            if (res.data && res.data.error === 0 && Array.isArray(res.data.data)) {
                rawProvinces = res.data.data;
            } else if (res.data && Array.isArray(res.data)) {
                rawProvinces = res.data;
            } else {
                throw new Error("Invalid API response format");
            }

            // Normalize fields to code/name
            this.provinces = rawProvinces.map(p => ({
                code: String(p.id !== undefined ? p.id : (p.code !== undefined ? p.code : "")).trim(),
                name: String(p.full_name || p.name || "").trim()
            })).filter(p => p.code && p.name);

            console.log("[fetchProvinces] Normalized provinces count:", this.provinces.length);
            if (this.provinces.length === 0) {
                throw new Error("No valid provinces parsed from API");
            }
            return this.provinces;
        } catch (e) {
            console.warn("[fetchProvinces] Error encountered, falling back to local dataset:", e);
            this.provinces = FALLBACK_PROVINCES;
            return this.provinces;
        }
    }

    async fetchDistricts(provinceCode) {
        console.log("[fetchDistricts] Called with provinceCode:", provinceCode);
        if (this.districtCache[provinceCode]) {
            console.log("[fetchDistricts] Cache hit for:", provinceCode);
            return this.districtCache[provinceCode];
        }
        try {
            const url = `https://esgoo.net/api-tinhthanh/2/${provinceCode}.htm`;
            console.log("[fetchDistricts] Fetching from API:", url);
            const res = await axios.get(url);
            console.log("[fetchDistricts] Response status:", res.status);

            let rawDistricts = [];
            if (res.data && res.data.error === 0 && Array.isArray(res.data.data)) {
                rawDistricts = res.data.data;
            } else if (res.data && res.data.districts && Array.isArray(res.data.districts)) {
                rawDistricts = res.data.districts;
            } else {
                throw new Error("Invalid API response format");
            }

            // Normalize fields to code/name
            const districts = rawDistricts.map(d => ({
                code: String(d.id !== undefined ? d.id : (d.code !== undefined ? d.code : "")).trim(),
                name: String(d.full_name || d.name || "").trim()
            })).filter(d => d.code && d.name);

            console.log("[fetchDistricts] Normalized districts count:", districts.length);
            if (districts.length === 0) {
                throw new Error("No valid districts parsed from API");
            }
            this.districtCache[provinceCode] = districts;
            return districts;
        } catch (e) {
            console.warn(`[fetchDistricts] Error for provinceCode ${provinceCode}, falling back to local dataset:`, e);
            const districts = getFallbackDistricts(provinceCode);
            console.log("[fetchDistricts] Fallback loaded:", districts);
            this.districtCache[provinceCode] = districts;
            return districts;
        }
    }

    async fetchWards(districtCode) {
        console.log("[fetchWards] Called with districtCode:", districtCode);
        if (this.wardCache[districtCode]) {
            console.log("[fetchWards] Cache hit for:", districtCode);
            return this.wardCache[districtCode];
        }
        try {
            const url = `https://esgoo.net/api-tinhthanh/3/${districtCode}.htm`;
            console.log("[fetchWards] Fetching from API:", url);
            const res = await axios.get(url);
            console.log("[fetchWards] Response status:", res.status);

            let rawWards = [];
            if (res.data && res.data.error === 0 && Array.isArray(res.data.data)) {
                rawWards = res.data.data;
            } else if (res.data && res.data.wards && Array.isArray(res.data.wards)) {
                rawWards = res.data.wards;
            } else {
                throw new Error("Invalid API response format");
            }

            // Normalize fields to code/name
            const wards = rawWards.map(w => ({
                code: String(w.id !== undefined ? w.id : (w.code !== undefined ? w.code : "")).trim(),
                name: String(w.full_name || w.name || "").trim()
            })).filter(w => w.code && w.name);

            console.log("[fetchWards] Normalized wards count:", wards.length);
            if (wards.length === 0) {
                throw new Error("No valid wards parsed from API");
            }
            this.wardCache[districtCode] = wards;
            return wards;
        } catch (e) {
            console.warn(`[fetchWards] Error for districtCode ${districtCode}, falling back to local dataset:`, e);
            const wards = getFallbackWards(districtCode);
            console.log("[fetchWards] Fallback loaded:", wards);
            this.wardCache[districtCode] = wards;
            return wards;
        }
    }

    async handleCheckout() {
        const fullNameEl = document.getElementById('checkoutFullName');
        const phoneEl = document.getElementById('checkoutPhone');
        const provinceSelect = document.getElementById('checkoutProvince');
        const districtSelect = document.getElementById('checkoutDistrict');
        const wardSelect = document.getElementById('checkoutWard');
        const detailAddressEl = document.getElementById('checkoutDetailAddress');
        const paymentRadio = document.querySelector('input[name="paymentMethod"]:checked');

        const fullName = fullNameEl ? fullNameEl.value.trim() : '';
        const phone = phoneEl ? phoneEl.value.trim() : '';
        const province = provinceSelect && provinceSelect.selectedIndex > 0 ? provinceSelect.options[provinceSelect.selectedIndex].text : '';
        const district = districtSelect && districtSelect.selectedIndex > 0 ? districtSelect.options[districtSelect.selectedIndex].text : '';
        const ward = wardSelect && wardSelect.selectedIndex > 0 ? wardSelect.options[wardSelect.selectedIndex].text : '';
        const detailAddress = detailAddressEl ? detailAddressEl.value.trim() : '';
        const payment = paymentRadio ? paymentRadio.value : '';

        // Form Validation
        if (!fullName) {
            this.showToast("Vui lòng điền họ và tên người nhận.", "error");
            if (fullNameEl) fullNameEl.focus();
            return;
        }
        if (!phone) {
            this.showToast("Vui lòng điền số điện thoại.", "error");
            if (phoneEl) phoneEl.focus();
            return;
        }
        if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(phone)) {
            this.showToast("Số điện thoại không hợp lệ (Vui lòng dùng số di động VN dạng 10 chữ số).", "error");
            if (phoneEl) phoneEl.focus();
            return;
        }
        if (!provinceSelect || !provinceSelect.value) {
            this.showToast("Vui lòng chọn Tỉnh/Thành phố.", "error");
            if (provinceSelect) provinceSelect.focus();
            return;
        }
        if (!districtSelect || !districtSelect.value) {
            this.showToast("Vui lòng chọn Quận/Huyện.", "error");
            if (districtSelect) districtSelect.focus();
            return;
        }
        if (!wardSelect || !wardSelect.value) {
            this.showToast("Vui lòng chọn Phường/Xã.", "error");
            if (wardSelect) wardSelect.focus();
            return;
        }
        if (!detailAddress) {
            this.showToast("Vui lòng điền địa chỉ chi tiết (số nhà, tên đường).", "error");
            if (detailAddressEl) detailAddressEl.focus();
            return;
        }

        const btn = document.getElementById('btnCheckout');
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i> ĐANG XỬ LÝ...`;

        try {
            const itemsPayload = this.cart.map(item => ({
                product_id: item.product.id,
                quantity: item.quantity
            }));

            // Format address string nicely for backend database compatibility
            const promoStr = this.appliedCoupon ? ` (KM: ${this.appliedCoupon.code} giảm ${window.formatPrice(this.appliedCoupon.discount_amount)})` : '';
            const formattedAddress = `Họ tên: ${fullName} | SĐT: ${phone} | PTTT: ${payment} | ĐC: ${detailAddress}, ${ward}, ${district}, ${province}${promoStr}`;

            const res = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: itemsPayload,
                    shipping_address: formattedAddress,
                    coupon_code: this.appliedCoupon ? this.appliedCoupon.code : null
                }),
                credentials: 'include'
            });

            const data = await res.json();
            if (data.success) {
                this.showToast("Đặt hàng thành công! Cảm ơn quý khách.");
                
                // Clear cart state directly
                this.cart = [];
                localStorage.setItem('mvmt_cart', JSON.stringify([]));
                if (this.navbar) {
                    this.navbar.setCartCount(0);
                }

                this.appliedCoupon = null;
                this.discountPercent = 0;
                this.step = 1;
                // Reset form state
                this.formData = {
                    fullName: '',
                    phone: '',
                    provinceCode: '',
                    provinceName: '',
                    districtCode: '',
                    districtName: '',
                    wardCode: '',
                    wardName: '',
                    detailAddress: '',
                    paymentMethod: 'COD'
                };
                
                // Redirect to Thank You page
                window.location.hash = "#/thankyou";
            } else {
                this.showToast(data.error || "Đặt hàng thất bại.", "error");
            }
        } catch (e) {
            console.error(e);
            this.showToast("Không kết nối được tới máy chủ API.", "error");
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = "ĐẶT HÀNG NGAY";
            }
        }
    }

    updatePriceDisplay() {
        const subtotal = this.getCartSubtotal();
        const discount = this.appliedCoupon ? parseFloat(this.appliedCoupon.discount_amount) : 0.00;
        const total = Math.max(0.00, subtotal - discount);
        
        const subtotalVal = document.getElementById('cartSubtotalVal');
        const discountRow = document.getElementById('discountRow');
        const discountVal = document.getElementById('discountVal');
        const totalVal = document.getElementById('cartTotalVal');
        
        if (subtotalVal) subtotalVal.textContent = window.formatPrice(subtotal);
        
        if (discount > 0) {
            if (discountRow) {
                discountRow.classList.remove('hidden');
                const labelText = discountRow.querySelector('span:first-child');
                if (labelText) {
                    labelText.textContent = `Giảm giá (${this.appliedCoupon.code})`;
                }
            }
            if (discountVal) discountVal.textContent = `-${window.formatPrice(discount)}`;
        } else {
            if (discountRow) discountRow.classList.add('hidden');
        }
        
        if (totalVal) totalVal.textContent = window.formatPrice(total);
    }

    // --- Render Orchestrator ---
    async render() {
        // Initial setup
        await this.checkAuthStatus();

        this.app.innerHTML = '';

        // 1. Instantiate Navbar
        this.navbar = new MainNavbar({
            onCartClick: () => {}, // Click goes directly via href link
            onLoginClick: () => { window.location.hash = "#/login"; },
            onLogoutClick: () => this.handleLogout()
        });
        if (this.user) {
            this.navbar.setUser(this.user);
        }
        this.navbar.setCartCount(this.getCartCount());

        this.app.appendChild(this.navbar.render());

        // 2. Main content container
        const mainContainer = document.createElement('main');
        mainContainer.id = "cartMainContent";
        mainContainer.className = "min-h-[60vh] pt-20 bg-white dark:bg-bgDark transition-colors duration-500";
        this.app.appendChild(mainContainer);

        // 3. Render Footer
        this.app.appendChild(Footer.render());

        // 4. Bind Custom Global Event for Newsletter
        document.addEventListener('newsletter-signup', (e) => {
            this.showToast(`Đã đăng ký nhận tin với email: ${e.detail.email}`);
        });

        // 5. Initial Draw of the Cart details
        this.renderCartLayout();

        window.scrollTo(0, 0);
    }

    renderCartLayout() {
        const container = document.getElementById('cartMainContent');
        if (!container) return;

        if (this.cart.length === 0) {
            // Empty state view matching reference screenshot
            container.innerHTML = `
                <div class="max-w-7xl mx-auto px-6 py-24 text-center">
                    <!-- minimalist bag icon -->
                    <div class="flex justify-center mb-8">
                        <div class="w-20 h-20 border-2 border-gray-300 dark:border-neutral-800 rounded-lg relative flex items-center justify-center">
                            <div class="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-6 border-2 border-gray-300 dark:border-neutral-800 rounded-t-full border-b-0"></div>
                            <span class="text-xs text-gray-300 dark:text-neutral-700 font-bold uppercase tracking-wider">Giỏ hàng</span>
                        </div>
                    </div>
                    
                    <h1 class="font-serif text-3xl md:text-4xl font-normal text-primary dark:text-white mb-3 tracking-wide">Giỏ hàng của bạn đang trống</h1>
                    <p class="text-xs md:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-10 leading-relaxed font-sans">
                        Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy bắt đầu mua sắm để khám phá những bộ sưu tập đồng hồ cao cấp của chúng tôi.
                    </p>
                    
                    <div class="flex justify-center gap-4">
                        <a href="#/products?category=mens" class="bg-primary dark:bg-white text-white dark:text-primary text-[10px] font-bold tracking-widest uppercase py-4 px-8 hover:bg-accent dark:hover:bg-accent hover:text-white dark:hover:text-white transition-all duration-300 outline-none">ĐỒNG HỒ NAM</a>
                        <a href="#/products?category=womens" class="border border-gray-200 dark:border-neutral-800 text-primary dark:text-white text-[10px] font-bold tracking-widest uppercase py-4 px-8 hover:bg-primary dark:hover:bg-white hover:text-white dark:hover:text-primary transition-all duration-300 outline-none font-sans">ĐỒNG HỒ NỮ</a>
                    </div>
                </div>
            `;
            return;
        }

        if (this.step === 1) {
            // Step 1: Cart Items Management
            container.innerHTML = `
                <div class="max-w-[1400px] w-full mx-auto px-6 md:px-12 py-12 md:py-20">
                    <h1 class="font-serif text-3xl font-normal tracking-wide text-primary dark:text-white mb-12">Giỏ hàng</h1>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 items-start">
                        
                        <!-- Left Column: Items List -->
                        <div class="lg:col-span-2 flex flex-col gap-8" id="cartItemsContainer"></div>

                        <!-- Right Column: Summary Panel -->
                        <div class="bg-bgLight dark:bg-bgDarkSoft border border-accent/50 dark:border-accent/40 p-8 sticky top-28 transition-colors duration-500">
                            <h3 class="text-xs font-bold tracking-widest uppercase text-primary dark:text-white mb-6">TÓM TẮT ĐƠN HÀNG</h3>
                            
                            <div class="flex flex-col gap-4 text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase mb-6">
                                <div class="flex justify-between items-center">
                                    <span>Tạm tính</span>
                                    <span class="text-primary dark:text-white font-bold" id="cartSubtotalVal">0đ</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span>Phí vận chuyển</span>
                                    <span class="text-green-500 font-bold">Miễn phí</span>
                                </div>
                                <div class="flex justify-between items-center hidden" id="discountRow">
                                    <span>Giảm giá</span>
                                    <span class="text-sale font-bold" id="discountVal">-0đ</span>
                                </div>
                                <div class="border-t border-accent/40 dark:border-accent/30 my-2"></div>
                                <div class="flex justify-between items-center text-sm font-bold text-primary dark:text-white">
                                    <span>Tổng tiền</span>
                                    <span class="text-accent text-lg" id="cartTotalVal">0đ</span>
                                </div>
                            </div>

                            <!-- Promo Code input -->
                            <div class="mb-6 flex gap-2">
                                <input type="text" id="promoCode" placeholder="Mã giảm giá" value="${this.appliedCoupon ? this.appliedCoupon.code : ''}" class="flex-grow bg-white dark:bg-bgDark border border-gray-200 dark:border-neutral-800 px-4 py-2.5 text-xs tracking-wide text-primary dark:text-white focus:outline-none focus:border-accent transition-colors font-sans uppercase">
                                <button type="button" id="btnApplyPromo" class="bg-primary dark:bg-white text-white dark:text-primary text-[10px] font-bold tracking-widest uppercase px-4 hover:bg-accent dark:hover:bg-accent hover:text-white dark:hover:text-white transition-colors shrink-0 outline-none">ÁP DỤNG</button>
                            </div>

                            <button id="btnProceedToCheckout" class="w-full bg-primary dark:bg-white text-white dark:text-primary text-xs font-bold tracking-widest uppercase py-4 hover:bg-accent dark:hover:bg-accent hover:text-white dark:hover:text-primary transition-all duration-300 outline-none">TIẾP TỤC ĐẶT HÀNG</button>
                            
                            <!-- Trust indicators -->
                            <div class="mt-6 flex flex-col gap-3 text-[9px] text-gray-400 dark:text-gray-500 font-bold tracking-wider uppercase text-center border-t border-accent/40 dark:border-accent/30 pt-6">
                                <div class="flex justify-center items-center gap-4">
                                    <svg class="h-4 fill-current text-gray-400 dark:text-gray-500 opacity-60 hover:opacity-100 transition-opacity" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                                        <path d="M17 4H3C1.89 4 1 4.89 1 6V18C1 19.1 1.89 20 3 20H21C22.1 20 23 19.1 23 18V6C23 4.89 22.1 4 21 4H17ZM21 18H3V6H21V18ZM13 14H15V16H13V14ZM13 10H15V12H13V10ZM13 8H15V9.5H13V8ZM9 14H11V16H9V14ZM9 10H11V12H9V10ZM9 8H11V9.5H9V8ZM5 14H7V16H5V14ZM5 10H7V12H5V10ZM5 8H7V9.5H5V8Z"/>
                                    </svg>
                                    <svg class="h-4 fill-current text-gray-400 dark:text-gray-500 opacity-60 hover:opacity-100 transition-opacity" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                                        <circle cx="9" cy="12" r="5"/>
                                        <circle cx="15" cy="12" r="5" fill-opacity="0.6"/>
                                    </svg>
                                    <svg class="h-4 fill-current text-gray-400 dark:text-gray-500 opacity-60 hover:opacity-100 transition-opacity" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                                        <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                                    </svg>
                                </div>
                                <div class="flex justify-center items-center gap-2">
                                    <i class="fa-solid fa-lock text-gray-400 dark:text-gray-500"></i>
                                    <span>GIAO DỊCH BẢO MẬT SSL 256-BIT</span>
                                </div>
                                <div>
                                    <span>MIỄN PHÍ VẬN CHUYỂN & BẢO HÀNH 2 NĂM</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Render products list on the left side
            const itemsContainer = document.getElementById('cartItemsContainer');
            this.updatePriceDisplay();

            this.cart.forEach(item => {
                const itemRow = document.createElement('div');
                itemRow.className = "flex gap-4 sm:gap-6 border-b border-accent/50 dark:border-accent/40 pb-8 items-center justify-between";
                itemRow.innerHTML = `
                    <div class="flex gap-3 sm:gap-6 items-center flex-grow">
                        <img src="${item.product.image_url}" alt="${item.product.title}" class="w-20 h-24 sm:w-24 sm:h-30 object-cover bg-bgLight dark:bg-bgDark border border-gray-100 dark:border-neutral-900/40 flex-shrink-0 cursor-pointer prod-img">
                        <div class="flex flex-col">
                            <span class="text-[9px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold mb-1">${item.product.category}</span>
                            <h4 class="text-sm font-semibold text-primary dark:text-white hover:text-accent dark:hover:text-accent transition-colors cursor-pointer prod-title mb-1">${item.product.title}</h4>
                            <span class="text-xs text-gray-500 dark:text-gray-400 mb-4 uppercase font-bold tracking-wide">Size: ${item.product.size}</span>
                            
                            <!-- Quantity Selector -->
                            <div class="flex items-center border border-accent/30 bg-white dark:bg-bgDarkSoft w-24 text-primary dark:text-white transition-colors">
                                <button class="w-8 h-8 flex justify-center items-center text-xs text-primary dark:text-white hover:text-accent dark:hover:text-accent btn-minus outline-none"><i class="fa-solid fa-minus text-[10px]"></i></button>
                                <span class="flex-grow text-center text-xs font-bold select-none text-primary dark:text-white">${item.quantity}</span>
                                <button class="w-8 h-8 flex justify-center items-center text-xs text-primary dark:text-white hover:text-accent dark:hover:text-accent btn-plus outline-none"><i class="fa-solid fa-plus text-[10px]"></i></button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex flex-col items-end justify-between h-24">
                        <button class="text-gray-300 dark:text-gray-600 hover:text-sale dark:hover:text-sale text-sm transition-colors btn-remove outline-none" title="Xóa sản phẩm"><i class="fa-regular fa-trash-can"></i></button>
                        <span class="text-sm font-bold text-primary dark:text-white">${window.formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                `;

                // Action mappings
                const viewProdDetails = () => {
                    window.location.hash = `#/product/${item.product.id}`;
                };

                itemRow.querySelector('.prod-img').onclick = viewProdDetails;
                itemRow.querySelector('.prod-title').onclick = viewProdDetails;

                itemRow.querySelector('.btn-minus').onclick = () => this.updateCartQuantity(item.product.id, item.quantity - 1);
                itemRow.querySelector('.btn-plus').onclick = () => this.updateCartQuantity(item.product.id, item.quantity + 1);
                itemRow.querySelector('.btn-remove').onclick = () => this.removeFromCart(item.product.id);

                itemsContainer.appendChild(itemRow);
            });

            // Bind Proceed Button
            const btnProceedToCheckout = document.getElementById('btnProceedToCheckout');
            if (btnProceedToCheckout) {
                btnProceedToCheckout.onclick = () => {
                    this.step = 2;
                    this.renderCartLayout();
                };
            }

            // Bind Apply Promo button
            const btnApplyPromo = document.getElementById('btnApplyPromo');
            const promoInput = document.getElementById('promoCode');
            if (btnApplyPromo) {
                btnApplyPromo.onclick = () => {
                    const code = promoInput.value.trim().toUpperCase();
                    this.applyPromoCode(code);
                };
            }

        } else if (this.step === 2) {
            // Step 2: Shipping Info & Payment Methods
            container.innerHTML = `
                <div class="max-w-[1400px] w-full mx-auto px-6 md:px-12 py-12 md:py-20">
                    <h1 class="font-serif text-3xl font-normal tracking-wide text-primary dark:text-white mb-12">Thanh toán & Giao hàng</h1>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 items-start">
                        
                        <!-- Left Column: Checkout Fields -->
                        <div class="lg:col-span-2 flex flex-col gap-8 bg-bgLight dark:bg-bgDarkSoft border border-accent/50 dark:border-accent/40 p-8 transition-colors duration-500">
                            <h3 class="text-xs font-bold tracking-widest uppercase text-primary dark:text-white mb-2">ĐỊA CHỈ GIAO HÀNG</h3>
                            <form id="checkoutForm" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="md:col-span-2">
                                    <label class="block text-[10px] font-bold tracking-wider text-gray-600 dark:text-gray-400 uppercase mb-1.5">Họ và tên</label>
                                    <input type="text" id="checkoutFullName" required placeholder="Nhập họ và tên" value="${this.formData.fullName}" class="w-full bg-white dark:bg-bgDark border border-gray-200 dark:border-neutral-800 px-4 py-2.5 text-xs tracking-wide text-primary dark:text-white focus:outline-none focus:border-accent transition-colors font-sans">
                                </div>
                                <div class="md:col-span-2">
                                    <label class="block text-[10px] font-bold tracking-wider text-gray-600 dark:text-gray-400 uppercase mb-1.5">Số điện thoại</label>
                                    <input type="tel" id="checkoutPhone" required placeholder="Nhập số điện thoại" value="${this.formData.phone}" class="w-full bg-white dark:bg-bgDark border border-gray-200 dark:border-neutral-800 px-4 py-2.5 text-xs tracking-wide text-primary dark:text-white focus:outline-none focus:border-accent transition-colors font-sans">
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold tracking-wider text-gray-600 dark:text-gray-400 uppercase mb-1.5">Tỉnh / Thành phố</label>
                                    <div class="relative">
                                        <select id="checkoutProvince" required class="w-full appearance-none bg-white dark:bg-bgDark border border-gray-200 dark:border-neutral-800 px-4 py-2.5 pr-10 text-xs tracking-wide text-primary dark:text-white focus:outline-none focus:border-accent transition-colors font-sans">
                                            <option value="" disabled selected>Đang tải danh sách...</option>
                                        </select>
                                        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 dark:text-gray-500">
                                            <i id="provinceIcon" class="fa-solid fa-chevron-down text-[9px]"></i>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold tracking-wider text-gray-600 dark:text-gray-400 uppercase mb-1.5">Quận / Huyện</label>
                                    <div class="relative">
                                        <select id="checkoutDistrict" required disabled class="w-full appearance-none bg-white dark:bg-bgDark border border-gray-200 dark:border-neutral-800 px-4 py-2.5 pr-10 text-xs tracking-wide text-primary dark:text-white focus:outline-none focus:border-accent transition-colors font-sans disabled:opacity-50">
                                            <option value="" disabled selected>Vui lòng chọn Tỉnh/Thành</option>
                                        </select>
                                        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 dark:text-gray-500">
                                            <i id="districtIcon" class="fa-solid fa-chevron-down text-[9px]"></i>
                                        </div>
                                    </div>
                                </div>
                                <div class="md:col-span-2">
                                    <label class="block text-[10px] font-bold tracking-wider text-gray-600 dark:text-gray-400 uppercase mb-1.5">Phường / Xã</label>
                                    <div class="relative">
                                        <select id="checkoutWard" required disabled class="w-full appearance-none bg-white dark:bg-bgDark border border-gray-200 dark:border-neutral-800 px-4 py-2.5 pr-10 text-xs tracking-wide text-primary dark:text-white focus:outline-none focus:border-accent transition-colors font-sans disabled:opacity-50">
                                            <option value="" disabled selected>Vui lòng chọn Tỉnh/Thành</option>
                                        </select>
                                        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 dark:text-gray-500">
                                            <i id="wardIcon" class="fa-solid fa-chevron-down text-[9px]"></i>
                                        </div>
                                    </div>
                                </div>
                                <div class="md:col-span-2">
                                    <label class="block text-[10px] font-bold tracking-wider text-gray-600 dark:text-gray-400 uppercase mb-1.5">Địa chỉ chi tiết (Số nhà, tên đường...)</label>
                                    <input type="text" id="checkoutDetailAddress" required placeholder="Ví dụ: 123 Đường Láng" value="${this.formData.detailAddress}" class="w-full bg-white dark:bg-bgDark border border-gray-200 dark:border-neutral-800 px-4 py-2.5 text-xs tracking-wide text-primary dark:text-white focus:outline-none focus:border-accent transition-colors font-sans">
                                </div>
                            </form>

                            <div class="border-t border-accent/40 dark:border-accent/30 my-6"></div>

                            <h3 class="text-xs font-bold tracking-widest uppercase text-primary dark:text-white mb-6">PHƯƠNG THỨC THANH TOÁN</h3>
                            <div class="flex flex-col gap-3">
                                <label class="flex items-center gap-3 cursor-pointer p-3 bg-white dark:bg-bgDark border border-gray-200 dark:border-neutral-800 hover:border-accent dark:hover:border-accent transition-colors">
                                    <input type="radio" name="paymentMethod" value="COD" ${this.formData.paymentMethod === 'COD' ? 'checked' : ''} class="accent-accent">
                                    <span class="text-xs font-bold text-primary dark:text-white">COD (Thanh toán khi nhận hàng)</span>
                                </label>
                                <label class="flex items-center gap-3 cursor-pointer p-3 bg-white dark:bg-bgDark border border-gray-200 dark:border-neutral-800 hover:border-accent dark:hover:border-accent transition-colors">
                                    <input type="radio" name="paymentMethod" value="BankTransfer" ${this.formData.paymentMethod === 'BankTransfer' ? 'checked' : ''} class="accent-accent">
                                    <span class="text-xs font-bold text-primary dark:text-white">Chuyển khoản Ngân hàng / QR</span>
                                </label>
                                <label class="flex items-center gap-3 cursor-pointer p-3 bg-white dark:bg-bgDark border border-gray-200 dark:border-neutral-800 hover:border-accent dark:hover:border-accent transition-colors">
                                    <input type="radio" name="paymentMethod" value="EWallet" ${this.formData.paymentMethod === 'EWallet' ? 'checked' : ''} class="accent-accent">
                                    <span class="text-xs font-bold text-primary dark:text-white">Ví điện tử (Momo / VNPAY)</span>
                                </label>
                            </div>
                        </div>

                        <!-- Right Column: Checkout Summary -->
                        <div class="bg-bgLight dark:bg-bgDarkSoft border border-accent/50 dark:border-accent/40 p-8 sticky top-28 transition-colors duration-500">
                            <h3 class="text-xs font-bold tracking-widest uppercase text-primary dark:text-white mb-6">TÓM TẮT ĐƠN HÀNG</h3>
                            
                            <!-- Compact Product List in Step 2 -->
                            <div class="flex flex-col gap-4 max-h-[250px] overflow-y-auto mb-6 pr-2 scrollbar-thin scrollbar-thumb-accent/20 border-b border-accent/20 dark:border-accent/10 pb-6" id="checkoutItemsSummary"></div>

                            <div class="flex flex-col gap-4 text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase mb-6">
                                <div class="flex justify-between items-center">
                                    <span>Tạm tính</span>
                                    <span class="text-primary dark:text-white font-bold" id="cartSubtotalVal">0đ</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span>Phí vận chuyển</span>
                                    <span class="text-green-500 font-bold">Miễn phí</span>
                                </div>
                                <div class="flex justify-between items-center hidden" id="discountRow">
                                    <span>Giảm giá</span>
                                    <span class="text-sale font-bold" id="discountVal">-0đ</span>
                                </div>
                                <div class="border-t border-accent/40 dark:border-accent/30 my-2"></div>
                                <div class="flex justify-between items-center text-sm font-bold text-primary dark:text-white">
                                    <span>Tổng tiền</span>
                                    <span class="text-accent text-lg" id="cartTotalVal">0đ</span>
                                </div>
                            </div>

                            <div class="flex flex-col gap-3">
                                <button id="btnCheckout" class="w-full bg-primary dark:bg-white text-white dark:text-primary text-xs font-bold tracking-widest uppercase py-4 hover:bg-accent dark:hover:bg-accent hover:text-white dark:hover:text-primary transition-all duration-300 outline-none">ĐẶT HÀNG NGAY</button>
                                <button id="btnBackToCart" class="w-full border border-gray-200 dark:border-neutral-800 text-primary dark:text-white text-xs font-bold tracking-widest uppercase py-4 hover:bg-primary dark:hover:bg-white hover:text-white dark:hover:text-primary transition-all duration-300 outline-none font-sans">QUAY LẠI GIỎ HÀNG</button>
                            </div>
                            
                            <!-- Trust indicators -->
                            <div class="mt-6 flex flex-col gap-3 text-[9px] text-gray-400 dark:text-gray-500 font-bold tracking-wider uppercase text-center border-t border-accent/40 dark:border-accent/30 pt-6">
                                <div class="flex justify-center items-center gap-4">
                                    <svg class="h-4 fill-current text-gray-400 dark:text-gray-500 opacity-60 hover:opacity-100 transition-opacity" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                                        <path d="M17 4H3C1.89 4 1 4.89 1 6V18C1 19.1 1.89 20 3 20H21C22.1 20 23 19.1 23 18V6C23 4.89 22.1 4 21 4H17ZM21 18H3V6H21V18ZM13 14H15V16H13V14ZM13 10H15V12H13V10ZM13 8H15V9.5H13V8ZM9 14H11V16H9V14ZM9 10H11V12H9V10ZM9 8H11V9.5H9V8ZM5 14H7V16H5V14ZM5 10H7V12H5V10ZM5 8H7V9.5H5V8Z"/>
                                    </svg>
                                    <svg class="h-4 fill-current text-gray-400 dark:text-gray-500 opacity-60 hover:opacity-100 transition-opacity" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                                        <circle cx="9" cy="12" r="5"/>
                                        <circle cx="15" cy="12" r="5" fill-opacity="0.6"/>
                                    </svg>
                                    <svg class="h-4 fill-current text-gray-400 dark:text-gray-500 opacity-60 hover:opacity-100 transition-opacity" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                                        <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                                    </svg>
                                </div>
                                <div class="flex justify-center items-center gap-2">
                                    <i class="fa-solid fa-lock text-gray-400 dark:text-gray-500"></i>
                                    <span>GIAO DỊCH BẢO MẬT SSL 256-BIT</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Draw compact summary on right panel
            const checkoutItemsSummary = document.getElementById('checkoutItemsSummary');
            if (checkoutItemsSummary) {
                checkoutItemsSummary.innerHTML = '';
                this.cart.forEach(item => {
                    const row = document.createElement('div');
                    row.className = "flex gap-4 items-center justify-between text-xs py-2 border-b border-accent/10 dark:border-neutral-800 last:border-0";
                    row.innerHTML = `
                        <div class="flex gap-3 items-center">
                            <img src="${item.product.image_url}" alt="${item.product.title}" class="w-12 h-15 object-cover bg-bgLight dark:bg-bgDark border border-gray-100 dark:border-neutral-900/40 flex-shrink-0">
                            <div class="flex flex-col">
                                <span class="font-semibold text-primary dark:text-white line-clamp-1">${item.product.title}</span>
                                <span class="text-gray-400 dark:text-gray-500 text-[10px] uppercase font-bold tracking-wider">SL: ${item.quantity} | Size: ${item.product.size}</span>
                            </div>
                        </div>
                        <span class="font-bold text-primary dark:text-white">${window.formatPrice(item.product.price * item.quantity)}</span>
                    `;
                    checkoutItemsSummary.appendChild(row);
                });
            }

            this.updatePriceDisplay();

            // Dynamic API geographic binding
            const provinceSelect = document.getElementById('checkoutProvince');
            const districtSelect = document.getElementById('checkoutDistrict');
            const wardSelect = document.getElementById('checkoutWard');

            const loadDistrictsForCode = (provinceCode) => {
                const districtIcon = document.getElementById('districtIcon');
                if (districtIcon) {
                    districtIcon.className = 'fa-solid fa-spinner fa-spin text-[9px]';
                }
                // Keep it disabled while loading to prevent premature clicks
                districtSelect.disabled = true;
                
                this.fetchDistricts(provinceCode).then(districts => {
                    if (districtIcon) {
                        districtIcon.className = 'fa-solid fa-chevron-down text-[9px]';
                    }
                    districtSelect.innerHTML = '<option value="" disabled selected>Chọn Quận/Huyện</option>';
                    districts.forEach(d => {
                        const opt = document.createElement('option');
                        opt.value = d.code;
                        opt.textContent = d.name;
                        if (this.formData.districtCode == d.code) {
                            opt.selected = true;
                        }
                        districtSelect.appendChild(opt);
                    });

                    // Enable after loading and populating options
                    districtSelect.disabled = false;

                    if (districtSelect.value) {
                        loadWardsForCode(districtSelect.value);
                    } else {
                        wardSelect.disabled = true;
                        wardSelect.innerHTML = '<option value="" disabled selected>Vui lòng chọn Quận/Huyện</option>';
                    }
                }).catch(e => {
                    if (districtIcon) {
                        districtIcon.className = 'fa-solid fa-chevron-down text-[9px]';
                    }
                    districtSelect.disabled = false; // Enable to allow user to retry
                    districtSelect.innerHTML = '<option value="" disabled selected>Lỗi tải Quận/Huyện</option>';
                    console.error(e);
                });
            };

            const loadWardsForCode = (districtCode) => {
                const wardIcon = document.getElementById('wardIcon');
                if (wardIcon) {
                    wardIcon.className = 'fa-solid fa-spinner fa-spin text-[9px]';
                }
                // Keep it disabled while loading to prevent premature clicks
                wardSelect.disabled = true;
                
                this.fetchWards(districtCode).then(wards => {
                    if (wardIcon) {
                        wardIcon.className = 'fa-solid fa-chevron-down text-[9px]';
                    }
                    wardSelect.innerHTML = '<option value="" disabled selected>Chọn Phường/Xã</option>';
                    wards.forEach(w => {
                        const opt = document.createElement('option');
                        opt.value = w.code;
                        opt.textContent = w.name;
                        if (this.formData.wardCode == w.code) {
                            opt.selected = true;
                        }
                        wardSelect.appendChild(opt);
                    });

                    // Enable after loading and populating options
                    wardSelect.disabled = false;
                }).catch(e => {
                    if (wardIcon) {
                        wardIcon.className = 'fa-solid fa-chevron-down text-[9px]';
                    }
                    wardSelect.disabled = false; // Enable to allow user to retry
                    wardSelect.innerHTML = '<option value="" disabled selected>Lỗi tải Phường/Xã</option>';
                    console.error(e);
                });
            };

            if (provinceSelect) {
                const provinceIcon = document.getElementById('provinceIcon');
                if (provinceIcon) {
                    provinceIcon.className = 'fa-solid fa-spinner fa-spin text-[9px]';
                }
                this.fetchProvinces().then(provinces => {
                    if (provinceIcon) {
                        provinceIcon.className = 'fa-solid fa-chevron-down text-[9px]';
                    }
                    provinceSelect.innerHTML = '<option value="" disabled selected>Chọn Tỉnh/Thành phố</option>';
                    provinces.forEach(p => {
                        const opt = document.createElement('option');
                        opt.value = p.code;
                        opt.textContent = p.name;
                        if (this.formData.provinceCode == p.code) {
                            opt.selected = true;
                        }
                        provinceSelect.appendChild(opt);
                    });

                    if (provinceSelect.value) {
                        loadDistrictsForCode(provinceSelect.value);
                    }
                }).catch(e => {
                    if (provinceIcon) {
                        provinceIcon.className = 'fa-solid fa-chevron-down text-[9px]';
                    }
                    console.error(e);
                });

                provinceSelect.onchange = () => {
                    const code = provinceSelect.value;
                    this.formData.provinceCode = code;
                    this.formData.provinceName = provinceSelect.selectedIndex >= 0 ? provinceSelect.options[provinceSelect.selectedIndex].text : '';

                    // Reset sub-state values
                    this.formData.districtCode = '';
                    this.formData.districtName = '';
                    this.formData.wardCode = '';
                    this.formData.wardName = '';

                    // Clear options and disable dropdowns initially
                    districtSelect.innerHTML = '<option value="" disabled selected>Vui lòng chọn Tỉnh/Thành</option>';
                    wardSelect.innerHTML = '<option value="" disabled selected>Vui lòng chọn Tỉnh/Thành</option>';
                    
                    districtSelect.disabled = true;
                    wardSelect.disabled = true;

                    if (code) {
                        // Keep disabled and show temporary loading placeholder "Đang tải..."
                        districtSelect.disabled = true;
                        districtSelect.innerHTML = '<option value="" disabled selected>Đang tải...</option>';
                        loadDistrictsForCode(code);
                    }
                };
            }

            if (districtSelect) {
                districtSelect.onchange = () => {
                    const code = districtSelect.value;
                    this.formData.districtCode = code;
                    this.formData.districtName = districtSelect.selectedIndex >= 0 ? districtSelect.options[districtSelect.selectedIndex].text : '';

                    // Reset sub-state values
                    this.formData.wardCode = '';
                    this.formData.wardName = '';

                    wardSelect.innerHTML = '<option value="" disabled selected>Vui lòng chọn Quận/Huyện</option>';
                    wardSelect.disabled = true;

                    if (code) {
                        // Keep disabled and show temporary loading placeholder "Đang tải..."
                        wardSelect.disabled = true;
                        wardSelect.innerHTML = '<option value="" disabled selected>Đang tải...</option>';
                        loadWardsForCode(code);
                    }
                };
            }

            if (wardSelect) {
                wardSelect.onchange = () => {
                    this.formData.wardCode = wardSelect.value;
                    this.formData.wardName = wardSelect.selectedIndex >= 0 ? wardSelect.options[wardSelect.selectedIndex].text : '';
                };
            }

            // Sync text inputs
            const fullNameEl = document.getElementById('checkoutFullName');
            const phoneEl = document.getElementById('checkoutPhone');
            const detailAddressEl = document.getElementById('checkoutDetailAddress');

            if (fullNameEl) {
                fullNameEl.oninput = () => {
                    this.formData.fullName = fullNameEl.value;
                };
            }
            if (phoneEl) {
                phoneEl.oninput = () => {
                    this.formData.phone = phoneEl.value;
                };
            }
            if (detailAddressEl) {
                detailAddressEl.oninput = () => {
                    this.formData.detailAddress = detailAddressEl.value;
                };
            }

            // Payment radios
            const paymentRadioGroup = document.querySelectorAll('input[name="paymentMethod"]');
            paymentRadioGroup.forEach(radio => {
                radio.onchange = () => {
                    this.formData.paymentMethod = radio.value;
                };
            });

            // Back button
            const btnBackToCart = document.getElementById('btnBackToCart');
            if (btnBackToCart) {
                btnBackToCart.onclick = () => {
                    this.step = 1;
                    this.renderCartLayout();
                };
            }

            // Bind checkout submission
            const btnCheckout = document.getElementById('btnCheckout');
            if (btnCheckout) {
                btnCheckout.onclick = () => this.handleCheckout();
            }
        }
    }

    async applyPromoCode(code) {
        if (!code) {
            this.appliedCoupon = null;
            this.updatePriceDisplay();
            return;
        }

        try {
            const itemsPayload = this.cart.map(item => ({
                product_id: item.product.id,
                quantity: item.quantity
            }));

            const res = await fetch(`${API_BASE_URL}/coupons/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: code,
                    items: itemsPayload
                }),
                credentials: 'include'
            });

            const data = await res.json();
            if (data.success || data.discount_amount !== undefined) {
                this.appliedCoupon = data;
                this.updatePriceDisplay();
                this.showToast(`Áp dụng mã giảm giá thành công! Giảm ${window.formatPrice(data.discount_amount)}.`);
            } else {
                this.appliedCoupon = null;
                this.updatePriceDisplay();
                this.showToast(data.error || "Mã giảm giá không hợp lệ.", "error");
            }
        } catch (e) {
            console.error(e);
            this.appliedCoupon = null;
            this.updatePriceDisplay();
            this.showToast("Không thể kết nối đến máy chủ để xác thực mã.", "error");
        }
    }

    async revalidateCoupon() {
        if (!this.appliedCoupon) return;
        try {
            const itemsPayload = this.cart.map(item => ({
                product_id: item.product.id,
                quantity: item.quantity
            }));

            const res = await fetch(`${API_BASE_URL}/coupons/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: this.appliedCoupon.code,
                    items: itemsPayload
                }),
                credentials: 'include'
            });

            const data = await res.json();
            if (data.success || data.discount_amount !== undefined) {
                this.appliedCoupon = data;
            } else {
                this.appliedCoupon = null;
                this.showToast("Mã giảm giá không còn hiệu lực với giỏ hàng mới.", "warning");
            }
        } catch (e) {
            console.error(e);
            this.appliedCoupon = null;
        }
        this.updatePriceDisplay();
    }
}
