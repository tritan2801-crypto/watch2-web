<script setup>
import { ref, computed } from 'vue';

// Mock list of orders with detailed products, customer details, and dates
const orders = ref([
  {
    id: 1024,
    date: '2026-05-24 14:32',
    customer: { name: 'Nguyễn Văn Hải', phone: '0912345678', email: 'hai.nguyen@gmail.com' },
    shippingAddress: { province: 'Thành phố Hồ Chí Minh', district: 'Quận 1', ward: 'Phường Bến Nghé', details: '12 Lê Lợi, P. Bến Nghé' },
    items: [
      { id: 1, title: 'Chrono Gold - Matte Black', price: 140.00, quantity: 1, sku: 'MC-01-GOLD' },
      { id: 2, title: 'Voyager Blue - Tan Strap', price: 122.50, quantity: 1, sku: 'MV-02-VOY' }
    ],
    couponCode: 'WELCOME10',
    subtotal: 262.50,
    discount: 26.25,
    total: 236.25,
    status: 'pending', // 'pending', 'confirmed', 'delivered'
    paymentStatus: 'pending_payment', // 'pending_payment', 'paid'
    paymentMethod: 'Chuyển khoản Ngân hàng',
    loading: false
  },
  {
    id: 1023,
    date: '2026-05-23 09:15',
    customer: { name: 'Trần Thị Thu Trang', phone: '0987654321', email: 'trang.ttt@yahoo.com' },
    shippingAddress: { province: 'Thành phố Hà Nội', district: 'Quận Hoàn Kiếm', ward: 'Phường Hàng Đào', details: '45 Hàng Đào' },
    items: [
      { id: 3, title: 'Nova Stella - Rose Blush', price: 140.00, quantity: 2, sku: 'WN-03-STELLA' }
    ],
    couponCode: null,
    subtotal: 280.00,
    discount: 0.00,
    total: 280.00,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'Ví MoMo',
    loading: false
  },
  {
    id: 1022,
    date: '2026-05-22 18:40',
    customer: { name: 'Lê Hoàng Long', phone: '0905556677', email: 'long.lh@outlook.com' },
    shippingAddress: { province: 'Thành phố Đà Nẵng', district: 'Quận Hải Châu', ward: 'Phường Thạch Thang', details: '88 Quang Trung' },
    items: [
      { id: 4, title: 'Legacy Slim - Mesh Band', price: 165.00, quantity: 1, sku: 'ML-04-LEGCY' }
    ],
    couponCode: 'MVMT10',
    subtotal: 165.00,
    discount: 16.50,
    total: 148.50,
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'COD (Thanh toán khi nhận hàng)',
    loading: false
  },
  {
    id: 1021,
    date: '2026-05-21 11:22',
    customer: { name: 'Phạm Minh Quân', phone: '0944332211', email: 'quan.pm@gmail.com' },
    shippingAddress: { province: 'Thành phố Hải Phòng', district: 'Quận Hồng Bàng', ward: 'Phường Minh Khai', details: '15 Minh Khai' },
    items: [
      { id: 2, title: 'Voyager Blue - Tan Strap', price: 122.50, quantity: 1, sku: 'MV-02-VOY' }
    ],
    couponCode: null,
    subtotal: 122.50,
    discount: 0.00,
    total: 122.50,
    status: 'pending',
    paymentStatus: 'paid',
    paymentMethod: 'Thẻ tín dụng (Credit Card)',
    loading: false
  }
]);

// Tab control filtering
const activeTab = ref('all'); // 'all', 'pending', 'confirmed', 'delivered', 'pending_payment', 'paid'
const searchQuery = ref('');
const showInvoiceModal = ref(false);
const selectedOrder = ref(null);

