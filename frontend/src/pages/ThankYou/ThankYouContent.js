/**
 * Section Component: ThankYouContent
 */
export default class ThankYouContent {
    static render() {
        const section = document.createElement('section');
        section.className = "max-w-4xl mx-auto px-6 py-20 text-center";
        section.innerHTML = `
            <!-- Minimalist Success Checkmark Icon -->
            <div class="flex justify-center mb-8">
                <div class="w-24 h-24 border border-accent rounded-full flex items-center justify-center shadow-lg shadow-accent/5 dark:shadow-accent/5">
                    <i class="fa-solid fa-check text-4xl text-accent"></i>
                </div>
            </div>
            
            <h1 class="font-serif text-3xl md:text-4xl font-normal text-primary dark:text-white mb-4 tracking-wide uppercase">
                Đặt hàng thành công!
            </h1>
            
            <h2 class="text-xs md:text-sm font-semibold text-accent tracking-widest uppercase mb-8">
                Cảm ơn quý khách đã tin dùng sản phẩm của Đồng hồ A Tuấn
            </h2>

            <div class="border-t border-accent/30 dark:border-accent/20 my-8 max-w-md mx-auto"></div>
            
            <p class="text-xs md:text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto mb-10 leading-relaxed font-sans">
                Đơn hàng của quý khách đã được tiếp nhận thành công. Chúng tôi đang xử lý thông tin vận chuyển và sẽ sớm liên hệ xác nhận cuộc gọi đi đến số điện thoại của quý khách.
            </p>
            
            <div class="flex flex-col sm:flex-row justify-center items-center gap-4">
                <a href="#/products" class="w-full sm:w-auto bg-primary dark:bg-white text-white dark:text-primary text-[10px] font-bold tracking-widest uppercase py-4 px-10 hover:bg-accent dark:hover:bg-accent hover:text-white dark:hover:text-white transition-all duration-300 outline-none">
                    TIẾP TỤC MUA SẮM
                </a>
                <a href="#/profile" class="w-full sm:w-auto border border-gray-200 dark:border-neutral-800 text-primary dark:text-white text-[10px] font-bold tracking-widest uppercase py-4 px-10 hover:bg-primary dark:hover:bg-white hover:text-white dark:hover:text-primary transition-all duration-300 outline-none font-sans">
                    LỊCH SỬ ĐƠN HÀNG
                </a>
            </div>
        `;
        return section;
    }
}
