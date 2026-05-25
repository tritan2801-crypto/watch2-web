'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, Loader2, ClipboardCheck, Phone, MapPin, User, ChevronLeft } from 'lucide-react';
import { useCart } from '../../lib/CartContext';
import { api, getStrapiMediaUrl } from '../../lib/api';
import posthog from 'posthog-js';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart, cartCount } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  // Redirect to cart if empty
  useEffect(() => {
    if (cart.length === 0 && !success) {
      router.push('/cart');
    }
  }, [cart, success, router]);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Client Validation
    if (!customerName.trim()) return setErrorMsg('Vui lòng nhập họ tên nhận hàng.');
    if (!phone.trim()) return setErrorMsg('Vui lòng nhập số điện thoại liên hệ.');
    if (!address.trim()) return setErrorMsg('Vui lòng nhập địa chỉ nhận hàng.');

    setLoading(true);

    try {
      const checkoutPayload = {
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        note: note.trim() || undefined,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };

      const response = await api.checkout(checkoutPayload);

      if (response && response.success) {
        const orderId = response.order.id;
        posthog.capture('order_placed', {
          order_id: orderId,
          total_amount: response.order.totalAmount,
          item_count: cartCount,
          payment_method: 'COD',
        });
        setSuccess(true);
        clearCart(); // Wipe cart
        // Redirect to thank you page with query params
        router.push(`/thank-you?orderId=${orderId}&amount=${response.order.totalAmount}`);
      } else {
        setErrorMsg('Đặt hàng thất bại. Vui lòng kiểm tra lại thông tin.');
        posthog.capture('checkout_error', {
          reason: 'order_failed',
          cart_total: cartTotal,
        });
      }
    } catch (err: any) {
      console.error('Order checkout error:', err);
      posthog.captureException(err);
      setErrorMsg(err.message || 'Đặt hàng thất bại do sự cố đường truyền. Vui lòng thử lại.');
      posthog.capture('checkout_error', {
        reason: 'network_error',
        error_message: err.message,
        cart_total: cartTotal,
      });
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && !success) {
    return null;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen space-y-8">
      {/* Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
          aria-label="Back button"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-neutral-950">Thông tin thanh toán</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Xác nhận giao hàng an toàn, không cần thanh toán trước</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-xs font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Grid panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left Side: Delivery Details Form */}
        <div className="lg:col-span-2 bg-white border border-neutral-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
          <h3 className="text-xs font-bold tracking-widest text-neutral-800 uppercase flex items-center gap-1.5 border-b border-neutral-100 pb-3">
            <ClipboardCheck className="w-4 h-4 text-emerald-500" />
            <span>Địa chỉ giao hàng (COD)</span>
          </h3>

          <form onSubmit={handleSubmitOrder} className="space-y-4">
            {/* Input Name */}
            <div className="space-y-2">
              <label htmlFor="customerName" className="block text-2xs font-extrabold text-neutral-700 uppercase tracking-wide">Họ tên người nhận</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Input Phone */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-2xs font-extrabold text-neutral-700 uppercase tracking-wide">Số điện thoại liên hệ</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0901234567"
                  className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Input Address */}
            <div className="space-y-2">
              <label htmlFor="address" className="block text-2xs font-extrabold text-neutral-700 uppercase tracking-wide">Địa chỉ nhận hàng chi tiết</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-neutral-400">
                  <MapPin className="w-4 h-4" />
                </span>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                  rows={2}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                  required
                />
              </div>
            </div>

            {/* Input Note */}
            <div className="space-y-2">
              <label htmlFor="note" className="block text-2xs font-extrabold text-neutral-700 uppercase tracking-wide">Ghi chú giao hàng (Không bắt buộc)</label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Giao giờ hành chính, gọi điện trước khi đến..."
                rows={2}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              />
            </div>

            {/* Shield trust note */}
            <div className="flex items-center gap-2 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-3xs font-semibold text-emerald-700 uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Phương thức thanh toán: COD (Giao hàng thu tiền tận nơi)</span>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-neutral-950 hover:bg-emerald-500 disabled:bg-neutral-300 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang khởi tạo đơn hàng...</span>
                </>
              ) : (
                <>
                  <span>Xác nhận đặt hàng</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Order summary review */}
        <div className="lg:col-span-1 bg-neutral-50 border border-neutral-100 rounded-3xl p-6 space-y-6">
          <h3 className="text-xs font-bold tracking-widest text-neutral-800 uppercase pb-3 border-b border-neutral-200">
            Xem lại đơn hàng ({cartCount})
          </h3>

          {/* List items brief */}
          <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
            {cart.map((item) => {
              const product = item.product;
              const price = product.salePrice !== null && product.salePrice !== undefined ? product.salePrice : product.price;
              
              return (
                <div key={product.id} className="flex gap-3 text-xs items-center">
                  <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-neutral-50 border border-neutral-100 flex-shrink-0">
                    <img src={getStrapiMediaUrl(product.mainImage)} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-neutral-850 truncate uppercase">{product.name}</h4>
                    <span className="text-3xs text-neutral-400 font-bold block">Số lượng: {item.quantity}</span>
                  </div>
                  <span className="font-bold text-neutral-950 flex-shrink-0">
                    {(price * item.quantity).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-neutral-200 pt-4 space-y-4 text-xs font-semibold text-neutral-600">
            <div className="flex justify-between">
              <span>Giá trị đơn hàng</span>
              <span className="text-neutral-850 font-bold">{cartTotal.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between">
              <span>Vận chuyển COD</span>
              <span className="text-emerald-500 font-bold uppercase tracking-wider">Miễn Phí</span>
            </div>
            <div className="border-t border-neutral-200 pt-4 flex justify-between text-neutral-950 font-black text-sm uppercase">
              <span>Tổng cộng</span>
              <span className="text-base font-black text-emerald-500">{cartTotal.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}