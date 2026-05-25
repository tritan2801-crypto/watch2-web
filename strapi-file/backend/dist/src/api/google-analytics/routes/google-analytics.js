"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    routes: [
        {
            method: 'GET',
            path: '/google-analytics/report',
            handler: 'google-analytics.getReport',
            config: {
                auth: false,
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'POST',
            path: '/google-analytics/config',
            handler: 'google-analytics.saveConfig',
            config: {
                auth: false,
                policies: [],
                middlewares: [],
            },
        },
    ],
};
