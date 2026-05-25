/**
 * Section: Product Catalog with Filters and Sorting (Inside Products Page)
 */
export default class ProductCatalog {
    constructor({ onProductClick, onAddToCart }) {
        this.onProductClick = onProductClick;
        this.onAddToCart = onAddToCart;
        this.products = [];
        this.filteredProducts = [];
        
        // Filter States
        this.filtersVisible = false;
        this.selectedCategory = 'all'; 
        this.selectedCollection = 'all'; 
        this.sortOrder = 'favorites'; 
        
        this.element = null;
    }

    setProducts(products) {
        this.products = products;
        this.applyFiltersAndSort();
    }

    setCategoryFilter(category) {
        this.selectedCategory = category;
        if (this.element) {
            const catSelect = this.element.querySelector('#catalogCategory');
            if (catSelect) catSelect.value = category;
        }
        this.applyFiltersAndSort();
    }

    setCollectionFilter(collection) {
        this.selectedCollection = collection;
        if (this.element) {
            const collSelect = this.element.querySelector('#catalogCollection');
            if (collSelect) collSelect.value = collection;
        }
        this.applyFiltersAndSort();
    }

    applyFiltersAndSort() {
        let tempProducts = [...this.products];

        // 1. Filter by Category
        if (this.selectedCategory !== 'all') {
            tempProducts = tempProducts.filter(product => {
                const cat = product.category.toLowerCase();
                if (this.selectedCategory === 'mens') {
                    return cat.includes('mens') && !cat.includes('womens');
                } else if (this.selectedCategory === 'womens') {
                    return cat.includes('womens') || cat === 'watches';
                } else if (this.selectedCategory === 'accessories') {
                    return cat.includes('accessories');
                }
                return true;
            });
        }

        // 2. Filter by Collection
        if (this.selectedCollection !== 'all') {
            tempProducts = tempProducts.filter(product => {
                const title = product.title.toLowerCase();
                const coll = this.selectedCollection;

                if (coll === 'classic') {
                    return title.includes('classic') || title.includes('vintage');
                } else if (coll === 'field') {
                    return title.includes('field') || title.includes('ranger');
                } else if (coll === 'voyager') {
                    return title.includes('voyager') || title.includes('ocean') || title.includes('dive') || title.includes('stella 38');
                } else if (coll === 'chrono') {
                    return title.includes('chrono') || title.includes('chronograph');
                } else if (coll === 'coronada') {
                    return title.includes('coronada') || title.includes('ceramic') || title.includes('pearl');
                } else if (coll === 'nova') {
                    return title.includes('nova') || title.includes('stella');
                } else if (coll === 'bloom') {
                    return title.includes('bloom') || title.includes('square') || title.includes('stella 38');
                } else if (coll === 'legacy') {
                    return title.includes('legacy') || title.includes('slim');
                }
                return true;
            });
        }

        // 3. Sort products
        if (this.sortOrder === 'favorites') {
            tempProducts.sort((a, b) => {
                const aVal = (parseInt(a.is_bestseller) * 2) + parseInt(a.is_new);
                const bVal = (parseInt(b.is_bestseller) * 2) + parseInt(b.is_new);
                return bVal - aVal;
            });
        } else if (this.sortOrder === 'newest') {
            tempProducts.sort((a, b) => parseInt(b.is_new) - parseInt(a.is_new));
        } else if (this.sortOrder === 'price_asc') {
            tempProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        } else if (this.sortOrder === 'price_desc') {
            tempProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        }

        this.filteredProducts = tempProducts;
        this.renderGrid();
        this.updateProductCount();
    }

    updateProductCount() {
        if (!this.element) return;
        const countSpan = this.element.querySelector('#catalogCount');
        if (countSpan) {
            countSpan.textContent = `${this.filteredProducts.length} sản phẩm`;
        }
    }

    toggleFiltersPanel() {
        if (!this.element) return;
        this.filtersVisible = !this.filtersVisible;
        const panel = this.element.querySelector('#filtersPanel');
        const btn = this.element.querySelector('#btnFilterToggle');
        
        if (this.filtersVisible) {
            panel.classList.remove('max-w-0', 'opacity-0');
            panel.classList.add('max-w-[600px]', 'opacity-100');
            btn.classList.add('bg-bgLight', 'dark:bg-bgDarkSoft', 'border-accent', 'text-accent');
        } else {
            panel.classList.remove('max-w-[600px]', 'opacity-100');
            panel.classList.add('max-w-0', 'opacity-0');
            btn.classList.remove('bg-bgLight', 'dark:bg-bgDarkSoft', 'border-accent', 'text-accent');
        }
    }

