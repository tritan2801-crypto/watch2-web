import React, { useEffect, useState } from 'react';

const getAdminToken = () => {
  try {
    const token = sessionStorage.getItem('jwtToken');
    if (token) {
      return JSON.parse(token);
    }
  } catch (e) {
    // Ignore parse errors and fall back to the raw token string.
  }

  return sessionStorage.getItem('jwtToken') || '';
};

const POSTHOG_EMBED_KEY = 'posthog_embed_url';

interface OrderItem {
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: number;
  customerName: string;
  phone: string;
  address: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
  createdAt: string;
}

type TabId = 'posthog' | 'local_db' | 'setup';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('posthog');
  const [orders, setOrders] = useState<Order[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [isSavedEmbed, setIsSavedEmbed] = useState(false);
  const [setupStatus, setSetupStatus] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const savedUrl = localStorage.getItem(POSTHOG_EMBED_KEY);
    if (savedUrl) {
      setEmbedUrl(savedUrl);
      setInputUrl(savedUrl);
      setIsSavedEmbed(true);
    }
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = getAdminToken();
        const response = await fetch(
          '/admin/content-manager/collection-types/api::order.order?page=1&pageSize=100&sort=createdAt:DESC',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Không thể tải đơn hàng: HTTP ${response.status}`);
        }

        const data = await response.json();
        const results = Array.isArray(data?.results) ? data.results : [];
        const formattedOrders: Order[] = results.map((ord: any) => ({
          id: ord.id,
          customerName: ord.customerName || 'Khách vãng lai',
          phone: ord.phone || '',
          address: ord.address || '',
          totalAmount: ord.totalAmount || 0,
          status: ord.status || 'pending',
          items: Array.isArray(ord.items) ? ord.items : [],
          createdAt: ord.createdAt || new Date().toISOString(),
        }));

        setOrders(formattedOrders);
        setDbError('');
      } catch (err: any) {
        console.error('Error fetching order stats:', err);
        setOrders([]);
        setDbError(err?.message || 'Không tải được dữ liệu đơn hàng từ Strapi Admin API.');
      } finally {
        setDbLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const normalizeEmbedUrl = (raw: string) => {
    let cleaned = raw.trim();

    if (cleaned.includes('<iframe') && cleaned.includes('src=')) {
      const match = cleaned.match(/src=["']([^"']+)["']/);
      if (match?.[1]) {
        cleaned = match[1];
      }
    }

    return cleaned;
  };

  const handleSaveEmbed = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = normalizeEmbedUrl(inputUrl);

    if (!cleaned) {
      setSetupStatus({ success: false, message: 'Vui lòng nhập URL embed của PostHog.' });
      return;
    }

    localStorage.setItem(POSTHOG_EMBED_KEY, cleaned);
    setEmbedUrl(cleaned);
    setInputUrl(cleaned);
    setIsSavedEmbed(true);
    setSetupStatus({ success: true, message: 'Đã lưu PostHog embed URL cho trang admin này.' });
    setActiveTab('posthog');
  };

  const handleResetEmbed = () => {
    localStorage.removeItem(POSTHOG_EMBED_KEY);
    setEmbedUrl('');
    setInputUrl('');
    setIsSavedEmbed(false);
    setSetupStatus(null);
  };

  const revenueTotal = orders.reduce((sum, order) => (
    order.status !== 'cancelled' ? sum + order.totalAmount : sum
  ), 0);
  const completedOrders = orders.filter((order) => order.status === 'completed').length;
  const averageOrderValue = orders.length > 0 ? Math.round(revenueTotal / orders.length) : 0;

  const productSalesMap: Record<string, { name: string; quantity: number; total: number }> = {};
  orders.forEach((order) => {
    if (order.status === 'cancelled' || !Array.isArray(order.items)) return;

    order.items.forEach((item) => {
      if (!productSalesMap[item.name]) {
        productSalesMap[item.name] = { name: item.name, quantity: 0, total: 0 };
      }

      productSalesMap[item.name].quantity += item.quantity;
      productSalesMap[item.name].total += item.unitPrice * item.quantity;
    });
  });

  const bestSellers = Object.values(productSalesMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return (
    <div
      style={{
        padding: '32px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: '#f8fafc',
        minHeight: 'calc(100vh - 60px)',
        color: '#1e293b',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '20px',
          gap: '20px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(17, 24, 39, 0.22)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4">
              <path d="M4 19V9m8 10V5m8 14v-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.025em', margin: 0, color: '#0f172a' }}>
              PostHog Analytics Center
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
              Nhúng dashboard PostHog và xem đơn hàng local DB thật, không dùng simulated GA4 nữa
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            background: '#e2e8f0',
            padding: '4px',
            borderRadius: '8px',
            gap: '2px',
            flexWrap: 'wrap',
          }}
        >
          {[
            { id: 'posthog', label: '🧪 PostHog Embed' },
            { id: 'local_db', label: '📊 Bán Hàng Local DB' },
            { id: 'setup', label: '⚙️ Cấu Hình PostHog' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                background: activeTab === tab.id ? '#ffffff' : 'transparent',
                color: activeTab === tab.id ? '#0f172a' : '#475569',
                boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'posthog' && (
        <div
          style={{
            background: '#ffffff',
            padding: '28px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            minHeight: '420px',
          }}
        >
          {!embedUrl ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>🧪</span>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>
                Chưa cấu hình PostHog embed
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '540px', margin: '0 auto 24px auto', lineHeight: '1.6' }}>
                Dán URL iframe embed hoặc public sharing link của dashboard PostHog ở tab cấu hình để nhúng trực tiếp vào Strapi Admin.
              </p>
              <button
                onClick={() => setActiveTab('setup')}
                style={{
                  padding: '12px 20px',
                  background: '#111827',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '13px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Mở cấu hình PostHog
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#0f172a' }}>
                    Dashboard PostHog được nhúng
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                    Nguồn dữ liệu hiển thị hoàn toàn do PostHog cung cấp qua link embed của bạn.
                  </p>
                </div>
                <button
                  onClick={handleResetEmbed}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #fee2e2',
                    background: '#fef2f2',
                    color: '#991b1b',
                    fontSize: '12px',
                    fontWeight: '700',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Xóa cấu hình embed
                </button>
              </div>

              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  paddingBottom: '56.25%',
                  height: 0,
                  overflow: 'hidden',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                }}
              >
                <iframe
                  src={embedUrl}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 0,
                    background: '#fff',
                  }}
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'local_db' && (
        <div>
          {dbLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '280px', gap: '16px' }}>
              <div
                style={{
                  border: '3px solid #e2e8f0',
                  borderTop: '3px solid #111827',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Đang nạp đơn hàng từ database...</span>
              <style>{'@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }'}</style>
            </div>
          ) : (
            <>
              {dbError && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    marginBottom: '24px',
                    fontSize: '13px',
                    fontWeight: '600',
                  }}
                >
                  {dbError}
                </div>
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '20px',
                  marginBottom: '28px',
                }}
              >
                {[
                  {
                    label: 'Tổng doanh thu',
                    value: `${revenueTotal.toLocaleString('vi-VN')} đ`,
                    tone: 'linear-gradient(90deg, #10b981, #34d399)',
                    icon: '💰',
                  },
                  {
                    label: 'Đơn hoàn thành',
                    value: `${completedOrders} đơn`,
                    tone: 'linear-gradient(90deg, #111827, #374151)',
                    icon: '📦',
                  },
                  {
                    label: 'Tổng số đơn',
                    value: `${orders.length} đơn`,
                    tone: 'linear-gradient(90deg, #2563eb, #60a5fa)',
                    icon: '🧾',
                  },
                  {
                    label: 'AOV trung bình',
                    value: `${averageOrderValue.toLocaleString('vi-VN')} đ`,
                    tone: 'linear-gradient(90deg, #f97316, #fb923c)',
                    icon: '⚖️',
                  },
                ].map((card) => (
                  <div
                    key={card.label}
                    style={{
                      background: '#ffffff',
                      padding: '24px',
                      borderRadius: '12px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      border: '1px solid #e2e8f0',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>{card.label}</span>
                      <span style={{ fontSize: '20px' }}>{card.icon}</span>
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '12px 0 4px 0' }}>
                      {card.value}
                    </h2>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Nguồn: đơn hàng thật trong Strapi</div>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '4px', background: card.tone }} />
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1.2fr',
                  gap: '24px',
                  marginBottom: '28px',
                  alignItems: 'stretch',
                }}
              >
                <div
                  style={{
                    background: '#ffffff',
                    padding: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 16px 0', color: '#0f172a' }}>
                    Đơn hàng gần đây
                  </h3>

                  {orders.length === 0 ? (
                    <div style={{ color: '#64748b', fontSize: '13px' }}>Chưa có đơn hàng nào trong database để hiển thị.</div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1.5px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                            <th style={{ padding: '12px 8px', fontWeight: '600' }}>Mã đơn</th>
                            <th style={{ padding: '12px 8px', fontWeight: '600' }}>Khách hàng</th>
                            <th style={{ padding: '12px 8px', fontWeight: '600' }}>Ngày mua</th>
                            <th style={{ padding: '12px 8px', fontWeight: '600' }}>Giá trị</th>
                            <th style={{ padding: '12px 8px', fontWeight: '600' }}>Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => (
                            <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '12px 8px', fontWeight: '700', color: '#111827' }}>#{order.id}</td>
                              <td style={{ padding: '12px 8px', fontWeight: '600', color: '#334155' }}>{order.customerName}</td>
                              <td style={{ padding: '12px 8px', color: '#64748b' }}>
                                {new Date(order.createdAt).toLocaleString('vi-VN')}
                              </td>
                              <td style={{ padding: '12px 8px', fontWeight: '700', color: '#0f172a' }}>
                                {order.totalAmount.toLocaleString('vi-VN')} đ
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <span
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    background:
                                      order.status === 'completed'
                                        ? '#d1fae5'
                                        : order.status === 'pending'
                                          ? '#fef3c7'
                                          : order.status === 'shipping'
                                            ? '#dbeafe'
                                            : '#fee2e2',
                                    color:
                                      order.status === 'completed'
                                        ? '#065f46'
                                        : order.status === 'pending'
                                          ? '#92400e'
                                          : order.status === 'shipping'
                                            ? '#1e40af'
                                            : '#991b1b',
                                  }}
                                >
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    background: '#ffffff',
                    padding: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 16px 0', color: '#0f172a' }}>
                    Sản phẩm bán chạy
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'center' }}>
                    {bestSellers.length > 0 ? (
                      bestSellers.map((item, idx) => (
                        <div key={item.name} style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                            <span
                              style={{
                                fontWeight: '600',
                                color: '#334155',
                                maxWidth: '180px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {idx + 1}. {item.name}
                            </span>
                            <span style={{ fontWeight: '700', color: '#0f172a' }}>{item.quantity} món</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${Math.min(100, (item.quantity / Math.max(...bestSellers.map((b) => b.quantity))) * 100)}%`,
                                height: '100%',
                                borderRadius: '4px',
                                background: idx === 0 ? 'linear-gradient(90deg, #111827, #374151)' : '#94a3b8',
                              }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                        Chưa có sản phẩm nào được bán ra.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'setup' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
          <div
            style={{
              background: '#ffffff',
              padding: '28px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              border: '1px solid #e2e8f0',
            }}
          >
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
              Cấu hình PostHog Embed
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>
              Dán URL embed hoặc iframe của dashboard PostHog. Trang này sẽ chỉ hiển thị đúng nội dung PostHog bạn chia sẻ.
            </p>

            {setupStatus && (
              <div
                style={{
                  background: setupStatus.success ? '#ecfdf5' : '#fef2f2',
                  border: `1px solid ${setupStatus.success ? '#10b981' : '#f87171'}`,
                  color: setupStatus.success ? '#065f46' : '#991b1b',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  marginBottom: '20px',
                }}
              >
                {setupStatus.message}
              </div>
            )}

            <form onSubmit={handleSaveEmbed} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  PostHog Embed URL hoặc iframe *
                </label>
                <textarea
                  placeholder='Dán link chia sẻ hoặc toàn bộ thẻ iframe của PostHog vào đây'
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  padding: '12px 24px',
                  background: '#111827',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '13px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(17, 24, 39, 0.15)',
                  textAlign: 'center',
                }}
              >
                Lưu cấu hình PostHog
              </button>
            </form>
          </div>

          <div
            style={{
              background: '#ffffff',
              padding: '28px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Cách lấy embed từ PostHog
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12.5px', lineHeight: '1.6', color: '#475569' }}>
              <div>1. Mở dashboard hoặc insight bạn muốn chia sẻ trong PostHog.</div>
              <div>2. Bật chế độ share/public nếu workspace của bạn cho phép.</div>
              <div>3. Sao chép `embed link` hoặc toàn bộ thẻ `iframe`.</div>
              <div>4. Dán vào form bên trái rồi lưu.</div>
              <div>5. Quay lại tab `PostHog Embed` để xem dashboard được nhúng trực tiếp.</div>
            </div>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '16px',
                fontSize: '12px',
                color: '#475569',
                lineHeight: '1.6',
              }}
            >
              Lưu ý: Nếu PostHog của bạn chặn iframe bằng policy riêng hoặc yêu cầu đăng nhập bắt buộc, phần embed có thể không hiển thị. Khi đó bạn cần dùng shared/public link có hỗ trợ nhúng.
            </div>

            {isSavedEmbed && (
              <div
                style={{
                  background: '#ecfdf5',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                Đã có cấu hình PostHog embed được lưu trong trình duyệt admin hiện tại.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
