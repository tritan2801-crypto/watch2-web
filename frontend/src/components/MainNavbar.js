/**
 * Component: MainNavbar
 */
export default class MainNavbar {
    constructor({ onCartClick, onLoginClick, onLogoutClick }) {
        this.onCartClick = onCartClick;
        this.onLoginClick = onLoginClick;
        this.onLogoutClick = onLogoutClick;
        this.element = null;
        this.user = null;
        this.cartCount = this.getInitialCartCount();
    }

    getInitialCartCount() {
        try {
            const data = localStorage.getItem('mvmt_cart');
            const cart = data ? JSON.parse(data) : [];
            return cart.reduce((total, item) => total + item.quantity, 0);
        } catch (e) {
            return 0;
        }
    }

    setUser(user) {
        this.user = user;
        this.updateUserSection();
    }

    setCartCount(count) {
        this.cartCount = count;
        if (!this.element) return;
        const badge = this.element.querySelector('#cartBadge');
        if (badge) {
            badge.textContent = count;
            if (count > 0) {
                badge.classList.remove('scale-0', 'opacity-0');
                badge.classList.add('scale-100', 'opacity-100');
            } else {
                badge.classList.remove('scale-100', 'opacity-100');
                badge.classList.add('scale-0', 'opacity-0');
            }
            // Trigger pop animation
            badge.style.transform = 'scale(1.3)';
            setTimeout(() => {
                badge.style.transform = '';
            }, 200);
        }
    }

    updateUserSection() {
        if (!this.element) return;
        const userBtn = this.element.querySelector('#userBtn');
        const userDropdown = this.element.querySelector('#userDropdown');
        if (!userBtn || !userDropdown) return;

        if (this.user) {
            const firstName = this.user.name.split(' ')[0];
            userBtn.innerHTML = `
                <span class="text-xs font-bold mr-2 max-w-[80px] truncate hidden sm:inline">${firstName}</span>
                <i class="fa-solid fa-circle-user text-accent text-lg"></i>
            `;
            const isAdmin = this.user.email === 'admin@mvmt.com';
            userDropdown.innerHTML = `
                <div class="px-4 py-2 border-b border-gray-50 text-[10px] text-gray-400 font-bold tracking-wider uppercase font-sans">Xin chào, ${firstName}!</div>
                ${isAdmin 
                    ? `<a href="#/admin" class="block px-4 py-2.5 text-[11px] font-bold tracking-wider hover:bg-bgLight hover:text-accent transition-colors font-sans uppercase text-amber-500">TRANG QUẢN TRỊ</a>`
                    : `<a href="#/profile" class="block px-4 py-2.5 text-[11px] font-bold tracking-wider hover:bg-bgLight hover:text-accent transition-colors font-sans uppercase">TÀI KHOẢN</a>`
                }
                <button id="navLogoutBtn" class="w-full text-left px-4 py-2.5 text-[11px] font-bold tracking-wider text-sale hover:bg-red-50 hover:text-red-600 transition-colors outline-none border-t border-gray-50 font-sans uppercase">ĐĂNG XUẤT</button>
            `;
            
            userBtn.onclick = (e) => {
                e.preventDefault();
                window.location.hash = isAdmin ? "#/admin" : "#/profile";
            };

            const navLogoutBtn = userDropdown.querySelector('#navLogoutBtn');
            if (navLogoutBtn) {
                navLogoutBtn.onclick = (e) => {
                    e.preventDefault();
                    if (this.onLogoutClick) this.onLogoutClick();
                };
            }
        } else {
            userBtn.innerHTML = `<i class="fa-regular fa-user text-lg"></i>`;
            userBtn.onclick = (e) => {
                e.preventDefault();
                if (this.onLoginClick) this.onLoginClick();
            };
            userDropdown.innerHTML = `
                <button id="navLoginBtn" class="w-full text-left px-4 py-2.5 text-[11px] font-bold tracking-wider hover:bg-bgLight hover:text-accent transition-colors outline-none font-sans uppercase">ĐĂNG NHẬP</button>
            `;
            
            const navLoginBtn = userDropdown.querySelector('#navLoginBtn');
            if (navLoginBtn) {
                navLoginBtn.onclick = (e) => {
                    e.preventDefault();
                    if (this.onLoginClick) this.onLoginClick();
                };
            }
        }
    }

