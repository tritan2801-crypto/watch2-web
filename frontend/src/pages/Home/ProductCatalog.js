/**
 * Section: Product Catalog with Filters and Sorting
 */
export default class ProductCatalog {
    constructor({ onProductClick, onAddToCart }) {
        this.onProductClick = onProductClick;
        this.onAddToCart = onAddToCart;
        this.products = [];
        this.filteredProducts = [];
        
        // Filter States
        this.filtersVisible = false;
        this.selectedCategory = 'all'; // 'all', 'mens', 'womens', 'accessories'
        this.selectedCollection = 'all'; // 'all', 'classic', 'field', 'voyager', 'chrono', 'coronada', 'nova', 'bloom', 'legacy'
        this.sortOrder = 'favorites'; // 'favorites', 'newest', 'price_asc', 'price_desc'
        
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
                    return cat.includes('mens');
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
            // Sort by bestseller desc, then new desc
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
            countSpan.textContent = `${this.filteredProducts.length} product${this.filteredProducts.length !== 1 ? 's' : ''}`;
        }
    }

    toggleFiltersPanel() {
        if (!this.element) return;
        this.filtersVisible = !this.filtersVisible;
        const panel = this.element.querySelector('#filtersPanel');
        const btn = this.element.querySelector('#btnFilterToggle');
        
        if (this.filtersVisible) {
            panel.classList.remove('max-h-0', 'opacity-0');
            panel.classList.add('max-h-40', 'opacity-100', 'py-6');
            btn.classList.add('bg-bgLight', 'border-accent', 'text-accent');
        } else {
            panel.classList.remove('max-h-40', 'opacity-100', 'py-6');
            panel.classList.add('max-h-0', 'opacity-0');
            btn.classList.remove('bg-bgLight', 'border-accent', 'text-accent');
        }
    }

    renderGrid() {
        if (!this.element) return;
        const grid = this.element.querySelector('#catalogGrid');
        if (!grid) return;

        grid.innerHTML = '';
        if (this.filteredProducts.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-24 text-gray-400">
                    <i class="fa-solid fa-hourglass-empty text-4xl mb-4 opacity-50 block"></i>
                    <p class="text-xs font-semibold tracking-wider">KHÔNG TÌM THẤY SẢN PHẨM PHÙ HỢP</p>
                </div>
            `;
            return;
        }

        this.filteredProducts.forEach(product => {
            const card = document.createElement('div');
            card.className = "group relative bg-white flex flex-col h-full transition-all duration-700 transform translate-y-8 opacity-0";
            card.dataset.id = product.id;

            let badgesHtml = '';
            if (parseInt(product.is_new) === 1) {
                badgesHtml += `<span class="bg-primary text-white text-[9px] font-bold tracking-wider px-3 py-1 uppercase">NEW</span>`;
            }
            if (parseInt(product.is_bestseller) === 1) {
                badgesHtml += `<span class="bg-accent text-white text-[9px] font-bold tracking-wider px-3 py-1 uppercase">BEST SELLER</span>`;
            }

            card.innerHTML = `
                <div class="relative bg-bgLight aspect-[4/5] overflow-hidden mb-5 cursor-pointer" id="imgContainer">
                    <img src="${product.image_url}" alt="${product.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                    <div class="absolute top-4 left-4 flex flex-col gap-2 z-10">
                        ${badgesHtml}
                    </div>
                    <!-- Add To Cart Overlay -->
                    <div class="absolute -bottom-14 left-0 w-full bg-primary/95 p-4 text-center transition-all duration-300 group-hover:bottom-0 z-20" id="cartOverlay">
                        <button class="w-full text-white text-xs font-bold tracking-widest uppercase hover:text-accent transition-colors" id="btnAddToCart">ADD TO CART</button>
                    </div>
                </div>
                <div class="flex flex-col flex-grow">
                    <span class="text-[10px] text-gray-500 uppercase tracking-widest mb-1">${product.category}</span>
                    <h3 class="text-sm font-medium hover:text-accent transition-colors cursor-pointer mb-1" id="prodTitle">${product.title}</h3>
                    <span class="text-xs text-gray-500 mb-2">${product.size}</span>
                    <div class="flex items-center gap-2 font-bold text-sm">
                        <span>$${parseFloat(product.price).toFixed(2)}</span>
                    </div>
                </div>
            `;

            const imgContainer = card.querySelector('#imgContainer');
            const prodTitle = card.querySelector('#prodTitle');
            const btnAddToCart = card.querySelector('#btnAddToCart');

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
        section.className = "bg-white overflow-hidden";

        section.innerHTML = `
            <!-- Banner Header -->
            <div class="relative py-24 bg-primary flex items-center justify-center text-center overflow-hidden">
                <div class="absolute inset-0 z-10 opacity-40">
                    <img src="images/story_flatlay.png" alt="All Watches Banner" class="w-full h-full object-cover filter blur-[2px]">
                </div>
                <div class="absolute inset-0 bg-black/60 z-20"></div>
                
                <div class="relative z-30 text-white px-6">
                    <h2 class="font-serif text-4xl md:text-5xl font-normal mb-3 leading-tight tracking-wider">All Watches</h2>
                    <p class="text-xs md:text-sm tracking-widest text-white/70 uppercase">Classic style meets modern design</p>
                </div>
            </div>

            <!-- Toolbar Panel -->
            <div class="border-b border-gray-100 py-6 sticky top-20 bg-white z-40 shadow-sm transition-all duration-300">
                <div class="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                    <!-- Filters Trigger and Product count -->
                    <div class="flex items-center gap-6">
                        <button id="btnFilterToggle" class="flex items-center gap-2 border border-gray-200 px-6 py-3 text-xs font-bold tracking-wider uppercase hover:border-accent hover:text-accent transition-all duration-300 outline-none">
                            <i class="fa-solid fa-sliders"></i>
                            <span>FILTERS</span>
                        </button>
                        <span id="catalogCount" class="text-xs text-gray-400 font-semibold tracking-wide">0 products</span>
                    </div>

                    <!-- Sort Dropdown -->
                    <div class="flex justify-end items-center gap-2">
                        <label class="text-[10px] text-gray-400 font-bold tracking-widest uppercase hidden sm:inline">SORT BY:</label>
                        <div class="relative w-48">
                            <select id="catalogSort" class="w-full border border-gray-200 bg-white px-4 py-3 text-xs font-bold tracking-wider text-primary focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer">
                                <option value="favorites">Our Favorites</option>
                                <option value="newest">Newest</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                            </select>
                            <i class="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none text-gray-400"></i>
                        </div>
                    </div>
                </div>

                <!-- Sliding Filters Panel (Dropdowns) -->
                <div id="filtersPanel" class="max-w-[1400px] mx-auto px-6 flex flex-col sm:flex-row gap-4 justify-start items-center max-h-0 opacity-0 overflow-hidden transition-all duration-300">
                    <!-- Category Filter -->
                    <div class="relative w-full sm:w-64">
                        <select id="catalogCategory" class="w-full border border-gray-200 bg-white px-4 py-3 text-xs tracking-wider font-semibold text-primary focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer">
                            <option value="all">All Categories</option>
                            <option value="mens">Men's Watches</option>
                            <option value="womens">Women's Watches</option>
                            <option value="accessories">Accessories</option>
                        </select>
                        <i class="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none text-gray-400"></i>
                    </div>

                    <!-- Collection Filter -->
                    <div class="relative w-full sm:w-64">
                        <select id="catalogCollection" class="w-full border border-gray-200 bg-white px-4 py-3 text-xs tracking-wider font-semibold text-primary focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer">
                            <option value="all">All Collections</option>
                            <option value="classic">Classic</option>
                            <option value="field">Field</option>
                            <option value="voyager">Voyager</option>
                            <option value="chrono">Chrono</option>
                            <option value="coronada">Coronada</option>
                            <option value="nova">Nova</option>
                            <option value="bloom">Bloom</option>
                            <option value="legacy">Legacy</option>
                        </select>
                        <i class="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none text-gray-400"></i>
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
