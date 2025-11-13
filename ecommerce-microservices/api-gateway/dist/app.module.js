"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const microservices_1 = require("@nestjs/microservices");
const auth_gateway_1 = require("./gateways/auth.gateway");
const user_gateway_1 = require("./gateways/user.gateway");
const product_gateway_1 = require("./gateways/product.gateway");
const cart_gateway_1 = require("./gateways/cart.gateway");
const review_gateway_1 = require("./gateways/review.gateway");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
            microservices_1.ClientsModule.register([
                {
                    name: 'KAFKA_SERVICE',
                    transport: microservices_1.Transport.KAFKA,
                    options: {
                        client: {
                            clientId: 'api-gateway',
                            brokers: ['click2buy_kafka:9092'],
                        },
                        consumer: {
                            groupId: 'api-gateway-consumer',
                        },
                        subscribe: {
                            fromBeginning: false
                        },
                        producerOnlyMode: false,
                    },
                },
            ]),
        ],
        controllers: [
            auth_gateway_1.AuthGateway,
            user_gateway_1.UserGateway,
            product_gateway_1.ProductGateway,
            cart_gateway_1.CartGateway,
            review_gateway_1.ReviewGateway,
        ],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map