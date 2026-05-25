/**
 * Section: Best Sellers
 */
export default class BestSellers {
    constructor({ onProductClick, onAddToCart }) {
        this.onProductClick = onProductClick;
        this.onAddToCart = onAddToCart;
        this.products = [];
        this.element = null;
    }

    setProducts(products) {
        // Filter best seller watches
        this.products = products.filter(p => parseInt(p.is_bestseller) === 1);
        this.renderGrid();
    }

    renderGrid() {
        if (!this.element) return;
        const grid = this.element.querySelector('#bestSellersGrid');
        if (!grid) return;

        grid.innerHTML = '';
        if (this.products.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-10 text-gray-400">
                    Không tìm thấy sản phẩm bán chạy.
                </div>
            `;
            return;
        }

        this.products.forEach(product => {
            const card = document.createElement('div');
            card.className = "group relative bg-white dark:bg-bgDarkSoft p-4 border border-transparent dark:border-neutral-900/40 hover:border-neutral-100 dark:hover:border-neutral-800/60 flex flex-col h-full hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-white/5 transition-all duration-500 transform translate-y-8 opacity-0";
            card.dataset.id = product.id;

            let badgesHtml = '';
            if (parseInt(product.is_new) === 1) {
                badgesHtml += `<span class="bg-primary dark:bg-white dark:text-primary text-white text-[9px] font-bold tracking-wider px-3 py-1 uppercase pulse-tag">NEW</span>`;
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

            // Event Listeners
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
                // Prevent modal opening when clicking Add to Cart overlay
                if (e.target.closest('#cartOverlay')) return;
                handleProductView();
            });

            prodTitle.addEventListener('click', handleProductView);

            btnAddToCart.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.onAddToCart) this.onAddToCart(product);
            });

            grid.appendChild(card);

            // Trigger scroll reveal
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        card.classList.remove('translate-y-8', 'opacity-0');
                        card.classList.add('translate-y-0', 'opacity-100');
                        observer.unobserve(card);
                    }
                });
            }, { threshold: 0.15 });

            observer.observe(card);
        });
    }

    render() {
        const section = document.createElement('section');
        section.id = "bestSellersSection";
        section.className = "py-24 border-b border-accent/50 dark:border-accent/40 bg-white dark:bg-bgDark transition-colors duration-500";

        section.innerHTML = `
            <div class="max-w-[1400px] mx-auto px-6">
                <div class="flex justify-between items-end mb-12 border-b border-accent/50 dark:border-accent/40 pb-5">
                    <h2 class="font-serif text-3xl md:text-4xl text-primary dark:text-white font-normal">Bán Chạy Nhất</h2>
                    <a href="#/products?category=all&sort=favorites" class="text-xs font-bold tracking-widest uppercase pb-1 border-b border-primary dark:border-white text-primary dark:text-white hover:text-accent dark:hover:text-accent hover:border-accent dark:hover:border-accent transition-all duration-300 font-sans">XEM TẤT CẢ</a>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8" id="bestSellersGrid">
                    <!-- Loading placeholder -->
                    <div class="col-span-full text-center py-16 text-gray-400">
                        <i class="fa-solid fa-spinner fa-spin mr-2"></i> Đang tải sản phẩm bán chạy...
                    </div>
                </div>
            </div>
        `;

        this.element = section;
        return section;
    }
}
