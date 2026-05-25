<script setup>
import { ref, computed } from 'vue';

const dateRange = ref('7days'); // 'today', '7days', 'month', 'custom'
const startDate = ref('2026-05-18');
const endDate = ref('2026-05-24');

// Mock data sets matching different date filters
const mockDataSets = {
  today: {
    totalRevenue: 2450.00,
    totalOrders: 18,
    avgOrderValue: 136.11,
    conversionRate: 2.4,
    revenuePoints: [120, 240, 480, 720, 950, 1400, 1850, 2450],
    revenueLabels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
    topProducts: [
      { rank: 1, title: "Chrono Gold - Matte Black", sku: "MC-01-GOLD", category: "Mens Watches", sales: 8, revenue: 1120.00 },
      { rank: 2, title: "Nova Stella - Rose Blush", sku: "WN-03-STELLA", category: "Womens Watches", sales: 6, revenue: 840.00 },
      { rank: 3, title: "Voyager Blue - Tan Strap", sku: "MV-02-VOY", category: "Mens Watches", sales: 4, revenue: 490.00 },
    ]
  },
  '7days': {
    totalRevenue: 18450.00,
    totalOrders: 132,
    avgOrderValue: 139.77,
    conversionRate: 2.8,
    revenuePoints: [1800, 4200, 6800, 9100, 12200, 15100, 18450],
    revenueLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    topProducts: [
      { rank: 1, title: "Chrono Gold - Matte Black", sku: "MC-01-GOLD", category: "Mens Watches", sales: 48, revenue: 6720.00 },
      { rank: 2, title: "Nova Stella - Rose Blush", sku: "WN-03-STELLA", category: "Womens Watches", sales: 42, revenue: 5880.00 },
      { rank: 3, title: "Voyager Blue - Tan Strap", sku: "MV-02-VOY", category: "Mens Watches", sales: 25, revenue: 3062.50 },
      { rank: 4, title: "Legacy Slim - Mesh Band", sku: "ML-04-LEGCY", category: "Mens Watches", sales: 17, revenue: 2787.50 },
    ]
  },
  month: {
    totalRevenue: 78900.00,
    totalOrders: 568,
    avgOrderValue: 138.90,
    conversionRate: 3.1,
    revenuePoints: [15000, 31000, 48000, 62000, 78900],
    revenueLabels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
    topProducts: [
      { rank: 1, title: "Chrono Gold - Matte Black", sku: "MC-01-GOLD", category: "Mens Watches", sales: 210, revenue: 29400.00 },
      { rank: 2, title: "Nova Stella - Rose Blush", sku: "WN-03-STELLA", category: "Womens Watches", sales: 185, revenue: 25900.00 },
      { rank: 3, title: "Voyager Blue - Tan Strap", sku: "MV-02-VOY", category: "Mens Watches", sales: 112, revenue: 13720.00 },
      { rank: 4, title: "Legacy Slim - Mesh Band", sku: "ML-04-LEGCY", category: "Mens Watches", sales: 61, revenue: 9880.00 },
    ]
  }
};

const activeData = computed(() => {
  if (dateRange.value === 'custom') {
    // Custom returns 7days layout for mock consistency
    return mockDataSets['7days'];
  }
  return mockDataSets[dateRange.value] || mockDataSets['7days'];
});

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
};

