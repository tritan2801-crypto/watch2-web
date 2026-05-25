/**
 * Section: Hero Banner
 */
export default class Hero {
    static wrapText(element) {
        if (!element) return;
        const text = element.textContent.trim();
        element.innerHTML = '';
        const words = text.split(/\s+/);
        let delay = 0;
        
        words.forEach((word, wordIdx) => {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'inline-block whitespace-nowrap';
            
            for (let i = 0; i < word.length; i++) {
                const char = word[i];
                const span = document.createElement('span');
                span.className = 'stagger-char';
                span.textContent = char;
                span.style.animationDelay = `${delay}s`;
                wordSpan.appendChild(span);
                delay += 0.04;
            }
            
            element.appendChild(wordSpan);
            
            if (wordIdx < words.length - 1) {
                element.appendChild(document.createTextNode(' '));
            }
        });
    }

    static render() {
        const section = document.createElement('section');
        section.className = "relative w-full overflow-hidden border-b border-accent/50 dark:border-accent/40";

        section.innerHTML = `
            <!-- Announcement Bar Slider -->
            <div class="h-10 bg-primary text-white flex justify-center items-center text-[10px] font-medium tracking-widest relative z-[60] border-b border-white/5 overflow-hidden">
                <div class="announcement-slider w-full h-full relative">
                    <div class="announcement-slide absolute w-full h-full flex justify-center items-center transition-all duration-500 opacity-100 translate-y-0 active">MIỄN PHÍ VẬN CHUYỂN TOÀN QUỐC CHO ĐƠN HÀNG TỪ 1 TRIỆU ĐỒNG</div>
                    <div class="announcement-slide absolute w-full h-full flex justify-center items-center transition-all duration-500 opacity-0 translate-y-full">MUA MỘT TẶNG MỘT GIẢM 50% | MÃ: BOGO50</div>
                    <div class="announcement-slide absolute w-full h-full flex justify-center items-center transition-all duration-500 opacity-0 translate-y-full">BẢO HÀNH CHÍNH HÃNG 2 NĂM CHO TẤT CẢ SẢN PHẨM</div>
                </div>
            </div>

            <!-- Hero Banner Slider -->
            <div class="h-screen min-h-[600px] relative bg-primary overflow-hidden" id="heroSlider">
                <!-- Slide 1: Legacy Gold -->
                <div class="hero-slide absolute inset-0 z-10 flex items-center opacity-100 transition-opacity duration-1000 active" data-index="0">
                    <div class="absolute inset-0 z-10 overflow-hidden">
                        <img src="images/hero_watch.png" alt="Đồng hồ A Tuấn Luxury Gold Watch Hero" class="w-full h-full object-cover filter brightness-[0.65]">
                    </div>
                    <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/70 z-20"></div>
                    <div class="container mx-auto px-6 relative z-30 text-white text-center flex flex-col items-center justify-center h-full pt-20">
                        <h1 class="font-serif text-5xl md:text-7xl font-normal mb-4 leading-tight opacity-0">Mua Một Tặng Một Giảm 50%</h1>
                        <p class="text-sm md:text-base tracking-widest font-normal mb-10 text-white/80 opacity-0 uppercase font-sans">Sử dụng mã: BOGO50</p>
                        <div class="hero-actions flex flex-col sm:flex-row gap-5 justify-center opacity-0 w-full sm:w-auto px-10 sm:px-0">
                            <a href="#/products?category=mens" class="hero-btn-luxury inline-block px-10 py-4 text-xs font-semibold tracking-widest uppercase bg-transparent text-white border border-white transition-all duration-300">ĐỒNG HỒ NAM</a>
                            <a href="#/products?category=womens" class="hero-btn-luxury inline-block px-10 py-4 text-xs font-semibold tracking-widest uppercase bg-transparent text-white border border-white transition-all duration-300">ĐỒNG HỒ NỮ</a>
                        </div>
                    </div>
                </div>

                <!-- Slide 2: Chrono Phantom -->
                <div class="hero-slide absolute inset-0 z-10 flex items-center opacity-0 pointer-events-none transition-opacity duration-1000" data-index="1">
                    <div class="absolute inset-0 z-10 overflow-hidden">
                        <img src="images/chrono_phantom.png" alt="Đồng hồ A Tuấn Chronograph Phantom" class="w-full h-full object-cover filter brightness-[0.6]">
                    </div>
                    <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/70 z-20"></div>
                    <div class="container mx-auto px-6 relative z-30 text-white text-center flex flex-col items-center justify-center h-full pt-20">
                        <h1 class="font-serif text-5xl md:text-7xl font-normal mb-4 leading-tight opacity-0">Dòng Chronograph</h1>
                        <p class="text-sm md:text-base tracking-widest font-normal mb-10 text-white/80 opacity-0 uppercase font-sans">Chế tác cho sự mạnh mẽ & phiêu lưu</p>
                        <div class="hero-actions flex flex-col sm:flex-row gap-5 justify-center opacity-0 w-full sm:w-auto px-10 sm:px-0">
                            <a href="#/products?category=mens&collection=chrono" class="hero-btn-luxury inline-block px-10 py-4 text-xs font-semibold tracking-widest uppercase bg-transparent text-white border border-white transition-all duration-300">KHÁM PHÁ CHRONO</a>
                        </div>
                    </div>
                </div>

                <!-- Slide 3: Pearl Ceramic -->
                <div class="hero-slide absolute inset-0 z-10 flex items-center opacity-0 pointer-events-none transition-opacity duration-1000" data-index="2">
                    <div class="absolute inset-0 z-10 overflow-hidden">
                        <img src="images/womens_ceramic.png" alt="Đồng hồ Nữ Ceramic A Tuấn" class="w-full h-full object-cover filter brightness-[0.65]">
                    </div>
                    <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/70 z-20"></div>
                    <div class="container mx-auto px-6 relative z-30 text-white text-center flex flex-col items-center justify-center h-full pt-20">
                        <h1 class="font-serif text-5xl md:text-7xl font-normal mb-4 leading-tight opacity-0">Dòng Ceramic Cao Cấp</h1>
                        <p class="text-sm md:text-base tracking-widest font-normal mb-10 text-white/80 opacity-0 uppercase font-sans">Sự quý phái và bền bỉ vượt thời gian</p>
                        <div class="hero-actions flex flex-col sm:flex-row gap-5 justify-center opacity-0 w-full sm:w-auto px-10 sm:px-0">
                            <a href="#/products?category=womens" class="hero-btn-luxury inline-block px-10 py-4 text-xs font-semibold tracking-widest uppercase bg-transparent text-white border border-white transition-all duration-300">ĐỒNG HỒ NỮ</a>
                        </div>
                    </div>
                </div>

                <!-- Rotating Clock Icon -->
                <div class="absolute right-12 top-1/2 -translate-y-1/2 z-30 hidden lg:block opacity-25 select-none pointer-events-none">
                    <svg class="w-32 h-32 text-white animate-spin-slow" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1">
                        <circle cx="50" cy="50" r="45" stroke-dasharray="3 3" />
                        <line x1="50" y1="50" x2="50" y2="22" stroke-linecap="round" />
                        <line x1="50" y1="50" x2="68" y2="50" stroke-linecap="round" />
                        <line x1="50" y1="10" x2="50" y2="16" stroke-width="1.5" />
                        <line x1="90" y1="50" x2="84" y2="50" stroke-width="1.5" />
                        <line x1="50" y1="90" x2="50" y2="84" stroke-width="1.5" />
                        <line x1="10" y1="50" x2="16" y2="50" stroke-width="1.5" />
                    </svg>
                </div>

                <!-- Slider Arrows -->
                <button id="heroPrevBtn" class="absolute left-6 top-1/2 -translate-y-1/2 z-40 w-12 h-12 flex items-center justify-center text-white/70 border border-white/20 rounded-full hover:border-accent hover:text-accent hover:scale-120 transition-all duration-350 outline-none hidden md:flex" aria-label="Previous Slide">
                    <i class="fa-solid fa-chevron-left text-sm"></i>
                </button>
                <button id="heroNextBtn" class="absolute right-6 top-1/2 -translate-y-1/2 z-40 w-12 h-12 flex items-center justify-center text-white/70 border border-white/20 rounded-full hover:border-accent hover:text-accent hover:scale-120 transition-all duration-350 outline-none hidden md:flex" aria-label="Next Slide">
                    <i class="fa-solid fa-chevron-right text-sm"></i>
                </button>

                <!-- Slider Dots -->
                <div class="absolute bottom-20 left-0 w-full flex justify-center gap-3 z-40">
                    <button class="slider-dot w-2.5 h-2.5 rounded-full border border-white bg-white hover:scale-130 transition-all duration-300" data-index="0" aria-label="Slide 1"></button>
                    <button class="slider-dot w-2.5 h-2.5 rounded-full border border-white bg-transparent hover:scale-130 transition-all duration-300" data-index="1" aria-label="Slide 2"></button>
                    <button class="slider-dot w-2.5 h-2.5 rounded-full border border-white bg-transparent hover:scale-130 transition-all duration-300" data-index="2" aria-label="Slide 3"></button>
                </div>
            </div>

            <!-- Hero Info Footer Bar (Sticky relative to bottom of hero) -->
            <div class="absolute bottom-0 left-0 w-full bg-primary/85 backdrop-blur-sm z-30 py-5 border-t border-white/10 hidden md:block">
                <div class="max-w-[1400px] w-full mx-auto px-6 flex justify-between items-center text-white font-sans">
                    <span class="text-xs tracking-wider">Mua một tặng một giảm 50% + mã: BOGO50</span>
                    <div class="flex gap-6 text-[11px] font-semibold tracking-widest uppercase">
                        <a href="#/products?category=mens" class="relative hover:text-accent transition-colors pb-1 border-b border-white hover:border-accent">ĐỒNG HỒ NAM</a>
                        <a href="#/products?category=womens" class="relative hover:text-accent transition-colors pb-1 border-b border-white hover:border-accent">ĐỒNG HỒ NỮ</a>
                    </div>
                </div>
            </div>
        `;

        // Inject dynamic keyframe styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInUp {
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes kenBurns {
                0% { transform: scale(1); }
                100% { transform: scale(1.1); }
            }
            @keyframes spinSlow {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .hero-slide.active img {
                animation: kenBurns 12s ease-in-out forwards;
            }
            .hero-slide.active h1 { opacity: 1; }
            .hero-slide.active .stagger-char { animation: staggerReveal 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
            .hero-slide.active p { animation: fadeInUp 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards 0.8s; }
            .hero-slide.active .hero-actions { animation: fadeInUp 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards 1.2s; }
            
            .animate-spin-slow {
                animation: spinSlow 60s linear infinite;
            }
            
            .hero-btn-luxury {
                background-image: linear-gradient(to right, #c5a059 50%, transparent 50%);
                background-size: 200% 100%;
                background-position: right bottom;
                transition: background-position 0.4s ease, color 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease !important;
            }
            .hero-btn-luxury:hover {
                background-position: left bottom;
                color: white !important;
                border-color: #c5a059 !important;
                box-shadow: 0 0 15px rgba(197, 160, 89, 0.5);
            }
        `;
        section.appendChild(style);

        // Wrap h1 text for stagger characters
        section.querySelectorAll('.hero-slide h1').forEach(h1 => {
            Hero.wrapText(h1);
        });

        // Slide logic for announcement bar
        setTimeout(() => {
            const slides = section.querySelectorAll('.announcement-slide');
            let idx = 0;
            if (slides.length > 0) {
                setInterval(() => {
                    slides[idx].classList.remove('opacity-100', 'translate-y-0');
                    slides[idx].classList.add('opacity-0', '-translate-y-full');
                    
                    idx = (idx + 1) % slides.length;
                    
                    slides[idx].className = "announcement-slide absolute w-full h-full flex justify-center items-center transition-all duration-500 opacity-0 translate-y-full";
                    slides[idx].offsetHeight; // force reflow
                    
                    slides[idx].classList.remove('opacity-0', 'translate-y-full');
                    slides[idx].classList.add('opacity-100', 'translate-y-0');
                }, 4000);
            }
        }, 100);

        // Slide logic for Hero Banner Slider
        setTimeout(() => {
            const slides = section.querySelectorAll('.hero-slide');
            const dots = section.querySelectorAll('.slider-dot');
            let currentIdx = 0;
            let slideInterval;

            const changeSlide = (nextIdx) => {
                if (nextIdx === currentIdx) return;

                // Deactivate current slide
                slides[currentIdx].classList.remove('active', 'opacity-100');
                slides[currentIdx].classList.add('opacity-0', 'pointer-events-none');
                dots[currentIdx].classList.replace('bg-white', 'bg-transparent');

                // Activate next slide
                currentIdx = nextIdx;
                slides[currentIdx].classList.remove('opacity-0', 'pointer-events-none');
                slides[currentIdx].classList.add('active', 'opacity-100');
                dots[currentIdx].classList.replace('bg-transparent', 'bg-white');
            };

            const startAutoPlay = () => {
                slideInterval = setInterval(() => {
                    const nextIdx = (currentIdx + 1) % slides.length;
                    changeSlide(nextIdx);
                }, 6000); // 6 seconds slide interval
            };

            const resetAutoPlay = () => {
                clearInterval(slideInterval);
                startAutoPlay();
            };

            // Bind click events to dots
            dots.forEach((dot, dotIdx) => {
                dot.addEventListener('click', () => {
                    changeSlide(dotIdx);
                    resetAutoPlay();
                });
            });

            // Bind click events to arrows
            const prevBtn = section.querySelector('#heroPrevBtn');
            const nextBtn = section.querySelector('#heroNextBtn');
            if (prevBtn && nextBtn) {
                prevBtn.addEventListener('click', () => {
                    const prevIdx = (currentIdx - 1 + slides.length) % slides.length;
                    changeSlide(prevIdx);
                    resetAutoPlay();
                });
                nextBtn.addEventListener('click', () => {
                    const nextIdx = (currentIdx + 1) % slides.length;
                    changeSlide(nextIdx);
                    resetAutoPlay();
                });
            }

            // Start autoplay initially
            startAutoPlay();
        }, 100);

        return section;
    }
}
