import type { Core } from '@strapi/strapi';

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    strapi.log.info('Starting automated e-commerce bootstrap seeder...');

    try {
      // 1. Configure API permissions for Public Role automatically
      const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' },
      });

      if (publicRole) {
        strapi.log.info('Setting up API permissions for Public role...');

        const permissionsToGrant = [
          'api::category.category.find',
          'api::category.category.findOne',
          'api::product.product.find',
          'api::product.product.findOne',
          'api::banner.banner.find',
          'api::banner.banner.findOne',
          'api::site-setting.site-setting.find',
          'api::checkout.checkout.checkout', // Our custom checkout POST
        ];

        for (const action of permissionsToGrant) {
          const exists = await strapi.query('plugin::users-permissions.permission').findOne({
            where: { action, role: publicRole.id },
          });

          if (!exists) {
            await strapi.query('plugin::users-permissions.permission').create({
              data: {
                action,
                role: publicRole.id,
              },
            });
            strapi.log.info(`Granted permission: ${action}`);
          }
        }
      } else {
        strapi.log.warn('Public role not found, skipping permission configuration.');
      }

      // 2. Seed Site Setting (Single Type)
      const existingSettings = await strapi.documents('api::site-setting.site-setting').findMany();
      if (existingSettings.length === 0) {
        strapi.log.info('Seeding default Site Settings...');
        await strapi.documents('api::site-setting.site-setting').create({
          data: {
            siteName: 'AURA Studio',
            hotline: '090.123.4567',
            zalo: '0901234567',
            facebook: 'https://facebook.com/aurastudio',
            address: '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh',
            seoTitle: 'AURA Studio - Thời Trang Phong Cách Sống Tối Giản',
            seoDescription: 'AURA Studio cung cấp các sản phẩm quần áo thiết kế tối giản, tinh tế và cao cấp cho phong cách sống hiện đại.',
          },
        });
      }

      // 3. Seed default categories if empty
      const existingCategories = await strapi.documents('api::category.category').findMany();
      
      if (existingCategories.length === 0) {
        strapi.log.info('No categories found. Seeding default database data...');

        // Seed Categories
        const categoriesData = [
          { name: 'Áo thun', slug: 'ao-thun', description: 'Áo thun cotton hữu cơ basic mượt mà thoáng mát.' },
          { name: 'Áo sơ mi', slug: 'ao-so-mi', description: 'Áo sơ mi thanh lịch cho nam giới hiện đại.' },
          { name: 'Quần nam', slug: 'quan-nam', description: 'Quần âu, quần short kaki phong cách thanh lịch.' },
          { name: 'Phụ kiện', slug: 'phu-kien', description: 'Túi canvas, nón lưỡi trai hoàn thiện phong cách.' },
        ];

        const seededCategories: { [key: string]: any } = {};

        for (const cat of categoriesData) {
          const category = await strapi.documents('api::category.category').create({
            data: {
              name: cat.name,
              slug: cat.slug,
              description: cat.description,
              isActive: true,
            },
          });
          seededCategories[cat.slug] = category;
          strapi.log.info(`Seeded category: ${cat.name}`);
        }

        // 4. Seed default Banners
        strapi.log.info('Seeding default Home Banners...');
        const bannersData = [
          {
            title: 'AURA STUDIO - MÙA HÈ TỐI GIẢN',
            subtitle: 'Bộ sưu tập các thiết kế cotton organic thoáng mát nhất',
            link: '/products',
          },
          {
            title: 'PHONG CÁCH THANH LỊCH',
            subtitle: 'Ưu đãi 15% cho dòng sản phẩm sơ mi linen cao cấp',
            link: '/products?category=ao-so-mi',
          },
        ];

        for (const ban of bannersData) {
          await strapi.documents('api::banner.banner').create({
            data: {
              title: ban.title,
              subtitle: ban.subtitle,
              link: ban.link,
              isActive: true,
            },
          });
        }

        // 5. Seed default Products
        strapi.log.info('Seeding default Products...');
        const productsData = [
          // Áo thun
          {
            name: 'Áo Thun Organic Basic',
            slug: 'ao-thun-organic-basic',
            price: 290000,
            salePrice: 190000,
            isFeatured: true,
            shortDescription: 'Áo thun 100% cotton hữu cơ siêu mát mịn',
            description: 'Áo thun cotton hữu cơ basic phù hợp cho mọi hoạt động hàng ngày. Chất liệu dày dặn nhưng vô cùng thoáng mát.',
            categorySlug: 'ao-thun',
            stockStatus: 'in_stock',
          },
          {
            name: 'Áo Thun Oversize Streetwear',
            slug: 'ao-thun-oversize-streetwear',
            price: 350000,
            salePrice: 280000,
            isFeatured: false,
            shortDescription: 'Form rộng cá tính cho phong cách năng động',
            description: 'Áo thun form rộng thoải mái, thích hợp phối với quần short hoặc quần jeans cá tính.',
            categorySlug: 'ao-thun',
            stockStatus: 'in_stock',
          },
          // Áo sơ mi
          {
            name: 'Áo Sơ Mi Linen Cao Cấp',
            slug: 'ao-somi-linen-cao-cap',
            price: 490000,
            salePrice: 390000,
            isFeatured: true,
            shortDescription: 'Chất liệu linen tự nhiên nhập khẩu',
            description: 'Áo sơ mi linen thoáng mát, giữ form tốt và mang lại vẻ ngoài lịch lãm, phóng khoáng tự nhiên.',
            categorySlug: 'ao-so-mi',
            stockStatus: 'in_stock',
          },
          {
            name: 'Áo Sơ Mi Oxford Thanh Lịch',
            slug: 'ao-somi-oxford-thanh-lich',
            price: 450000,
            salePrice: null,
            isFeatured: false,
            shortDescription: 'Phù hợp công sở và dạo phố',
            description: 'Áo sơ mi oxford dày dặn, đứng dáng, hoàn hảo cho những cuộc họp hay buổi hẹn hò quan trọng.',
            categorySlug: 'ao-so-mi',
            stockStatus: 'in_stock',
          },
          // Quần nam
          {
            name: 'Quần Tây Slimfit Âu Mỹ',
            slug: 'quan-tay-slimfit-au-my',
            price: 550000,
            salePrice: 450000,
            isFeatured: true,
            shortDescription: 'Tôn dáng lịch thiệp cực chuẩn',
            description: 'Quần âu thiết kế ôm nhẹ, co giãn thoải mái, dễ dàng phối cùng sơ mi và giày tây.',
            categorySlug: 'quan-nam',
            stockStatus: 'in_stock',
          },
          {
            name: 'Quần Short Kaki Năng Động',
            slug: 'quan-short-kaki-nang-dong',
            price: 320000,
            salePrice: 220000,
            isFeatured: false,
            shortDescription: 'Quần short vải kaki cotton mềm mại',
            description: 'Quần short kaki trẻ trung, độ dài vừa phải, phù hợp dạo phố, đi chơi hay ở nhà.',
            categorySlug: 'quan-nam',
            stockStatus: 'in_stock',
          },
          // Phụ kiện
          {
            name: 'Nón Snapback Classic',
            slug: 'non-snapback-classic',
            price: 250000,
            salePrice: 180000,
            isFeatured: false,
            shortDescription: 'Nón lưỡi trai cổ điển thêu chữ nổi',
            description: 'Phụ kiện cá tính giúp nâng tầm trang phục của bạn. Khóa điều chỉnh kích cỡ linh hoạt.',
            categorySlug: 'phu-kien',
            stockStatus: 'in_stock',
          },
          {
            name: 'Tote Bag Canvas Tiện Lợi',
            slug: 'tote-bag-canvas-tien-loi',
            price: 180000,
            salePrice: 120000,
            isFeatured: true,
            shortDescription: 'Vải canvas tự nhiên siêu bền',
            description: 'Túi canvas rộng rãi đựng vừa laptop, thiết kế tối giản dễ phối đồ.',
            categorySlug: 'phu-kien',
            stockStatus: 'in_stock',
          },
        ];

        for (const prod of productsData) {
          const categoryObj = seededCategories[prod.categorySlug];
          await strapi.documents('api::product.product').create({
            data: {
              name: prod.name,
              slug: prod.slug,
              price: prod.price,
              salePrice: prod.salePrice,
              isFeatured: prod.isFeatured,
              shortDescription: prod.shortDescription,
              description: prod.description,
              stockStatus: prod.stockStatus,
              isActive: true,
              category: categoryObj ? categoryObj.id : null,
            },
          });
          strapi.log.info(`Seeded product: ${prod.name}`);
        }

        // 6. Seed an initial test Order for Analytics
        strapi.log.info('Seeding test Orders for analytics display...');
        await strapi.documents('api::order.order').create({
          data: {
            customerName: 'Nguyễn Văn A',
            phone: '0909998888',
            address: '456 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
            note: 'Giao giờ hành chính',
            items: [
              { productId: 1, name: 'Áo Thun Organic Basic', price: 190000, quantity: 2 }
            ],
            totalAmount: 380000,
            status: 'completed',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
          }
        });

        await strapi.documents('api::order.order').create({
          data: {
            customerName: 'Trần Thị B',
            phone: '0912345678',
            address: '789 Trần Hưng Đạo, Đà Nẵng',
            note: 'Gọi điện trước khi giao',
            items: [
              { productId: 3, name: 'Áo Sơ Mi Linen Cao Cấp', price: 390000, quantity: 1 },
              { productId: 8, name: 'Tote Bag Canvas Tiện Lợi', price: 120000, quantity: 1 }
            ],
            totalAmount: 510000,
            status: 'pending',
            createdAt: new Date().toISOString()
          }
        });
      }

      strapi.log.info('Automated e-commerce bootstrap completed successfully.');
    } catch (error) {
      strapi.log.error('Bootstrap seeder encountered an error:', error);
    }
  },
};