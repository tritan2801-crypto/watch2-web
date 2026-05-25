"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
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
