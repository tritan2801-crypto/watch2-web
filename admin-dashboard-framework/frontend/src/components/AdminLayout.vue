<script setup>
import { ref, onMounted } from 'vue';

const isSidebarOpen = ref(false);
const isProfileDropdownOpen = ref(false);
const isDark = ref(false);
const currentTab = ref('dashboard'); // 'dashboard', 'products', 'categories', 'orders', 'promos'

// Emit tab selection event to parent coordinator
const emit = defineEmits(['navigate']);

const selectTab = (tab) => {
  currentTab.value = tab;
  isSidebarOpen.value = false; // Auto close sidebar on mobile
  emit('navigate', tab);
};

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const toggleProfileDropdown = () => {
  isProfileDropdownOpen.value = !isProfileDropdownOpen.value;
};

const toggleTheme = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('mvmt_admin_theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('mvmt_admin_theme', 'light');
  }
};

onMounted(() => {
  const savedTheme = localStorage.getItem('mvmt_admin_theme') || 'dark';
  isDark.value = savedTheme === 'dark';
  if (isDark.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});
</script>

<template>
  <div class="min-h-screen bg-neutral-50 dark:bg-[#121212] text-neutral-900 dark:text-neutral-100 flex font-sans transition-colors duration-300">
    
    <!-- Mobile Sidebar Backdrop -->
    <div 
      v-if="isSidebarOpen" 
      @click="toggleSidebar"
      class="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
    ></div>

    <!-- Sidebar Container -->
    <aside 
      :class="[
        'fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-[#1a1a1a] border-r border-neutral-200 dark:border-neutral-800 flex flex-col justify-between transition-transform duration-300 md:translate-x-0',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <!-- Top Brand Logo -->
      <div>
        <div class="h-20 flex items-center justify-between px-6 border-b border-neutral-200 dark:border-neutral-800">
          <a href="#" class="font-serif text-xl font-bold tracking-[0.2em] text-neutral-900 dark:text-white flex items-center gap-2">
            <span>MVMT</span>
            <span class="text-[8px] font-sans tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 uppercase">ADMIN</span>
          </a>
          <!-- Mobile Close Button -->
          <button @click="toggleSidebar" class="md:hidden text-neutral-400 hover:text-neutral-100 outline-none">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Navigation Links -->
        <nav class="p-4 space-y-1">
          <button 
            @click="selectTab('dashboard')"
            :class="[
              'w-full flex items-center gap-4 px-4 py-3.5 text-[11px] font-bold tracking-[0.15em] uppercase border transition-all duration-200',
              currentTab === 'dashboard' 
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 border-neutral-900 dark:border-white shadow-lg shadow-black/5' 
                : 'bg-transparent border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
            ]"
          >
            <i class="fa-solid fa-chart-line text-sm w-5"></i>
            <span>TỔNG QUAN</span>
          </button>

          <button 
            @click="selectTab('products')"
            :class="[
              'w-full flex items-center gap-4 px-4 py-3.5 text-[11px] font-bold tracking-[0.15em] uppercase border transition-all duration-200',
              currentTab === 'products' 
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 border-neutral-900 dark:border-white shadow-lg shadow-black/5' 
                : 'bg-transparent border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
            ]"
          >
            <i class="fa-solid fa-box text-sm w-5"></i>
            <span>SẢN PHẨM</span>
          </button>

          <button 
            @click="selectTab('categories')"
            :class="[
              'w-full flex items-center gap-4 px-4 py-3.5 text-[11px] font-bold tracking-[0.15em] uppercase border transition-all duration-200',
              currentTab === 'categories' 
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 border-neutral-900 dark:border-white shadow-lg shadow-black/5' 
                : 'bg-transparent border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
            ]"
          >
            <i class="fa-solid fa-folder text-sm w-5"></i>
            <span>DANH MỤC</span>
          </button>

          <button 
            @click="selectTab('orders')"
            :class="[
              'w-full flex items-center gap-4 px-4 py-3.5 text-[11px] font-bold tracking-[0.15em] uppercase border transition-all duration-200',
              currentTab === 'orders' 
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 border-neutral-900 dark:border-white shadow-lg shadow-black/5' 
                : 'bg-transparent border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
            ]"
          >
            <i class="fa-solid fa-receipt text-sm w-5"></i>
            <span>ĐƠN HÀNG</span>
          </button>

          <button 
            @click="selectTab('promos')"
            :class="[
              'w-full flex items-center gap-4 px-4 py-3.5 text-[11px] font-bold tracking-[0.15em] uppercase border transition-all duration-200',
              currentTab === 'promos' 
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 border-neutral-900 dark:border-white shadow-lg shadow-black/5' 
                : 'bg-transparent border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
            ]"
          >
            <i class="fa-solid fa-tags text-sm w-5"></i>
            <span>MÃ GIẢM GIÁ</span>
          </button>
        </nav>
      </div>

      <!-- Footer Info / Logged-in User Profile Summary -->
      <div class="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#1f1f1f]">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center font-bold text-xs">
            AD
          </div>
          <div class="flex-grow min-w-0">
            <div class="text-[10px] font-bold tracking-wider uppercase truncate">MVMT Admin</div>
            <div class="text-[9px] text-neutral-400 truncate">admin@mvmt.com</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Workspace Content Container -->
    <div class="flex-1 flex flex-col md:pl-64 min-w-0">
      
      <!-- Top Sticky Navigation Bar -->
      <header class="h-20 sticky top-0 bg-white/70 dark:bg-[#1a1a1a]/70 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 z-30 flex items-center justify-between px-6 transition-all duration-300">
        
        <!-- Left: Burger Toggle and Breadcrumb -->
        <div class="flex items-center gap-4">
          <button 
            @click="toggleSidebar" 
            class="md:hidden text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white text-xl outline-none"
            aria-label="Toggle Sidebar"
          >
            <i class="fa-solid fa-bars"></i>
          </button>
          
          <div class="hidden sm:flex items-center gap-2 text-[10px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">
            <span>ADMIN PANEL</span>
            <span>/</span>
            <span class="text-neutral-900 dark:text-white">{{ currentTab }}</span>
          </div>
        </div>

        <!-- Right: Actions Controls (Theme toggle, notifications, profile dropdown) -->
        <div class="flex items-center gap-4">
          
          <!-- Theme Mode Switcher -->
          <button 
            @click="toggleTheme"
            class="w-10 h-10 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-900 dark:hover:border-neutral-400 transition-colors duration-200 outline-none"
            aria-label="Toggle Theme Mode"
          >
            <i v-if="isDark" class="fa-regular fa-sun"></i>
            <i v-else class="fa-regular fa-moon"></i>
          </button>

          <!-- Notifications Button Mockup -->
          <button 
            class="w-10 h-10 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200 relative outline-none"
            aria-label="Notifications"
          >
            <i class="fa-regular fa-bell"></i>
            <span class="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          </button>

          <div class="border-l border-neutral-200 dark:border-neutral-800 h-6"></div>

          <!-- User Settings Dropdown -->
          <div class="relative">
            <button 
              @click="toggleProfileDropdown"
              class="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200 outline-none"
            >
              <i class="fa-regular fa-circle-user text-xl text-amber-500"></i>
              <span class="text-xs font-semibold uppercase tracking-wider hidden md:inline">Profile</span>
              <i class="fa-solid fa-chevron-down text-[8px] transition-transform duration-200" :class="{ 'rotate-180': isProfileDropdownOpen }"></i>
            </button>

            <!-- Dropdown Options -->
            <div 
              v-if="isProfileDropdownOpen"
              @click="isProfileDropdownOpen = false"
              class="absolute right-0 mt-3.5 w-48 bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 shadow-xl py-2 z-55 animate-fade-in"
            >
              <a href="#" class="block px-4 py-2.5 text-[10px] font-bold tracking-wider hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white uppercase font-sans">Settings</a>
              <a href="#" class="block px-4 py-2.5 text-[10px] font-bold tracking-wider hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white uppercase font-sans">Profile Log</a>
              <div class="border-t border-neutral-200 dark:border-neutral-800 my-1"></div>
              <a href="#" class="block px-4 py-2.5 text-[10px] font-bold tracking-wider hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 uppercase font-sans">Sign Out</a>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Workspace Scrollable Area -->
      <main class="flex-grow p-6 md:p-8 overflow-y-auto">
        <slot />
      </main>

    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.15s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
