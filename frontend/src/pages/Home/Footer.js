/**
 * Section: Footer
 */
export default class Footer {
    static render() {
        // Inject footer button ripple styling
        if (!document.getElementById('footerRippleStyles')) {
            const style = document.createElement('style');
            style.id = 'footerRippleStyles';
            style.textContent = `
                @keyframes ripple {
                    to {
                        width: 300px;
                        height: 300px;
                        opacity: 0;
                    }
                }
                .animate-ripple {
                    animation: ripple 0.6s linear;
                }
            `;
            document.head.appendChild(style);
        }

        const footer = document.createElement('footer');
        footer.id = "mainFooter";
        footer.className = "bg-bgDark dark:bg-black text-white pt-20 pb-10 border-t border-accent/50 dark:border-accent/40 opacity-0 translate-y-8 transition-all duration-1000";

        footer.innerHTML = `
            <div class="max-w-[1400px] mx-auto px-6">
                <!-- Horizontal Newsletter Banner -->
                <div class="border-b border-accent/30 pb-12 mb-16 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <!-- Left Column: Heading, Description and Micro-stats -->
                    <div class="flex-1">
                        <h3 class="font-serif text-2xl md:text-3xl font-normal text-white mb-3 tracking-wide">Nhận Ưu Đãi Tốt Nhất</h3>
                        <p class="text-xs text-white/50 max-w-lg leading-relaxed mb-4">
                            Đăng ký email để nhận ngay mã giảm giá 10% cho đơn hàng đầu tiên của bạn và cập nhật những bộ sưu tập mới nhất.
                        </p>
                        <!-- Newsletter Micro-stats -->
                        <div class="flex gap-8 mt-4">
                            <div class="flex items-center gap-2">
                                <span class="font-serif text-accent text-base md:text-lg font-bold"><span class="newsletter-counter" data-target="10">0</span>%</span>
                                <span class="text-[9px] text-white/40 uppercase tracking-widest">GIẢM GIÁ</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="font-serif text-accent text-base md:text-lg font-bold"><span class="newsletter-counter" data-target="2">0</span>K+</span>
                                <span class="text-[9px] text-white/40 uppercase tracking-widest">REVIEW 5★</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="font-serif text-accent text-base md:text-lg font-bold"><span class="newsletter-counter" data-target="48">0</span>h</span>
                                <span class="text-[9px] text-white/40 uppercase tracking-widest">PHẢN HỒI</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Right Column: Subscription Inline Form with Float Label -->
                    <div class="w-full lg:w-auto flex-grow max-w-xl">
                        <form id="newsletterForm" class="flex w-full relative">
                            <div class="relative flex-grow border-y border-l border-accent/30 focus-within:border-accent focus-within:shadow-[0_0_15px_rgba(197,160,89,0.3)] transition-all">
                                <input type="email" id="newsletterEmail" placeholder=" " required class="w-full bg-bgDarkSoft px-5 pt-6 pb-2 text-xs tracking-wider text-white placeholder-transparent focus:outline-none border-none peer">
                                <label for="newsletterEmail" class="absolute left-5 top-4 text-[10px] text-white/40 tracking-wider uppercase pointer-events-none transition-all duration-300 peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-placeholder-shown:text-white/40 peer-focus:top-2 peer-focus:text-[9px] peer-focus:text-accent peer-focus:font-bold peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[9px] peer-[:not(:placeholder-shown)]:text-accent">Địa chỉ email</label>
                            </div>
                            <button type="submit" class="newsletter-btn relative overflow-hidden bg-gradient-to-r from-accent via-[#e0c068] to-accent bg-[length:200%_100%] hover:bg-[100%_0] text-white text-[10px] font-bold tracking-widest uppercase px-10 transition-all duration-500 shrink-0 outline-none border border-accent">ĐĂNG KÝ</button>
                        </form>
                    </div>
                </div>

                <!-- Bottom Footer Sections -->
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-16">
                    <!-- Shop column -->
                    <div>
                        <h4 class="text-xs font-bold tracking-widest uppercase mb-6 text-white">CỬA HÀNG</h4>
                        <ul class="flex flex-col gap-4 text-xs text-white/50">
                            <li><a href="#/products?category=mens" class="hover:translate-x-1 hover:text-accent transition-all duration-300 transform inline-block">Đồng Hồ Nam</a></li>
                            <li><a href="#/products?category=womens" class="hover:translate-x-1 hover:text-accent transition-all duration-300 transform inline-block">Đồng Hồ Nữ</a></li>
                            <li><a href="#/" class="hover:translate-x-1 hover:text-accent transition-all duration-300 transform inline-block">Sản Phẩm Mới</a></li>
                            <li><a href="#/" class="hover:translate-x-1 hover:text-accent transition-all duration-300 transform inline-block">Bán Chạy Nhất</a></li>
                            <li><a href="#/products?category=all&sort=price_asc" class="hover:translate-x-1 hover:text-accent transition-all duration-300 transform inline-block">Khuyến Mãi</a></li>
                        </ul>
                    </div>

                    <!-- Customer Service column -->
                    <div>
                        <h4 class="text-xs font-bold tracking-widest uppercase mb-6 text-white">DỊCH VỤ KHÁCH HÀNG</h4>
                        <ul class="flex flex-col gap-4 text-xs text-white/50">
                            <li><a href="#" class="hover:translate-x-1 hover:text-accent transition-all duration-300 transform inline-block">Giao Hàng & Đổi Trả</a></li>
                            <li><a href="#" class="hover:translate-x-1 hover:text-accent transition-all duration-300 transform inline-block">Bảo Hành 2 Năm</a></li>
                            <li><a href="#" class="hover:translate-x-1 hover:text-accent transition-all duration-300 transform inline-block">FAQs (Câu hỏi thường gặp)</a></li>
                            <li><a href="#" class="hover:translate-x-1 hover:text-accent transition-all duration-300 transform inline-block">Liên Hệ</a></li>
                        </ul>
                    </div>

                    <!-- About column -->
                    <div>
                        <h4 class="text-xs font-bold tracking-widest uppercase mb-6 text-white">GIỚI THIỆU</h4>
                        <ul class="flex flex-col gap-4 text-xs text-white/50">
                            <li><a href="#brandStorySection" class="hover:translate-x-1 hover:text-accent transition-all duration-300 transform inline-block">Câu Chuyện Thương Hiệu</a></li>
                            <li><a href="#" class="hover:translate-x-1 hover:text-accent transition-all duration-300 transform inline-block">Bài Viết</a></li>
                            <li><a href="#" class="hover:translate-x-1 hover:text-accent transition-all duration-300 transform inline-block">Báo Chí</a></li>
                            <li><a href="#" class="hover:translate-x-1 hover:text-accent transition-all duration-300 transform inline-block">Tuyển Dụng</a></li>
                        </ul>
                    </div>

                    <!-- Follow us column -->
                    <div class="flex flex-col gap-6">
                        <h4 class="text-xs font-bold tracking-widest uppercase text-white">THEO DÕI CHÚNG TÔI</h4>
                        <div class="flex gap-4 text-white/70">
                            <a href="#" class="hover:rotate-[360deg] hover:scale-120 hover:text-accent duration-500 transform transition-all text-base"><i class="fa-brands fa-instagram"></i></a>
                            <a href="#" class="hover:rotate-[360deg] hover:scale-120 hover:text-accent duration-500 transform transition-all text-base"><i class="fa-brands fa-facebook-f"></i></a>
                            <a href="#" class="hover:rotate-[360deg] hover:scale-120 hover:text-accent duration-500 transform transition-all text-base"><i class="fa-brands fa-twitter"></i></a>
                            <a href="#" class="hover:rotate-[360deg] hover:scale-120 hover:text-accent duration-500 transform transition-all text-base"><i class="fa-brands fa-pinterest-p"></i></a>
                        </div>
                        <span class="text-xs text-white/40 tracking-wider font-sans">@donghoatuan</span>
                    </div>
                </div>

                <!-- Bottom Copyright & Legals -->
                <div class="border-t border-accent/30 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-white/40 tracking-wider">
                    <div>
                        &copy; ${new Date().getFullYear()} Đồng hồ A Tuấn. BẢN QUYỀN ĐÃ ĐƯỢC BẢO HỘ.
                    </div>
                    <div class="flex gap-6">
                        <a href="#" class="hover:text-accent hover:translate-x-1 transition-all duration-300 transform">CHÍNH SÁCH BẢO MẬT</a>
                        <a href="#" class="hover:text-accent hover:translate-x-1 transition-all duration-300 transform">ĐIỀU KHOẢN DỊCH VỤ</a>
                    </div>
                </div>
            </div>
        `;

        // Handle newsletter submission event
        const form = footer.querySelector('#newsletterForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = form.querySelector('input');
                if (input && input.value) {
                    // Trigger dynamic success alert or event
                    const event = new CustomEvent('newsletter-signup', {
                        detail: { email: input.value }
                    });
                    document.dispatchEvent(event);
                    input.value = '';
                }
            });
        }

        // Ripple Effect for Sign Up button
        const btn = footer.querySelector('.newsletter-btn');
        if (btn) {
            btn.addEventListener('click', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const ripple = document.createElement('span');
                ripple.className = "absolute bg-white/30 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-ripple";
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                ripple.style.width = '0px';
                ripple.style.height = '0px';
                
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        }

        // Scroll reveal logic
        setTimeout(() => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        footer.classList.remove('opacity-0', 'translate-y-8');
                        
                        // Trigger stats counter animations on entrance
                        const counters = footer.querySelectorAll('.newsletter-counter');
                        counters.forEach(counter => {
                            const target = parseInt(counter.dataset.target);
                            const duration = 2000;
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

                        observer.unobserve(footer);
                    }
                });
            }, { threshold: 0.1 });
            observer.observe(footer);
        }, 100);

        return footer;
    }
}