    renderGrid() {
        if (!this.element) return;
        const grid = this.element.querySelector('#catalogGrid');
        if (!grid) return;

        grid.innerHTML = '';
        if (this.filteredProducts.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-24 text-gray-400 dark:text-gray-500">
                    <i class="fa-solid fa-hourglass-empty text-4xl mb-4 opacity-50 block"></i>
                    <p class="text-xs font-semibold tracking-wider">KHÔNG TÌM THẤY SẢN PHẨM PHÙ HỢP</p>
                </div>
            `;
            return;
        }

        this.filteredProducts.forEach(product => {
            const card = document.createElement('div');
            card.className = "group relative bg-white dark:bg-bgDarkSoft p-4 border border-transparent dark:border-neutral-900/40 hover:border-neutral-100 dark:hover:border-neutral-800/60 flex flex-col h-full hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-white/5 transition-all duration-500 transform translate-y-8 opacity-0";
            card.dataset.id = product.id;

            let badgesHtml = '';
            if (parseInt(product.is_new) === 1) {
                badgesHtml += `<span class="bg-primary dark:bg-white dark:text-primary text-white text-[9px] font-bold tracking-wider px-3 py-1 uppercase pulse-tag">MỚI</span>`;
            }
            if (parseInt(product.is_bestseller) === 1) {
                badgesHtml += `<span class="bg-accent text-white text-[9px] font-bold tracking-wider px-3 py-1 uppercase pulse-tag">BÁN CHẠY</span>`;
            }

            card.innerHTML = `
                <div class="relative bg-bgLight dark:bg-bgDark aspect-[4/5] overflow-hidden mb-5 cursor-pointer skeleton-block" id="imgContainer">
                    <img src="${product.image_url}" alt="${product.title}" class="w-full h-full object-cover transition-all duration-[600ms] ease-out group-hover:scale-[1.08] opacity-0" onload="this.classList.remove('opacity-0'); this.parentElement.classList.remove('skeleton-block');">
                    <div class="absolute top-4 left-4 flex flex-col gap-2 z-10">
                        ${badgesHtml}
                    </div>
                    <!-- Add To Cart Overlay -->
                    <div class="absolute -bottom-14 left-0 w-full bg-primary/95 dark:bg-white/95 p-4 text-center transition-all duration-[400ms] ease-out group-hover:bottom-0 z-20" id="cartOverlay">
                        <button class="w-full text-white dark:text-primary text-xs font-bold tracking-widest uppercase hover:text-accent dark:hover:text-accent transition-colors" id="btnAddToCart">THÊM VÀO GIỎ</button>
                    </div>
                </div>
                <div class="flex flex-col flex-grow">
                    <span class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 font-sans font-bold">${product.category}</span>
                    <h3 class="text-sm font-semibold text-primary dark:text-white group-hover:text-accent dark:group-hover:text-accent transition-colors cursor-pointer mb-1" id="prodTitle">${product.title}</h3>
                    <span class="text-xs text-gray-400 dark:text-gray-500 mb-2">${product.size}</span>
                    <div class="flex items-center gap-2 font-bold text-sm text-primary dark:text-white">
                        <span>${window.formatPrice(product.price)}</span>
                        <span class="old-price-line text-xs font-normal text-gray-400 dark:text-gray-500">${window.formatPrice(parseFloat(product.price) * 1.25)}</span>
                    </div>
                </div>
            `;

            const imgContainer = card.querySelector('#imgContainer');
            const prodTitle = card.querySelector('#prodTitle');
            const btnAddToCart = card.querySelector('#btnAddToCart');
            const imgEl = card.querySelector('#imgContainer img');

            if (imgEl) {
                if (imgEl.complete) {
                    imgEl.classList.remove('opacity-0');
                    imgEl.parentElement.classList.remove('skeleton-block');
                } else {
                    imgEl.addEventListener('load', () => {
                        imgEl.classList.remove('opacity-0');
                        imgEl.parentElement.classList.remove('skeleton-block');
                    });
                }
            }

            const handleProductView = () => {
                if (this.onProductClick) this.onProductClick(product);
            };

            imgContainer.addEventListener('click', (e) => {
                if (e.target.closest('#cartOverlay')) return;
                handleProductView();
            });

            prodTitle.addEventListener('click', handleProductView);

            btnAddToCart.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.onAddToCart) this.onAddToCart(product);
            });

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

    render() {
        const section = document.createElement('section');
        section.id = "allWatchesSection";
        section.className = "bg-white dark:bg-bgDark overflow-hidden transition-colors duration-500";

        section.innerHTML = `
            <!-- Banner Header -->
            <div class="relative py-24 bg-primary flex items-center justify-center text-center overflow-hidden">
                <div class="absolute inset-0 z-10 opacity-40">
                    <img src="images/story_flatlay.png" alt="All Watches Banner" class="w-full h-full object-cover filter blur-[2px]">
                </div>
                <div class="absolute inset-0 bg-black/60 z-20"></div>
                
                <div class="relative z-30 text-white px-6">
                    <h2 class="font-serif text-4xl md:text-5xl font-normal mb-3 leading-tight tracking-wider">Tất Cả Đồng Hồ</h2>
                    <p class="text-xs md:text-sm tracking-widest text-white/70 uppercase">Phong cách cổ điển hòa quyện thiết kế hiện đại</p>
                </div>
            </div>

            <!-- Toolbar Panel -->
            <div class="border-b border-accent/50 dark:border-accent/40 py-6 sticky top-20 bg-white/95 dark:bg-bgDark/95 backdrop-blur-md z-40 shadow-sm dark:shadow-neutral-900/50 transition-all duration-300">
                <div class="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                    <!-- Filters Trigger, Inline dropdowns and Product count -->
                    <div class="flex items-center gap-4 flex-wrap">
                        <button id="btnFilterToggle" class="flex items-center gap-2 border border-gray-200 dark:border-neutral-800 px-6 py-3 text-xs font-bold tracking-wider uppercase text-primary dark:text-white hover:border-accent dark:hover:border-accent transition-all duration-300 outline-none">
                            <i class="fa-solid fa-sliders"></i>
                            <span>BỘ LỌC</span>
                        </button>
                        
                        <!-- Inline Filters Panel (Dropdowns) -->
                        <div id="filtersPanel" class="flex items-center gap-3 transition-all duration-500 overflow-hidden max-w-0 opacity-0 whitespace-nowrap flex-grow md:flex-grow-0">
                            <!-- Category Filter -->
                            <div class="relative flex-grow md:flex-initial md:w-48 shrink-0 min-w-[130px]">
                                <select id="catalogCategory" class="w-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-bgDarkSoft px-4 py-3 text-xs tracking-wider font-semibold text-primary dark:text-white focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer">
                                    <option value="all">Tất cả danh mục</option>
                                    <option value="mens">Đồng hồ Nam</option>
                                    <option value="womens">Đồng hồ Nữ</option>
                                    <option value="accessories">Phụ kiện</option>
                                </select>
                                <i class="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none text-gray-400 dark:text-gray-500"></i>
                            </div>

                            <!-- Collection Filter -->
                            <div class="relative flex-grow md:flex-initial md:w-48 shrink-0 min-w-[130px]">
                                <select id="catalogCollection" class="w-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-bgDarkSoft px-4 py-3 text-xs tracking-wider font-semibold text-primary dark:text-white focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer">
                                    <option value="all">Tất cả bộ sưu tập</option>
                                    <option value="classic">Cổ điển</option>
                                    <option value="field">Thực địa</option>
                                    <option value="voyager">Viễn du</option>
                                    <option value="chrono">Bấm giờ (Chrono)</option>
                                    <option value="coronada">Coronada</option>
                                    <option value="nova">Nova</option>
                                    <option value="bloom">Bloom</option>
                                    <option value="legacy">Di sản</option>
                                </select>
                                <i class="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none text-gray-400 dark:text-gray-500"></i>
                            </div>
                        </div>

                        <span id="catalogCount" class="text-xs text-gray-400 dark:text-gray-500 font-semibold tracking-wide">0 sản phẩm</span>
                    </div>

                    <!-- Sort Dropdown -->
                    <div class="flex justify-end items-center gap-2">
                        <label class="text-[10px] text-gray-400 dark:text-gray-500 font-bold tracking-widest uppercase hidden sm:inline">SẮP XẾP THEO:</label>
                        <div class="relative w-48">
                            <select id="catalogSort" class="w-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-bgDarkSoft px-4 py-3 text-xs font-bold tracking-wider text-primary dark:text-white focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer">
                                <option value="favorites">Được yêu thích</option>
                                <option value="newest">Mới nhất</option>
                                <option value="price_asc">Giá: Thấp đến Cao</option>
                                <option value="price_desc">Giá: Cao đến Thấp</option>
                            </select>
                            <i class="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none text-gray-400 dark:text-gray-500"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Product Grid Area -->
            <div class="max-w-[1400px] mx-auto px-6 py-16">
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8" id="catalogGrid">
                    <!-- Dynamic rendering -->
                </div>
            </div>
        `;

        this.element = section;

        // Bind Toolbar Event Handlers
        const btnToggle = section.querySelector('#btnFilterToggle');
        const selectSort = section.querySelector('#catalogSort');
        const selectCategory = section.querySelector('#catalogCategory');
        const selectCollection = section.querySelector('#catalogCollection');

        btnToggle.addEventListener('click', () => this.toggleFiltersPanel());
        
        selectSort.addEventListener('change', (e) => {
            this.sortOrder = e.target.value;
            this.applyFiltersAndSort();
        });

        selectCategory.addEventListener('change', (e) => {
            this.selectedCategory = e.target.value;
            this.applyFiltersAndSort();
        });

        selectCollection.addEventListener('change', (e) => {
            this.selectedCollection = e.target.value;
            this.applyFiltersAndSort();
        });

        return section;
    }
}