const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    // 1. Tab filter check
    let matchesTab = true;
    if (activeTab.value === 'pending') matchesTab = order.status === 'pending';
    else if (activeTab.value === 'confirmed') matchesTab = order.status === 'confirmed';
    else if (activeTab.value === 'delivered') matchesTab = order.status === 'delivered';
    else if (activeTab.value === 'pending_payment') matchesTab = order.paymentStatus === 'pending_payment';
    else if (activeTab.value === 'paid') matchesTab = order.paymentStatus === 'paid';
    
    // 2. Search query check (search by ID, Customer Name, or Phone)
    let matchesSearch = true;
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      matchesSearch = 
        order.id.toString().includes(q) ||
        order.customer.name.toLowerCase().includes(q) ||
        order.customer.phone.includes(q);
    }
    
    return matchesTab && matchesSearch;
  });
});

const openInvoice = (order) => {
  selectedOrder.value = order;
  showInvoiceModal.value = true;
};

const closeInvoice = () => {
  showInvoiceModal.value = false;
  selectedOrder.value = null;
};

// Async update status mock trigger
const updateOrderStatus = async (order, newStatus) => {
  order.loading = true;
  // Simulating async API call delay
  await new Promise(resolve => setTimeout(resolve, 600));
  order.status = newStatus;
  order.loading = false;
};

const updatePaymentStatus = async (order, newPaymentStatus) => {
  order.loading = true;
  await new Promise(resolve => setTimeout(resolve, 600));
  order.paymentStatus = newPaymentStatus;
  order.loading = false;
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
};

// Status Styling classes helper
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
    case 'confirmed':
      return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
    case 'delivered':
      return 'bg-green-500/10 text-green-500 border border-green-500/20';
    default:
      return 'bg-neutral-500/10 text-neutral-500 border border-neutral-500/20';
  }
};

const getPaymentStatusBadgeClass = (status) => {
  return status === 'paid'
    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
    : 'bg-red-500/10 text-red-500 border border-red-500/20';
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'pending': return 'ĐANG CHỜ XỬ LÝ';
    case 'confirmed': return 'ĐÃ DUYỆT';
    case 'delivered': return 'ĐÃ GIAO';
    default: return status;
  }
};

const getPaymentStatusLabel = (status) => {
  return status === 'paid' ? 'ĐÃ THANH TOÁN' : 'ĐANG CHỜ THANH TOÁN';
};
</script>

