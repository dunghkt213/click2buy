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
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const token_module_1 = require("./token/token.module");
const microservices_1 = require("@nestjs/microservices");
let AppModule = class AppModule {
    connection;
    constructor(connection) {
        this.connection = connection;
    }
    async onModuleInit() {
        const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
        console.log(`🧠 MongoDB connection state: ${states[this.connection.readyState]}`);
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            mongoose_1.MongooseModule.forRootAsync({
                useFactory: (config) => {
                    const uri = config.get('MONGO_URI');
                    console.log('🧩 MONGO_URI:', uri);
                    return { uri };
                },
                inject: [config_1.ConfigService],
            }),
            token_module_1.TokenModule,
            microservices_1.ClientsModule.register([
                {
                    name: 'AUTH_SERVICE',
                    transport: microservices_1.Transport.KAFKA,
                    options: {
                        client: {
                            clientId: 'auth-service',
                            brokers: ['click2buy_kafka:9092'],
                        },
                        consumer: {
                            groupId: 'auth-service-consumer',
                        },
                    },
                },
            ])
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    }),
    __param(0, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Connection])
], AppModule);
//# sourceMappingURL=app.module.js.map