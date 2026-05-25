'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Facebook, Phone, MapPin, MessageSquare, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';
import { SiteSetting } from '../lib/types';

export default function Footer() {
  const [siteSetting, setSiteSetting] = useState<SiteSetting | null>(null);

  useEffect(() => {
    api.getSiteSetting().then((data) => {
      if (data) setSiteSetting(data);
    }).catch(console.error);
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-950 text-white border-t border-neutral-900">
      {/* Benefits Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-neutral-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-neutral-900 rounded-xl text-emerald-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider text-neutral-100 uppercase">Giao Hàng Nhanh Chóng</h4>
              <p className="text-xs text-neutral-400 mt-1">Giao hàng tiết kiệm toàn quốc, kiểm tra hàng trước khi thanh toán.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-neutral-900 rounded-xl text-emerald-400">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider text-neutral-100 uppercase">7 Ngày Đổi Trả</h4>
              <p className="text-xs text-neutral-400 mt-1">Đổi trả sản phẩm dễ dàng trong vòng 7 ngày nếu không vừa size hoặc lỗi sx.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-neutral-900 rounded-xl text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider text-neutral-100 uppercase">Bảo Hành Vàng</h4>
              <p className="text-xs text-neutral-400 mt-1">Cam kết sản phẩm chất lượng cao cấp, bảo hành đường kim mũi chỉ trọn đời.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Column 1: Brand details */}
          <div>
            <h3 className="text-lg font-black tracking-wider uppercase text-white mb-4">
              {siteSetting?.siteName || 'AURA Studio'}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              {siteSetting?.seoDescription || 'AURA Studio cung cấp các sản phẩm quần áo thiết kế tối giản, tinh tế và cao cấp cho phong cách sống hiện đại.'}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-xs font-bold tracking-widest text-neutral-300 uppercase mb-4">Danh mục hữu ích</h4>
            <ul className="space-y-3 text-xs text-neutral-400 font-medium">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition-colors">Trang chủ</Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-emerald-400 transition-colors">Tất cả sản phẩm</Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-emerald-400 transition-colors">Giỏ hàng mua sắm</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contacts */}
          <div>
            <h4 className="text-xs font-bold tracking-widest text-neutral-300 uppercase mb-4">Thông tin liên hệ</h4>
            <ul className="space-y-4 text-xs text-neutral-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
                <span>{siteSetting?.address || '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh'}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                <a href={`tel:${siteSetting?.hotline || '0901234567'}`} className="hover:text-emerald-400 transition-colors font-semibold text-neutral-100">
                  {siteSetting?.hotline || '090.123.4567'}
                </a>
              </li>
              {/* Social links */}
              <li className="flex items-center gap-4 pt-2">
                {siteSetting?.facebook && (
                  <a
                    href={siteSetting.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-neutral-900 rounded-full hover:bg-emerald-500 hover:text-white transition-colors"
                    aria-label="Facebook Profile"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {siteSetting?.zalo && (
                  <a
                    href={`https://zalo.me/${siteSetting.zalo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-neutral-900 rounded-full hover:bg-emerald-500 hover:text-white transition-colors"
                    aria-label="Zalo Profile"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                )}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-neutral-900 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center text-2xs text-neutral-500 gap-4">
          <p>© {currentYear} {siteSetting?.siteName || 'AURA Studio'}. All rights reserved.</p>
          <div className="flex gap-6 font-semibold">
            <span className="hover:text-neutral-400 cursor-pointer">Chính sách bảo mật</span>
            <span className="hover:text-neutral-400 cursor-pointer">Điều khoản dịch vụ</span>
          </div>
        </div>
      </div>
    </footer>
  );
}