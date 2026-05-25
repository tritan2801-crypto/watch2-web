/**
 * Section: Categories Collection
 */
export default class Categories {
    static render() {
        // Inject parallax helper stylesheet once
        if (!document.getElementById('categoriesParallaxStyles')) {
            const style = document.createElement('style');
            style.id = 'categoriesParallaxStyles';
            style.textContent = `
                .parallax-img {
                    transform: scale(1.08) translateY(var(--parallax-y, 0px));
                    transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 0.6s ease;
                }
                .category-card:hover .parallax-img {
                    transform: scale(1.18) translateY(var(--parallax-y, 0px));
                }
            `;
            document.head.appendChild(style);
        }

        const section = document.createElement('section');
        section.id = "categoriesSection";
        section.className = "py-24 bg-bgLight dark:bg-bgDark border-b border-accent/50 dark:border-accent/40 transition-colors duration-500";

        section.innerHTML = `
            <div class="max-w-[1400px] mx-auto px-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <!-- Category 1: Mens -->
                    <div class="category-card group relative aspect-square overflow-hidden bg-primary cursor-pointer">
                        <img src="images/cat_mens.png" alt="Đồng hồ Nam" class="parallax-img w-full h-full object-cover filter brightness-75">
                        <div class="absolute inset-0 bg-black/20 group-hover:bg-black/60 transition-colors duration-500 z-[5]"></div>
                        <div class="absolute inset-0 p-10 flex flex-col justify-end text-white z-10">
                            <h3 class="font-serif text-3xl font-normal mb-1">Đồng Hồ Nam</h3>
                            <p class="text-xs text-white/70 mb-5">Phong cách hiện đại, thiết kế mang tính biểu tượng</p>
                            <a href="#/products?category=mens" class="align-self-start text-[11px] font-semibold tracking-widest uppercase relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[1.5px] after:bg-white group-hover:after:bg-accent after:transition-all">MUA NGAY <span class="inline-block transition-transform duration-300 group-hover:translate-x-2">→</span></a>
                        </div>
                    </div>

                    <!-- Category 2: Womens -->
                    <div class="category-card group relative aspect-square overflow-hidden bg-primary cursor-pointer">
                        <img src="images/cat_womens.png" alt="Đồng hồ Nữ" class="parallax-img w-full h-full object-cover filter brightness-75">
                        <div class="absolute inset-0 bg-black/20 group-hover:bg-black/60 transition-colors duration-500 z-[5]"></div>
                        <div class="absolute inset-0 p-10 flex flex-col justify-end text-white z-10">
                            <h3 class="font-serif text-3xl font-normal mb-1">Đồng Hồ Nữ</h3>
                            <p class="text-xs text-white/70 mb-5">Phong cách thanh lịch cho mọi dịp</p>
                            <a href="#/products?category=womens" class="align-self-start text-[11px] font-semibold tracking-widest uppercase relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[1.5px] after:bg-white group-hover:after:bg-accent after:transition-all">MUA NGAY <span class="inline-block transition-transform duration-300 group-hover:translate-x-2">→</span></a>
                        </div>
                    </div>

                    <!-- Category 3: Accessories -->
                    <div class="category-card group relative aspect-square overflow-hidden bg-primary cursor-pointer">
                        <img src="images/cat_accessories.png" alt="Phụ kiện" class="parallax-img w-full h-full object-cover filter brightness-75">
                        <div class="absolute inset-0 bg-black/20 group-hover:bg-black/60 transition-colors duration-500 z-[5]"></div>
                        <div class="absolute inset-0 p-10 flex flex-col justify-end text-white z-10">
                            <h3 class="font-serif text-3xl font-normal mb-1">Phụ Kiện</h3>
                            <p class="text-xs text-white/70 mb-5">Hoàn thiện vẻ đẹp của bạn</p>
                            <a href="#/products?category=accessories" class="align-self-start text-[11px] font-semibold tracking-widest uppercase relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[1.5px] after:bg-white group-hover:after:bg-accent after:transition-all">MUA NGAY <span class="inline-block transition-transform duration-300 group-hover:translate-x-2">→</span></a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Setup scroll reveal animation trigger and click handlers
        setTimeout(() => {
            const cards = section.querySelectorAll('.category-card');
            cards.forEach(card => {
                card.classList.add('transition-all', 'duration-1000', 'transform', 'translate-y-8', 'opacity-0');
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

                // Navigate to corresponding category on card click
                card.addEventListener('click', () => {
                    const link = card.querySelector('a');
                    if (link) {
                        const href = link.getAttribute('href');
                        if (href) {
                            window.location.hash = href;
                        }
                    }
                });
            });

            // Parallax scroll calculations
            const handleParallax = () => {
                const visibleCards = section.querySelectorAll('.category-card');
                visibleCards.forEach(card => {
                    const img = card.querySelector('.parallax-img');
                    if (!img) return;
                    const rect = card.getBoundingClientRect();
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        const relativeY = rect.top - window.innerHeight / 2;
                        const yOffset = relativeY * 0.05; // speed multiplier
                        img.style.setProperty('--parallax-y', `${yOffset}px`);
                    }
                });
            };
            window.addEventListener('scroll', handleParallax);
            handleParallax(); // Trigger initially
        }, 100);

        return section;
    }
}
