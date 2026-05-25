/**
 * UI Component: Button (Shadcn-style)
 */
export function createButton({ text, onClick, variant = 'primary', className = '', type = 'button' }) {
    const btn = document.createElement('button');
    btn.type = type;
    btn.innerHTML = text; // supports HTML string (e.g. icon + text)
    
    let baseStyles = "px-10 py-4 text-xs font-semibold tracking-widest uppercase transition-all duration-300 outline-none ";
    
    switch (variant) {
        case 'primary':
            baseStyles += "bg-white text-primary border border-white hover:bg-accent hover:text-white hover:border-accent";
            break;
        case 'outline':
            baseStyles += "bg-transparent text-white border border-white hover:bg-white hover:text-primary";
            break;
        case 'dark':
            baseStyles += "bg-primary text-white border border-primary hover:bg-accent hover:text-white hover:border-accent";
            break;
        case 'accent':
            baseStyles += "bg-accent text-white border border-accent hover:bg-accentHover hover:border-accentHover";
            break;
        case 'ghost':
            baseStyles += "bg-transparent border-none p-0 text-current hover:text-accent";
            break;
    }
    
    btn.className = `${baseStyles} ${className}`;
    
    if (onClick) {
        btn.addEventListener('click', onClick);
    }
    
    return btn;
}
