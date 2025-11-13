"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const product_schema_1 = require("../schemas/product.schema");
const microservices_1 = require("@nestjs/microservices");
const config_1 = require("@nestjs/config");
let AppModule = class AppModule {
    connection;
    constructor(connection) {
        this.connection = connection;
    }
    async onModuleInit() {
        const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
        console.log(`🧠 MongoDB connection state: ${states[this.connection.readyState]}`);
        this.connection.on('connected', () => console.log('✅ MongoDB connected successfully'));
        this.connection.on('error', (err) => console.error('❌ MongoDB connection error:', err.message));
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (config) => {
                    const uri = config.get('MONGO_URI');
                    console.log('🧩 Connecting to MongoDB:', uri);
                    return {
                        uri,
                        serverSelectionTimeoutMS: 5000,
                        retryWrites: true,
                    };
                },
            }),
            mongoose_1.MongooseModule.forFeature([{ name: product_schema_1.Product.name, schema: product_schema_1.ProductSchema }]),
            microservices_1.ClientsModule.registerAsync([
                {
                    name: 'PRODUCT_SERVICE',
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: async (config) => ({
                        transport: microservices_1.Transport.KAFKA,
                        options: {
                            client: {
                                clientId: 'product-service',
                                brokers: [config.get('KAFKA_BROKER') || 'localhost:9092'],
                            },
                            consumer: {
                                groupId: 'product-consumer',
                            },
                        },
                    }),
                },
            ]),
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    }),
    __param(0, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Connection])
], AppModule);
//# sourceMappingURL=app.module.js.map