// SVG Chart Path Calculator
const svgPath = computed(() => {
  const points = activeData.value.revenuePoints;
  const max = Math.max(...points);
  const width = 800;
  const height = 240;
  const padding = 30;
  
  const stepX = (width - padding * 2) / (points.length - 1);
  const scaleY = (height - padding * 2) / max;
  
  return points.map((p, index) => {
    const x = padding + index * stepX;
    const y = height - padding - (p * scaleY);
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
});

const svgPointsCoords = computed(() => {
  const points = activeData.value.revenuePoints;
  const max = Math.max(...points);
  const width = 800;
  const height = 240;
  const padding = 30;
  
  const stepX = (width - padding * 2) / (points.length - 1);
  const scaleY = (height - padding * 2) / max;
  
  return points.map((p, index) => {
    const x = padding + index * stepX;
    const y = height - padding - (p * scaleY);
    return { x, y, value: p };
  });
});
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    
    <!-- Top Filter Row -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
      <div>
        <h1 class="font-serif text-2xl font-normal text-neutral-900 dark:text-white uppercase tracking-wider">TỔNG QUAN HỆ THỐNG</h1>
        <p class="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-1">Phân tích hiệu suất & thống kê doanh thu</p>
      </div>

      <!-- Quick filters list -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 p-1 flex">
          <button 
            @click="dateRange = 'today'"
            :class="[
              'px-3 py-1.5 text-[9px] font-bold tracking-widest uppercase transition-colors',
              dateRange === 'today' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
            ]"
          >
            Hôm nay
          </button>
          <button 
            @click="dateRange = '7days'"
            :class="[
              'px-3 py-1.5 text-[9px] font-bold tracking-widest uppercase transition-colors',
              dateRange === '7days' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
            ]"
          >
            7 ngày qua
          </button>
          <button 
            @click="dateRange = 'month'"
            :class="[
              'px-3 py-1.5 text-[9px] font-bold tracking-widest uppercase transition-colors',
              dateRange === 'month' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
            ]"
          >
            Tháng này
          </button>
          <button 
            @click="dateRange = 'custom'"
            :class="[
              'px-3 py-1.5 text-[9px] font-bold tracking-widest uppercase transition-colors',
              dateRange === 'custom' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
            ]"
          >
            Tùy chỉnh
          </button>
        </div>

        <!-- Custom Date Range picker inputs (visible when dateRange === 'custom') -->
        <div v-if="dateRange === 'custom'" class="flex items-center gap-2 animate-fade-in">
          <input 
            type="date" 
            v-model="startDate"
            class="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 text-[10px] font-semibold p-1.5 uppercase text-neutral-600 dark:text-neutral-300 outline-none focus:border-amber-500"
          />
          <span class="text-xs text-neutral-400">to</span>
          <input 
            type="date" 
            v-model="endDate"
            class="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 text-[10px] font-semibold p-1.5 uppercase text-neutral-600 dark:text-neutral-300 outline-none focus:border-amber-500"
          />
        </div>
      </div>
    </div>

    <!-- Summary Stats Matrix Grid (Aesthetics: luxury gold glow, sharp card edges) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      
      <!-- Card: Total Revenue -->
      <div class="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 p-6 relative overflow-hidden transition-all duration-300 hover:border-amber-500/50">
        <div class="flex justify-between items-start">
          <span class="text-[9px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">TỔNG DOANH THU</span>
          <span class="text-[9px] text-green-500 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 font-bold uppercase">+12%</span>
        </div>
        <div class="mt-4 font-serif text-3xl font-normal text-neutral-900 dark:text-white">{{ formatCurrency(activeData.totalRevenue) }}</div>
        <div class="mt-2 text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Từ giao dịch bán lẻ trực tuyến</div>
        <!-- Accent Gold Bottom Stripe -->
        <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500/40 via-amber-500 to-transparent"></div>
      </div>

      <!-- Card: Total Orders -->
      <div class="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 p-6 relative overflow-hidden transition-all duration-300 hover:border-amber-500/50">
        <div class="flex justify-between items-start">
          <span class="text-[9px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">TỔNG ĐƠN HÀNG</span>
          <span class="text-[9px] text-green-500 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 font-bold uppercase">+8.2%</span>
        </div>
        <div class="mt-4 font-serif text-3xl font-normal text-neutral-900 dark:text-white">{{ activeData.totalOrders }}</div>
        <div class="mt-2 text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Đơn hàng được chốt thành công</div>
        <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500/40 via-amber-500 to-transparent"></div>
      </div>

      <!-- Card: Average Order Value -->
      <div class="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 p-6 relative overflow-hidden transition-all duration-300 hover:border-amber-500/50">
        <div class="flex justify-between items-start">
          <span class="text-[9px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">GIÁ TRỊ TRUNG BÌNH (AOV)</span>
          <span class="text-[9px] text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 font-bold uppercase">+2.5%</span>
        </div>
        <div class="mt-4 font-serif text-3xl font-normal text-neutral-900 dark:text-white">{{ formatCurrency(activeData.avgOrderValue) }}</div>
        <div class="mt-2 text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Doanh thu trung bình mỗi bill</div>
        <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500/40 via-amber-500 to-transparent"></div>
      </div>

      <!-- Card: Conversion Rate -->
      <div class="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 p-6 relative overflow-hidden transition-all duration-300 hover:border-amber-500/50">
        <div class="flex justify-between items-start">
          <span class="text-[9px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">TỶ LỆ CHUYỂN ĐỔI</span>
          <span class="text-[9px] text-red-500 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 font-bold uppercase">-0.4%</span>
        </div>
        <div class="mt-4 font-serif text-3xl font-normal text-neutral-900 dark:text-white">{{ activeData.conversionRate }}%</div>
        <div class="mt-2 text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Từ tổng lượng truy cập trang web</div>
        <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500/40 via-amber-500 to-transparent"></div>
      </div>

    </div>

    <!-- Chart Analytics Block: Revenue Trend -->
    <div class="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 p-6">
      <div class="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4 mb-6">
        <div>
          <h2 class="text-xs font-bold tracking-widest text-neutral-900 dark:text-white uppercase">BIỂU ĐỒ XU HƯỚNG DOANH THU</h2>
          <p class="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mt-0.5">Biểu diễn lũy kế số tiền thu được</p>
        </div>
        <span class="text-[10px] text-amber-500 font-sans tracking-widest uppercase font-bold">Chỉ số: USD</span>
      </div>

      <!-- Pure SVG Line Chart (Light/Dark Lux themed, scalable) -->
      <div class="relative w-full aspect-[8/3] min-h-[220px]">
        <svg viewBox="0 0 800 240" class="w-full h-full overflow-visible">
          <!-- Horizontal Grid Lines -->
          <line x1="30" y1="30" x2="770" y2="30" class="stroke-neutral-100 dark:stroke-neutral-800/80" stroke-width="1" stroke-dasharray="4" />
          <line x1="30" y1="100" x2="770" y2="100" class="stroke-neutral-100 dark:stroke-neutral-800/80" stroke-width="1" stroke-dasharray="4" />
          <line x1="30" y1="170" x2="770" y2="170" class="stroke-neutral-100 dark:stroke-neutral-800/80" stroke-width="1" stroke-dasharray="4" />
          
          <!-- Bottom Axis Line -->
          <line x1="30" y1="210" x2="770" y2="210" class="stroke-neutral-300 dark:stroke-neutral-800" stroke-width="1" />

          <!-- SVG Gradient Area Under Line Chart -->
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#c5a059" stop-opacity="0.25"/>
              <stop offset="100%" stop-color="#c5a059" stop-opacity="0.00"/>
            </linearGradient>
          </defs>
          
          <!-- Area Draw -->
          <path 
            :d="`${svgPath} L ${svgPointsCoords[svgPointsCoords.length - 1].x.toFixed(1)} 210 L 30 210 Z`" 
            fill="url(#areaGradient)" 
          />

          <!-- Line Chart Draw -->
          <path 
            :d="svgPath" 
            fill="none" 
            stroke="#c5a059" 
            stroke-width="2.5" 
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- Dots indicators -->
          <circle 
            v-for="(pt, idx) in svgPointsCoords" 
            :key="idx"
            :cx="pt.x" 
            :cy="pt.y" 
            r="4.5" 
            fill="#c5a059" 
            class="stroke-white dark:stroke-[#1a1a1a]"
            stroke-width="1.5"
          />
        </svg>

        <!-- X-Axis Labels (Aligned below chart points) -->
        <div class="absolute left-0 right-0 bottom-0 px-[30px] flex justify-between text-[9px] font-bold tracking-wider text-neutral-400 uppercase select-none">
          <span v-for="(lbl, idx) in activeData.revenueLabels" :key="idx">{{ lbl }}</span>
        </div>
      </div>
    </div>

    <!-- Product Analytics: Top Selling Table -->
    <div class="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 p-6">
      <h2 class="text-xs font-bold tracking-widest text-neutral-900 dark:text-white uppercase mb-6">TOP SẢN PHẨM BÁN CHẠY</h2>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase font-sans">
              <th class="pb-3 text-center w-12">THỨ HẠNG</th>
              <th class="pb-3">SẢN PHẨM</th>
              <th class="pb-3">SKU</th>
              <th class="pb-3">DANH MỤC</th>
              <th class="pb-3 text-center">SỐ LƯỢNG BÁN</th>
              <th class="pb-3 text-right">TỔNG DOANH THU</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/60 text-xs font-medium font-sans">
            <tr 
              v-for="prod in activeData.topProducts" 
              :key="prod.rank"
              class="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10 transition-colors"
            >
              <td class="py-4 text-center text-[10px] font-bold text-neutral-400">0{{ prod.rank }}</td>
              <td class="py-4 font-serif text-neutral-900 dark:text-white text-sm font-normal">{{ prod.title }}</td>
              <td class="py-4 text-neutral-500 dark:text-neutral-400 font-mono text-[10px] tracking-wider">{{ prod.sku }}</td>
              <td class="py-4">
                <span class="text-[9px] font-bold tracking-widest uppercase text-amber-500 bg-amber-500/5 px-2 py-0.5 border border-amber-500/10">
                  {{ prod.category }}
                </span>
              </td>
              <td class="py-4 text-center font-bold text-neutral-800 dark:text-neutral-250">{{ prod.sales }} chiếc</td>
              <td class="py-4 text-right font-bold text-amber-500">{{ formatCurrency(prod.revenue) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.25s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
