"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ({ env }) => ({
    connection: {
        client: 'postgres',
        connection: {
            host: env('DATABASE_HOST', 'postgres'),
            port: env.int('DATABASE_PORT', 5432),
            database: env('DATABASE_NAME', 'shop_db'),
            user: env('DATABASE_USERNAME', 'shop_user'),
            password: env('DATABASE_PASSWORD', 'shop_password'),
            schema: env('DATABASE_SCHEMA', 'public'),
            ssl: env.bool('DATABASE_SSL', false),
        },
        acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
});
