import React from 'react';

export default {
  config: {
    locales: [
      // 'vi',
    ],
  },
  bootstrap() {},
  register(app: any) {
    app.addMenuLink({
      to: '/google-analytics',
      icon: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px' }}>
          <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      intlLabel: {
        id: 'google-analytics.menu-link',
        defaultMessage: 'PostHog Analytics',
      },
      Component: async () => {
        return import('./pages/AnalyticsPage');
      },
    });
  },
};
