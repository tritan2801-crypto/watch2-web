/**
 * UI Component: Dialog / Modal (Shadcn-style)
 */
export function createDialog({ content, onClose, className = 'w-[90%] max-w-lg', closeBtnClassName = '' }) {
    // 1. Create overlay backdrop
    const overlay = document.createElement('div');
    overlay.className = "fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex justify-center items-center opacity-0 pointer-events-none transition-all duration-300";
    
    // 2. Create modal container
    const container = document.createElement('div');
    const hasBg = className.includes('bg-');
    container.className = `${hasBg ? '' : 'bg-white'} shadow-2xl relative translate-y-12 transition-all duration-300 max-h-[90vh] overflow-y-auto ${className}`;
    
    // 3. Create close button
    const closeBtn = document.createElement('button');
    closeBtn.className = `absolute top-3 right-3 text-sm w-8 h-8 flex justify-center items-center rounded-full bg-white/90 dark:bg-black/90 shadow-md text-primary dark:text-white hover:text-accent dark:hover:text-accent transition-all duration-300 z-50 outline-none border border-neutral-200/50 dark:border-neutral-800/50 ${closeBtnClassName}`;
    closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    
    container.appendChild(closeBtn);
    
    // 4. Inject content
    if (typeof content === 'string') {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        // Move all children of tempDiv into container
        while (tempDiv.firstChild) {
            container.appendChild(tempDiv.firstChild);
        }
    } else if (content instanceof HTMLElement) {
        container.appendChild(content);
    }
    
    overlay.appendChild(container);
    
    const show = () => {
        document.body.appendChild(overlay);
        // Force reflow for CSS animations
        overlay.offsetHeight;
        overlay.classList.add('opacity-100');
        overlay.classList.remove('pointer-events-none');
        container.classList.remove('translate-y-12');
        container.classList.add('translate-y-0');
        document.body.style.overflow = 'hidden';
    };
    
    const hide = () => {
        overlay.classList.remove('opacity-100');
        overlay.classList.add('pointer-events-none');
        container.classList.remove('translate-y-0');
        container.classList.add('translate-y-12');
        document.body.style.overflow = '';
        
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            if (onClose) onClose();
        }, 300);
    };
    
    closeBtn.addEventListener('click', hide);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) hide();
    });
    
    // Esc key support
    const escListener = (e) => {
        if (e.key === 'Escape') {
            hide();
            window.removeEventListener('keydown', escListener);
        }
    };
    window.addEventListener('keydown', escListener);
    
    return {
        element: overlay,
        show,
        hide
    };
}
