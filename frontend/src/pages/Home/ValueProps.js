/**
 * Section: Value Propositions
 */
export default class ValueProps {
    static render() {
        const section = document.createElement('section');
        section.id = "valuePropsSection";
        section.className = "py-16 bg-white dark:bg-bgDark border-b border-accent/50 dark:border-accent/40 overflow-hidden transition-colors duration-500";

        section.innerHTML = `
            <div class="max-w-[1400px] mx-auto px-6 font-sans">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
                    <!-- Prop 1: Shipping -->
                    <div class="prop-card flex flex-col items-center text-center transition-all duration-500 hover:-translate-y-1 opacity-0 translate-y-6">
                        <div class="text-accent text-xl mb-4">
                            <i class="fa-solid fa-truck"></i>
                        </div>
                        <h4 class="text-xs font-bold text-primary dark:text-white mb-1.5 tracking-wider uppercase">Giao Hàng Miễn Phí</h4>
                        <p class="text-[11px] text-gray-400 dark:text-gray-500">Cho đơn hàng từ 1.000.000đ</p>
                    </div>

                    <!-- Prop 2: Returns -->
                    <div class="prop-card flex flex-col items-center text-center transition-all duration-500 hover:-translate-y-1 opacity-0 translate-y-6">
                        <div class="text-accent text-xl mb-4">
                            <i class="fa-solid fa-arrow-rotate-left"></i>
                        </div>
                        <h4 class="text-xs font-bold text-primary dark:text-white mb-1.5 tracking-wider uppercase">Dễ Dàng Đổi Trả</h4>
                        <p class="text-[11px] text-gray-400 dark:text-gray-500">Chính sách đổi trả trong 60 ngày</p>
                    </div>

                    <!-- Prop 3: Warranty -->
                    <div class="prop-card flex flex-col items-center text-center transition-all duration-500 hover:-translate-y-1 opacity-0 translate-y-6">
                        <div class="text-accent text-xl mb-4">
                            <i class="fa-solid fa-shield-halved"></i>
                        </div>
                        <h4 class="text-xs font-bold text-primary dark:text-white mb-1.5 tracking-wider uppercase">Bảo Hành 2 Năm</h4>
                        <p class="text-[11px] text-gray-400 dark:text-gray-500">Cho mọi dòng đồng hồ</p>
                    </div>

                    <!-- Prop 4: Quality -->
                    <div class="prop-card flex flex-col items-center text-center transition-all duration-500 hover:-translate-y-1 opacity-0 translate-y-6">
                        <div class="text-accent text-xl mb-4">
                            <i class="fa-solid fa-ribbon"></i>
                        </div>
                        <h4 class="text-xs font-bold text-primary dark:text-white mb-1.5 tracking-wider uppercase">Chất Lượng Cao Cấp</h4>
                        <p class="text-[11px] text-gray-400 dark:text-gray-500">Chế tác để trường tồn</p>
                    </div>
                </div>
            </div>
        `;

        // Inject dynamic keyframe styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes bounceIcon {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
            }
            .animate-bounce-icon {
                animation: bounceIcon 0.6s ease-out;
            }
            .prop-card {
                cursor: pointer;
            }
            .prop-card i {
                display: inline-block;
                transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), color 0.3s ease;
            }
            .prop-card:hover i {
                transform: rotate(360deg) scale(1.1);
                color: #c5a059;
            }
            .prop-card h4 {
                transition: color 0.3s ease;
            }
            .prop-card:hover h4 {
                color: #c5a059 !important;
            }
        `;
        section.appendChild(style);

        // Scroll reveal trigger
        setTimeout(() => {
            const cards = section.querySelectorAll('.prop-card');
            cards.forEach((card, idx) => {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            setTimeout(() => {
                                card.classList.remove('opacity-0', 'translate-y-6');
                                card.classList.add('opacity-100', 'translate-y-0');
                                const icon = card.querySelector('i');
                                if (icon) {
                                    icon.classList.add('animate-bounce-icon');
                                    // Remove bounce class after animation ends
                                    setTimeout(() => icon.classList.remove('animate-bounce-icon'), 600);
                                }
                            }, idx * 150); // 0.15s stagger delay
                            observer.unobserve(card);
                        }
                    });
                }, { threshold: 0.1 });
                observer.observe(card);
            });
        }, 100);

        return section;
    }
}
