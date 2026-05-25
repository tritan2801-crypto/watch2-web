export default {
  routes: [
    {
      method: 'POST',
      path: '/checkout',
      handler: 'checkout.checkout',
      config: {
        auth: false, // Make public
        policies: [],
        middlewares: [],
      },
    },
  ],
};
