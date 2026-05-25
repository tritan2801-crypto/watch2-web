/**
 * Section: Brand Story
 */
export default class BrandStory {
    static render() {
        const section = document.createElement('section');
        section.id = "brandStorySection";
        section.className = "py-24 bg-primary dark:bg-bgDarkSoft border-y border-accent/50 dark:border-accent/40 overflow-hidden text-white transition-colors duration-500";

        section.innerHTML = `
            <div class="max-w-[1400px] mx-auto px-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <!-- Image Column with Zoom Hover Effect & Parallax Wrapper -->
                    <div class="relative overflow-visible aspect-[4/3] md:aspect-square bg-bgDarkSoft story-image-container opacity-0 translate-x-[-50px] transition-all duration-1000">
                        <div class="w-full h-full story-image-parallax overflow-hidden">
                            <img src="images/story_flatlay.png" alt="Không gian thiết kế Đồng hồ A Tuấn" class="w-full h-[115%] -mt-[7.5%] object-cover filter brightness-90 transition-transform duration-700 hover:scale-105">
                        </div>
                        
                        <!-- Floating Badge "2010 THÀNH LẬP" -->
                        <div class="absolute -bottom-6 -right-6 bg-accent text-white p-5 rounded-none shadow-xl flex flex-col items-center justify-center border border-white/20 float-bob z-20">
                            <span class="text-[9px] font-bold tracking-[0.2em] uppercase text-white/80">THÀNH LẬP</span>
                            <span class="font-serif text-2xl font-normal text-white">2010</span>
                        </div>
                    </div>
                    
                    <!-- Text Content Column -->
                    <div class="flex flex-col justify-center story-text-container opacity-0 translate-x-[50px] transition-all duration-1000">
                        <span class="text-[10px] text-accent font-bold tracking-[0.3em] uppercase mb-4">THIẾT KẾ HOÀN HẢO</span>
                        <h2 class="font-serif text-3xl md:text-5xl font-normal text-white mb-6 leading-tight">
                            <span class="reveal-container"><span class="reveal-text">Phong Cách</span></span>
                            <span class="reveal-container"><span class="reveal-text text-accent">Không Cần Phải Đắt.</span></span>
                        </h2>
                        <p class="text-white/70 text-sm md:text-base leading-relaxed mb-6">
                            Đồng hồ A Tuấn được xây dựng trên niềm tin rằng phong cách thời thượng không đi kèm với cái giá đắt đỏ. Mục tiêu của chúng tôi là thay đổi tư duy thời trang của bạn bằng những sản phẩm tối giản cao cấp với mức giá hợp lý nhất.
                        </p>
                        <p class="text-white/70 text-sm md:text-base leading-relaxed mb-8">
                            Lấy cảm hứng từ những người dám nghĩ dám làm, các nhà cải cách và những người mơ mộng, các thiết kế đồng hồ của chúng tôi thể hiện tinh thần phiêu lưu, sáng tạo và cá tính riêng độc đáo.
                        </p>

                        <!-- Counter Statistics Grid -->
                        <div class="grid grid-cols-3 gap-6 mb-10 border-t border-white/10 pt-8">
                            <div>
                                <div class="font-serif text-3xl md:text-4xl text-accent font-normal mb-1"><span class="counter-num" data-target="500">0</span>+</div>
                                <div class="text-[9px] text-white/50 tracking-widest uppercase font-semibold">Điểm Phân Phối</div>
                            </div>
                            <div>
                                <div class="font-serif text-3xl md:text-4xl text-accent font-normal mb-1"><span class="counter-num" data-target="15">0</span>K+</div>
                                <div class="text-[9px] text-white/50 tracking-widest uppercase font-semibold">Khách Hàng</div>
                            </div>
                            <div>
                                <div class="font-serif text-3xl md:text-4xl text-accent font-normal mb-1"><span class="counter-num" data-target="15">0</span>+</div>
                                <div class="text-[9px] text-white/50 tracking-widest uppercase font-semibold">Năm Hoạt Động</div>
                            </div>
                        </div>

                        <div>
                            <a href="#/products" class="inline-block px-10 py-4 text-xs font-semibold tracking-widest uppercase bg-transparent text-white border border-white hover:bg-white hover:text-primary transition-all duration-300">MUA NGAY BỘ SƯU TẬP</a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Scroll reveal & Parallax trigger
        setTimeout(() => {
            const imgCol = section.querySelector('.story-image-container');
            const textCol = section.querySelector('.story-text-container');
            const parallaxWrapper = section.querySelector('.story-image-parallax');

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        imgCol.classList.remove('opacity-0', 'translate-x-[-50px]');
                        imgCol.classList.add('opacity-100', 'translate-x-0');

                        textCol.classList.remove('opacity-0', 'translate-x-[50px]');
                        textCol.classList.add('opacity-100', 'translate-x-0');

                        // Trigger text reveal lines
                        const reveals = section.querySelectorAll('.reveal-container');
                        reveals.forEach((r, idx) => {
                            setTimeout(() => {
                                r.classList.add('revealed');
                            }, idx * 250);
                        });

                        // Trigger stats counter count-up
                        const counters = section.querySelectorAll('.counter-num');
                        counters.forEach(counter => {
                            const target = parseInt(counter.dataset.target);
                            const duration = 2000; // 2 seconds
                            let start = null;

                            const animate = (timestamp) => {
                                if (!start) start = timestamp;
                                const progress = timestamp - start;
                                const val = Math.min(Math.floor((progress / duration) * target), target);
                                counter.textContent = val;
                                if (progress < duration) {
                                    requestAnimationFrame(animate);
                                } else {
                                    counter.textContent = target;
                                }
                            };

                            requestAnimationFrame(animate);
                        });
                        
                        observer.unobserve(section);
                    }
                });
            }, { threshold: 0.15 });

            observer.observe(section);

            // Parallax scroll handler
            if (parallaxWrapper) {
                const handleScroll = () => {
                    const rect = section.getBoundingClientRect();
                    const viewHeight = window.innerHeight;
                    if (rect.top < viewHeight && rect.bottom > 0) {
                        const scrollPct = (viewHeight - rect.top) / (viewHeight + rect.height);
                        const translateY = (scrollPct - 0.5) * 40; // translate between -20px and 20px
                        parallaxWrapper.style.transform = `translateY(${translateY}px)`;
                    }
                };

                window.addEventListener('scroll', handleScroll, { passive: true });
                handleScroll();

                // Cleanup listener when element is destroyed/removed
                const checkExist = setInterval(() => {
                    if (!document.body.contains(section)) {
                        window.removeEventListener('scroll', handleScroll);
                        clearInterval(checkExist);
                    }
                }, 2000);
            }
        }, 100);

        return section;
    }
}
