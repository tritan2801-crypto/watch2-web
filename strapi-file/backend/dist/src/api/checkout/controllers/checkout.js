"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    async checkout(ctx) {
        const { body } = ctx.request;
        // 1. Validation of request body
        if (!body) {
            return ctx.badRequest('Yêu cầu không hợp lệ.');
        }
        const { customerName, phone, address, note, items } = body;
        if (!customerName || typeof customerName !== 'string' || customerName.trim() === '') {
            return ctx.badRequest('Họ tên khách hàng (customerName) là bắt buộc.');
        }
        if (!phone || typeof phone !== 'string' || phone.trim() === '') {
            return ctx.badRequest('Số điện thoại (phone) là bắt buộc.');
        }
        if (!address || typeof address !== 'string' || address.trim() === '') {
            return ctx.badRequest('Địa chỉ nhận hàng (address) là bắt buộc.');
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            return ctx.badRequest('Giỏ hàng (items) phải là một danh sách không rỗng.');
        }
        // 2. Process items and fetch authentic prices from Database
        const computedItems = [];
        let totalAmount = 0;
        for (const cartItem of items) {
            const { productId, quantity } = cartItem;
            if (!productId || typeof productId !== 'number') {
                return ctx.badRequest('Mỗi sản phẩm trong giỏ hàng phải có productId hợp lệ.');
            }
            if (!quantity || typeof quantity !== 'number' || quantity <= 0 || !Number.isInteger(quantity)) {
                return ctx.badRequest('Số lượng sản phẩm (quantity) phải là số nguyên dương.');
            }
            // Query product using Strapi query API
            const product = await strapi.query('api::product.product').findOne({
                where: { id: productId }
            });
            if (!product) {
                return ctx.notFound(`Sản phẩm với ID ${productId} không tồn tại.`);
            }
            if (!product.isActive) {
                return ctx.badRequest(`Sản phẩm "${product.name}" hiện tại không kinh doanh.`);
            }
            if (product.stockStatus === 'out_of_stock') {
                return ctx.badRequest(`Sản phẩm "${product.name}" đã hết hàng.`);
            }
            // Calculate unit price: sale price takes precedence over normal price
            const unitPrice = (product.salePrice !== null && product.salePrice !== undefined)
                ? product.salePrice
                : product.price;
            totalAmount += unitPrice * quantity;
            computedItems.push({
                productId: product.id,
                name: product.name,
                slug: product.slug,
                quantity,
                unitPrice,
            });
        }
        // 3. Save the order in database via Document Service
        const order = await strapi.documents('api::order.order').create({
            data: {
                customerName,
                phone,
                address,
                note: note || '',
                items: computedItems,
                totalAmount,
                status: 'pending',
            },
        });
        // 4. Send GA4 purchase tracking event in the background (Measurement Protocol)
        const GA_MEASUREMENT_ID = 'G-98DRW31N5G';
        const GA_API_SECRET = 'IoUh4HcwTgWzuuVuJgfxjg';
        const trackPurchase = async () => {
            try {
                const payload = {
                    client_id: phone.replace(/[^0-9]/g, '') || 'anonymous_client',
                    events: [
                        {
                            name: 'purchase',
                            params: {
                                transaction_id: String(order.id),
                                value: totalAmount,
                                currency: 'VND',
                                items: computedItems.map((item) => ({
                                    item_id: String(item.productId),
                                    item_name: item.name,
                                    price: item.unitPrice,
                                    quantity: item.quantity,
                                })),
                            },
                        },
                    ],
                };
                const url = `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`;
                const trackingRes = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });
                if (trackingRes.ok) {
                    strapi.log.info(`GA4 Measurement Protocol: Purchase event tracked successfully for order #${order.id}`);
                }
                else {
                    strapi.log.warn(`GA4 Measurement Protocol returned status ${trackingRes.status}`);
                }
            }
            catch (err) {
                strapi.log.error('GA4 Measurement Protocol tracking failed:', err);
            }
        };
        // Trigger asynchronously without blocking order success response
        trackPurchase();
        // 5. Send successful response
        return ctx.send({
            success: true,
            order,
        });
    },
};