    render() {
        const header = document.createElement('header');
        header.id = "mainHeader";

        const hash = window.location.hash || '#/';
        const isDetailPage = hash.match(/^#\/product\/(\d+)$/) || hash.match(/^#product\/(\d+)$/);
        const isCartPage = hash.startsWith('#/cart') || hash.startsWith('#cart');
        const isProfilePage = hash.startsWith('#/profile') || hash.startsWith('#profile');
        const isThankYouPage = hash.startsWith('#/thankyou') || hash.startsWith('#thankyou');
        const isLightPage = isDetailPage || isCartPage || isProfilePage || isThankYouPage;

        header.className = isLightPage 
            ? "h-20 w-full bg-white/70 dark:bg-black/70 backdrop-blur-md shadow-sm border-b border-accent/50 dark:border-accent/40 flex items-center fixed top-0 left-0 z-50 transition-all duration-500 transform"
            : "h-20 w-full bg-transparent flex items-center absolute top-10 left-0 z-50 transition-all duration-500 transform";

        header.innerHTML = `
            <div class="max-w-[1400px] w-full mx-auto px-6 grid grid-cols-3 items-center ${isLightPage ? 'text-primary dark:text-white' : 'text-white'} transition-colors duration-300">
                <!-- Left Column: Navigation / Burger menu -->
                <div class="flex items-center justify-start">
                    <!-- Mobile Menu Burger -->
                    <button class="md:hidden text-2xl mr-4 hover:text-accent transition-colors" id="menuTrigger" aria-label="Open menu">
                        <i class="fa-solid fa-bars"></i>
                    </button>
                    
                    <!-- Navigation Menu -->
                    <nav class="hidden md:flex gap-8 text-xs font-semibold tracking-widest items-center">
                        <div class="relative group py-6">
                            <a href="#/products?category=mens" class="nav-underline relative py-2 transition-colors flex items-center gap-1 cursor-pointer">
                                ĐỒNG HỒ NAM <i class="fa-solid fa-chevron-down text-[8px] transition-transform duration-300 group-hover:rotate-180"></i>
                            </a>
                            <!-- Dropdown Menu -->
                            <div class="absolute top-[80%] left-0 w-56 bg-white dark:bg-bgDarkSoft border border-gray-100 dark:border-neutral-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-50 py-3 text-primary dark:text-white">
                                <a href="#/products?category=mens" class="block px-6 py-2 text-[10px] font-bold tracking-wider hover:bg-bgLight dark:hover:bg-neutral-800 hover:text-accent transition-colors font-sans uppercase">TẤT CẢ ĐỒNG HỒ NAM</a>
                                <a href="#/products?category=mens&collection=chrono" class="block px-6 py-2 text-[10px] font-semibold tracking-wider hover:bg-bgLight dark:hover:bg-neutral-800 hover:text-accent transition-colors font-sans uppercase">CHRONOGRAPH</a>
                                <a href="#/products?category=mens&collection=legacy" class="block px-6 py-2 text-[10px] font-semibold tracking-wider hover:bg-bgLight dark:hover:bg-neutral-800 hover:text-accent transition-colors font-sans uppercase">LEGACY</a>
                                <a href="#/products?category=mens&collection=field" class="block px-6 py-2 text-[10px] font-semibold tracking-wider hover:bg-bgLight dark:hover:bg-neutral-800 hover:text-accent transition-colors font-sans uppercase">FIELD</a>
                                <a href="#/products?category=mens&collection=voyager" class="block px-6 py-2 text-[10px] font-semibold tracking-wider hover:bg-bgLight dark:hover:bg-neutral-800 hover:text-accent transition-colors font-sans uppercase">VOYAGER</a>
                            </div>
                        </div>
                        
                        <div class="relative group py-6">
                            <a href="#/products?category=womens" class="nav-underline relative py-2 transition-colors flex items-center gap-1 cursor-pointer">
                                ĐỒNG HỒ NỮ <i class="fa-solid fa-chevron-down text-[8px] transition-transform duration-300 group-hover:rotate-180"></i>
                            </a>
                            <!-- Dropdown Menu -->
                            <div class="absolute top-[80%] left-0 w-56 bg-white dark:bg-bgDarkSoft border border-gray-100 dark:border-neutral-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-50 py-3 text-primary dark:text-white">
                                <a href="#/products?category=womens" class="block px-6 py-2 text-[10px] font-bold tracking-wider hover:bg-bgLight dark:hover:bg-neutral-800 hover:text-accent transition-colors font-sans uppercase">TẤT CẢ ĐỒNG HỒ NỮ</a>
                                <a href="#/products?category=womens&collection=coronada" class="block px-6 py-2 text-[10px] font-semibold tracking-wider hover:bg-bgLight dark:hover:bg-neutral-800 hover:text-accent transition-colors font-sans uppercase">CORONADA</a>
                                <a href="#/products?category=womens&collection=nova" class="block px-6 py-2 text-[10px] font-semibold tracking-wider hover:bg-bgLight dark:hover:bg-neutral-800 hover:text-accent transition-colors font-sans uppercase">NOVA</a>
                                <a href="#/products?category=womens&collection=bloom" class="block px-6 py-2 text-[10px] font-semibold tracking-wider hover:bg-bgLight dark:hover:bg-neutral-800 hover:text-accent transition-colors font-sans uppercase">BLOOM</a>
                            </div>
                        </div>
                        
                        <a href="#/products?category=all&sort=price_asc" class="nav-underline nav-underline-sale relative py-2 text-sale transition-colors font-sans">KHUYẾN MÃI</a>
                    </nav>
                </div>

                <!-- Center Column: Brand Logo -->
                <div class="flex justify-center items-center">
                    <a href="#/" class="font-sans text-2xl font-bold tracking-[0.25em] hover:text-accent transition-colors">Đồng hồ A Tuấn</a>
                </div>

                <!-- Right Column: Action Icons -->
                <div class="flex gap-6 justify-end items-center font-sans">
                    <button class="hover:text-accent transition-colors text-lg outline-none" aria-label="Tìm kiếm"><i class="fa-solid fa-magnifying-glass"></i></button>
                    
                    <button class="hover:text-accent transition-colors text-lg outline-none" id="themeToggleBtn" aria-label="Toggle Theme">
                        <i class="fa-regular fa-moon"></i>
                    </button>

                    <div class="relative group py-6 flex items-center">
                        <button class="hover:text-accent transition-colors flex items-center text-lg outline-none" id="userBtn" aria-label="User Account">
                            <i class="fa-regular fa-user"></i>
                        </button>
                        <!-- User Submenu Dropdown -->
                        <div id="userDropdown" class="absolute top-[80%] right-0 w-44 bg-white dark:bg-bgDarkSoft border border-gray-100 dark:border-neutral-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-50 py-2 text-primary dark:text-white">
                            <!-- Populated dynamically via JS -->
                        </div>
                    </div>
                    
                    <a href="#/cart" class="hover:text-accent transition-colors relative text-lg block outline-none" id="cartBtn" aria-label="Giỏ hàng">
                        <i class="fa-solid fa-bag-shopping"></i>
                        <span id="cartBadge" class="absolute -top-1.5 -right-2 bg-accent text-white text-[8px] font-bold w-[15px] h-[15px] rounded-full flex items-center justify-center text-center scale-0 opacity-0 transition-all duration-300 leading-none">0</span>
                    </a>
                </div>
            </div>
        `;

        // Clean up any existing mobile menu elements in the body
        const existingOverlay = document.getElementById('mobileMenuOverlay');
        const existingDrawer = document.getElementById('mobileMenuDrawer');
        if (existingOverlay) existingOverlay.remove();
        if (existingDrawer) existingDrawer.remove();

        // Create overlay element
        const overlayElement = document.createElement('div');
        overlayElement.id = 'mobileMenuOverlay';
        overlayElement.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[99] opacity-0 pointer-events-none transition-opacity duration-300';
        document.body.appendChild(overlayElement);

        // Create drawer element
        const drawerElement = document.createElement('div');
        drawerElement.id = 'mobileMenuDrawer';
        drawerElement.className = 'fixed top-0 bottom-0 right-0 w-full md:w-80 bg-white dark:bg-[#121212] z-[100] translate-x-full transition-transform duration-300 flex flex-col p-6 shadow-2xl';
        drawerElement.innerHTML = `
            <div class="relative flex justify-center items-center pb-4 border-b border-accent/20">
                <span class="font-serif text-lg font-bold tracking-widest text-primary dark:text-white text-center">A Tuấn</span>
                <button id="closeMobileMenuBtn" class="absolute right-0 text-2xl text-gray-500 hover:text-accent outline-none">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="flex-grow flex flex-col justify-center items-center">
                <nav class="flex flex-col items-center gap-10 text-sm font-semibold tracking-widest text-primary dark:text-white w-full">
                    <a href="#/products?category=mens" class="mobile-nav-link hover:text-accent border-b border-gray-100 dark:border-neutral-800 pb-2 px-4 text-center">ĐỒNG HỒ NAM</a>
                    <a href="#/products?category=womens" class="mobile-nav-link hover:text-accent border-b border-gray-100 dark:border-neutral-800 pb-2 px-4 text-center">ĐỒNG HỒ NỮ</a>
                    <a href="#/products?category=all&sort=price_asc" class="mobile-nav-link text-sale hover:text-accent border-b border-gray-100 dark:border-neutral-800 pb-2 px-4 text-center">KHUYẾN MÃI</a>
                </nav>
            </div>
        `;
        document.body.appendChild(drawerElement);

        this.element = header;

        // Interactive sticky & scroll hide/show
        let lastScrollY = window.scrollY;
        
        const onScroll = () => {
            const currentScrollY = window.scrollY;
            const containerDiv = header.querySelector('.max-w-\\[1400px\\]');
            const menuTrigger = header.querySelector('#menuTrigger');
            
            const isShrunk = currentScrollY > 50;
            const hClass = isShrunk ? 'h-16' : 'h-20';
            const shadowClass = isShrunk ? 'shadow-md' : 'shadow-sm';
            const hideClass = currentScrollY > lastScrollY && currentScrollY > 150 ? '-translate-y-full' : '';

            if (isLightPage) {
                header.className = `${hClass} w-full bg-white/70 dark:bg-black/70 backdrop-blur-md ${shadowClass} border-b border-accent/50 dark:border-accent/40 flex items-center fixed top-0 left-0 z-50 transition-all duration-300 transform ${hideClass}`;
                if (containerDiv) {
                    containerDiv.classList.remove('text-white');
                    containerDiv.classList.add('text-primary', 'dark:text-white');
                }
                if (menuTrigger) {
                    menuTrigger.classList.remove('text-white');
                    menuTrigger.classList.add('text-primary', 'dark:text-white');
                }
            } else {
                if (isShrunk) {
                    header.className = `${hClass} w-full bg-white/70 dark:bg-black/70 backdrop-blur-md ${shadowClass} border-b border-accent/50 dark:border-accent/40 flex items-center fixed top-0 left-0 z-50 transition-all duration-300 transform ${hideClass}`;
                    if (containerDiv) {
                        containerDiv.classList.remove('text-white');
                        containerDiv.classList.add('text-primary', 'dark:text-white');
                    }
                    if (menuTrigger) {
                        menuTrigger.classList.remove('text-white');
                        menuTrigger.classList.add('text-primary', 'dark:text-white');
                    }
                } else {
                    header.className = `h-20 w-full bg-transparent flex items-center absolute top-10 left-0 z-50 transition-all duration-300 transform ${hideClass}`;
                    if (containerDiv) {
                        containerDiv.classList.remove('text-primary', 'dark:text-white');
                        containerDiv.classList.add('text-white');
                    }
                    if (menuTrigger) {
                        menuTrigger.classList.remove('text-primary', 'dark:text-white');
                        menuTrigger.classList.add('text-white');
                    }
                }
            }
            lastScrollY = currentScrollY;
        };

        window.addEventListener('scroll', onScroll);

        // Bind Mobile Drawer Events
        setTimeout(() => {
            const menuTrigger = header.querySelector('#menuTrigger');
            const drawer = document.getElementById('mobileMenuDrawer');
            const overlay = document.getElementById('mobileMenuOverlay');
            
            if (menuTrigger && drawer && overlay) {
                const closeBtn = drawer.querySelector('#closeMobileMenuBtn');
                const mobileLinks = drawer.querySelectorAll('.mobile-nav-link');
                
                const openDrawer = () => {
                    drawer.classList.remove('translate-x-full');
                    overlay.classList.remove('opacity-0', 'pointer-events-none');
                    overlay.classList.add('opacity-100');
                };

                const closeDrawer = () => {
                    drawer.classList.add('translate-x-full');
                    overlay.classList.remove('opacity-100');
                    overlay.classList.add('opacity-0', 'pointer-events-none');
                };

                menuTrigger.onclick = openDrawer;
                if (closeBtn) closeBtn.onclick = closeDrawer;
                overlay.onclick = closeDrawer;
                mobileLinks.forEach(link => {
                    link.onclick = closeDrawer;
                });
            }
        }, 100);
        
        // Cart click trigger binding
        const cartBtn = header.querySelector('#cartBtn');
        if (cartBtn && this.onCartClick) {
            cartBtn.addEventListener('click', this.onCartClick);
        }

        // Theme toggle logic
        const themeBtn = header.querySelector('#themeToggleBtn');
        const updateThemeIcon = () => {
            const isDark = document.documentElement.classList.contains('dark');
            themeBtn.innerHTML = isDark 
                ? '<i class="fa-regular fa-sun"></i>' 
                : '<i class="fa-regular fa-moon"></i>';
        };

        if (themeBtn) {
            updateThemeIcon();
            themeBtn.onclick = (e) => {
                e.preventDefault();
                const isDark = document.documentElement.classList.toggle('dark');
                localStorage.setItem('mvmt_theme', isDark ? 'dark' : 'light');
                updateThemeIcon();
            };
        }

        // Initialize user login section
        this.updateUserSection();
        this.setCartCount(this.cartCount);

        return header;
    }
}