<template>
  <div class="space-y-8 animate-fade-in relative">
    
    <!-- Header Block -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
      <div>
        <h1 class="font-serif text-2xl font-normal text-neutral-900 dark:text-white uppercase tracking-wider">QUẢN LÝ ĐƠN HÀNG</h1>
        <p class="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-1">Quản lý giao dịch, vận chuyển & hóa đơn thanh toán</p>
      </div>

      <!-- Action Search Bar -->
      <div class="relative w-full md:w-80">
        <input 
          type="text" 
          v-model="searchQuery"
          placeholder="TÌM THEO MÃ ĐƠN, TÊN, SĐT..."
          class="w-full bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 text-[10px] font-bold tracking-widest uppercase p-4 pr-10 outline-none focus:border-amber-500 transition-colors placeholder-neutral-400 dark:placeholder-neutral-500"
        />
        <i class="fa-solid fa-magnifying-glass absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 text-xs"></i>
      </div>
    </div>

    <!-- Status Category Tabs -->
    <div class="border-b border-neutral-200 dark:border-neutral-800">
      <div class="flex flex-wrap -mb-px">
        <button 
          v-for="tab in [
            { id: 'all', label: 'TẤT CẢ' },
            { id: 'pending', label: '📥 ĐANG CHỜ XỬ LÝ' },
            { id: 'confirmed', label: '✅ ĐÃ DUYỆT' },
            { id: 'delivered', label: '🚚 ĐÃ GIAO' },
            { id: 'pending_payment', label: '⏳ CHỜ THANH TOÁN' },
            { id: 'paid', label: '💳 ĐÃ THANH TOÁN' }
          ]"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'border-b-2 py-4 px-6 text-[10px] font-bold tracking-widest uppercase transition-all duration-200 outline-none whitespace-nowrap',
            activeTab === tab.id 
              ? 'border-amber-500 text-amber-500 font-extrabold' 
              : 'border-transparent text-neutral-450 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Data Orders Table -->
    <div class="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 overflow-hidden relative">
      
      <!-- Screen Loader Overlay -->
      <div 
        v-if="filteredOrders.some(o => o.loading)" 
        class="absolute inset-0 bg-white/40 dark:bg-black/20 z-10 backdrop-blur-[1px] flex items-center justify-center pointer-events-none"
      >
        <i class="fa-solid fa-spinner fa-spin text-amber-500 text-2xl"></i>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase font-sans">
              <th class="p-6">MÃ ĐƠN</th>
              <th class="p-6">NGÀY ĐẶT</th>
              <th class="p-6">KHÁCH HÀNG</th>
              <th class="p-6">ĐỊA CHỈ</th>
              <th class="p-6 text-center">TRẠNG THÁI ĐƠN</th>
              <th class="p-6 text-center">THANH TOÁN</th>
              <th class="p-6 text-right">TỔNG CỘNG</th>
              <th class="p-6 text-center">THAO TÁC</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-150 dark:divide-neutral-800/60 text-xs font-semibold font-sans">
            
            <tr v-if="filteredOrders.length === 0">
              <td colspan="8" class="p-12 text-center text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-sans">
                Không tìm thấy đơn hàng nào phù hợp
              </td>
            </tr>

            <tr 
              v-for="order in filteredOrders" 
              :key="order.id"
              class="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10 transition-colors"
            >
              <!-- Order ID code -->
              <td class="p-6 font-bold text-neutral-900 dark:text-white font-mono">#{{ order.id }}</td>
              
              <!-- Date -->
              <td class="p-6 text-neutral-400 dark:text-neutral-500 font-mono text-[11px] whitespace-nowrap">{{ order.date }}</td>
              
              <!-- Customer details -->
              <td class="p-6">
                <div class="text-[12px] font-bold text-neutral-800 dark:text-neutral-200">{{ order.customer.name }}</div>
                <div class="text-[10px] text-neutral-400 font-mono mt-0.5">{{ order.customer.phone }}</div>
              </td>
              
              <!-- Address (Truncated for summary grid) -->
              <td class="p-6 max-w-xs truncate">
                <div class="text-[11px] truncate" :title="`${order.shippingAddress.details}, ${order.shippingAddress.ward}, ${order.shippingAddress.district}, ${order.shippingAddress.province}`">
                  {{ order.shippingAddress.details }}
                </div>
                <div class="text-[9px] text-neutral-400 uppercase tracking-wider truncate mt-0.5">
                  {{ order.shippingAddress.province }}
                </div>
              </td>

              <!-- Logistics Status dropdown selector -->
              <td class="p-6 text-center">
                <div class="relative inline-block w-40">
                  <select 
                    :value="order.status"
                    @change="updateOrderStatus(order, $event.target.value)"
                    :disabled="order.loading"
                    :class="[
                      'w-full py-1.5 px-3 rounded-none text-[9px] font-bold tracking-wider uppercase border text-center appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all duration-200',
                      getStatusBadgeClass(order.status)
                    ]"
                  >
                    <option value="pending">ĐANG CHỜ XỬ LÝ</option>
                    <option value="confirmed">ĐÃ DUYỆT</option>
                    <option value="delivered">ĐÃ GIAO</option>
                  </select>
                  <i class="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[8px] pointer-events-none text-neutral-400"></i>
                </div>
              </td>

              <!-- Financial Payment Status selector -->
              <td class="p-6 text-center">
                <div class="relative inline-block w-48">
                  <select 
                    :value="order.paymentStatus"
                    @change="updatePaymentStatus(order, $event.target.value)"
                    :disabled="order.loading"
                    :class="[
                      'w-full py-1.5 px-3 rounded-none text-[9px] font-bold tracking-wider uppercase border text-center appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all duration-200',
                      getPaymentStatusBadgeClass(order.paymentStatus)
                    ]"
                  >
                    <option value="pending_payment">ĐANG CHỜ THANH TOÁN</option>
                    <option value="paid">ĐÃ THANH TOÁN</option>
                  </select>
                  <i class="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[8px] pointer-events-none text-neutral-400"></i>
                </div>
              </td>

              <!-- Financial Total -->
              <td class="p-6 text-right font-extrabold text-neutral-900 dark:text-white font-mono">{{ formatCurrency(order.total) }}</td>

              <!-- Action Detail Button -->
              <td class="p-6 text-center whitespace-nowrap">
                <button 
                  @click="openInvoice(order)"
                  class="border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-amber-500 hover:text-amber-500 px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-colors outline-none"
                >
                  <i class="fa-solid fa-file-invoice mr-1.5"></i> CHI TIẾT
                </button>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>

    <!-- Print/Modal Invoice Overlay Component -->
    <div 
      v-if="showInvoiceModal && selectedOrder" 
      class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
      @click.self="closeInvoice"
    >
      <div class="bg-white dark:bg-[#1a1a1a] border border-amber-500/50 w-full max-w-3xl overflow-hidden shadow-2xl relative">
        
        <!-- Modal Top Bar Controls -->
        <div class="h-14 bg-neutral-900 dark:bg-black/90 flex items-center justify-between px-6 border-b border-neutral-800 text-white z-10 relative">
          <span class="text-[10px] font-bold tracking-[0.2em] uppercase font-sans">CHI TIẾT HÓA ĐƠN #{{ selectedOrder.id }}</span>
          <button @click="closeInvoice" class="text-neutral-400 hover:text-white transition-colors outline-none">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Invoice Printable Content Frame -->
        <div class="p-8 max-h-[75vh] overflow-y-auto font-sans" id="printableInvoice">
          
          <!-- Brand Logo and Invoice metadata -->
          <div class="flex justify-between items-start border-b border-neutral-200 dark:border-neutral-800 pb-6 mb-6">
            <div>
              <div class="font-serif text-2xl font-bold tracking-[0.25em] text-neutral-900 dark:text-white">MVMT</div>
              <div class="text-[9px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-1">Minimalist luxury watches & style</div>
            </div>
            <div class="text-right font-mono">
              <div class="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-widest">HÓA ĐƠN GIAO DỊCH</div>
              <div class="text-[10px] text-neutral-400 mt-1">ĐƠN #{{ selectedOrder.id }}</div>
              <div class="text-[10px] text-neutral-400">{{ selectedOrder.date }}</div>
            </div>
          </div>

          <!-- Customer and Courier logistics columns -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-neutral-200 dark:border-neutral-800 pb-6 mb-6 text-xs text-neutral-600 dark:text-neutral-450">
            <div>
              <h3 class="text-[9px] font-bold tracking-widest text-neutral-900 dark:text-white uppercase mb-2">KHÁCH HÀNG:</h3>
              <div class="font-bold text-neutral-900 dark:text-white mb-1">{{ selectedOrder.customer.name }}</div>
              <div class="font-mono">SĐT: {{ selectedOrder.customer.phone }}</div>
              <div>Email: {{ selectedOrder.customer.email }}</div>
            </div>
            
            <div>
              <h3 class="text-[9px] font-bold tracking-widest text-neutral-900 dark:text-white uppercase mb-2">ĐỊA CHỈ GIAO HÀNG:</h3>
              <div>{{ selectedOrder.shippingAddress.details }}</div>
              <div>{{ selectedOrder.shippingAddress.ward }}</div>
              <div>{{ selectedOrder.shippingAddress.district }}</div>
              <div class="font-bold text-neutral-850 dark:text-neutral-200 uppercase mt-0.5">{{ selectedOrder.shippingAddress.province }}</div>
            </div>
          </div>

          <!-- Order item products listing -->
          <div class="mb-6">
            <h3 class="text-[9px] font-bold tracking-widest text-neutral-900 dark:text-white uppercase mb-3">DANH SÁCH SẢN PHẨM:</h3>
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-neutral-200 dark:border-neutral-800 text-[9px] font-bold tracking-widest text-neutral-400 uppercase font-sans">
                  <th class="pb-2">SẢN PHẨM</th>
                  <th class="pb-2">SKU</th>
                  <th class="pb-2 text-center w-20">ĐƠN GIÁ</th>
                  <th class="pb-2 text-center w-20">SỐ LƯỢNG</th>
                  <th class="pb-2 text-right w-28">THÀNH TIỀN</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/40 text-neutral-800 dark:text-neutral-300">
                <tr v-for="item in selectedOrder.items" :key="item.id">
                  <td class="py-3 font-serif text-sm font-normal text-neutral-900 dark:text-white">{{ item.title }}</td>
                  <td class="py-3 font-mono text-[10px] text-neutral-400">{{ item.sku }}</td>
                  <td class="py-3 text-center font-mono">{{ formatCurrency(item.price) }}</td>
                  <td class="py-3 text-center font-bold">{{ item.quantity }}</td>
                  <td class="py-3 text-right font-extrabold text-neutral-900 dark:text-white font-mono">{{ formatCurrency(item.price * item.quantity) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Financial Calculation subtotal, discount and totals grid -->
          <div class="border-t border-neutral-200 dark:border-neutral-800 pt-6 flex flex-col items-end gap-2 text-xs text-neutral-500">
            <div class="flex justify-between w-64">
              <span>Tạm tính:</span>
              <span class="font-mono font-bold text-neutral-800 dark:text-neutral-200">{{ formatCurrency(selectedOrder.subtotal) }}</span>
            </div>
            
            <div v-if="selectedOrder.discount > 0" class="flex justify-between w-64 text-amber-500">
              <span>Giảm giá ({{ selectedOrder.couponCode }}):</span>
              <span class="font-mono font-bold">-{{ formatCurrency(selectedOrder.discount) }}</span>
            </div>
            
            <div class="flex justify-between w-64 border-t border-neutral-200 dark:border-neutral-800 pt-2 text-neutral-900 dark:text-white font-bold text-sm">
              <span>Tổng cộng:</span>
              <span class="font-mono text-amber-500 text-lg font-extrabold">{{ formatCurrency(selectedOrder.total) }}</span>
            </div>

            <div class="flex justify-between w-64 text-[9px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-2">
              <span>Phương thức thanh toán:</span>
              <span class="font-bold text-neutral-700 dark:text-neutral-300 text-right">{{ selectedOrder.paymentMethod }}</span>
            </div>
          </div>

          <!-- Print layout footer notes -->
          <div class="mt-12 text-center text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest border-t border-neutral-200 dark:border-neutral-800 pt-6">
            <span>CẢM ƠN BẠN ĐÃ MUA SẮM TẠI MVMT WATCHES</span>
          </div>

        </div>

        <!-- Modal Bottom Actions Bar -->
        <div class="h-16 bg-neutral-50 dark:bg-[#1a1a1a] border-t border-neutral-250 dark:border-neutral-800 flex items-center justify-end px-6 gap-4">
          <button 
            @click="closeInvoice"
            class="border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-5 py-2.5 text-[10px] font-bold tracking-widest uppercase transition-colors outline-none font-sans"
          >
            Đóng
          </button>
          
          <button 
            onclick="window.print()"
            class="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 text-[10px] font-bold tracking-widest uppercase transition-colors outline-none flex items-center gap-1.5 font-sans"
          >
            <i class="fa-solid fa-print"></i> In Hóa Đơn
          </button>
        </div>

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

/* Printable style overlay */
@media print {
  body * {
    visibility: hidden;
  }
  #printableInvoice, #printableInvoice * {
    visibility: visible;
  }
  #printableInvoice {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
</style>
