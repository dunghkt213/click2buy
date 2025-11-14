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
exports.AuthGateway = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const inject_decorator_1 = require("@nestjs/common/decorators/core/inject.decorator");
const login_dto_1 = require("../dtos/login.dto");
const register_dto_1 = require("../dtos/register.dto");
let AuthGateway = class AuthGateway {
    kafka;
    constructor(kafka) {
        this.kafka = kafka;
    }
    async onModuleInit() {
        this.kafka.subscribeToResponseOf('auth.login');
        this.kafka.subscribeToResponseOf('auth.register');
        this.kafka.subscribeToResponseOf('auth.refresh');
        this.kafka.subscribeToResponseOf('auth.logout');
        await this.kafka.connect();
    }
    async login(dto, res) {
        const result = await this.kafka.send('auth.login', dto).toPromise();
        if (!result.success) {
            throw new common_1.BadRequestException(result.message || 'Login failed');
        }
        const { user, accessToken, refreshTokenInfo } = result.data;
        res.cookie('refresh_token', refreshTokenInfo.value, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
            maxAge: refreshTokenInfo.options.maxAge,
        });
        return {
            message: 'login successful',
            user,
            accessToken,
        };
    }
    async register(dto, res) {
        const result = await this.kafka.send('auth.register', dto).toPromise();
        if (!result.success) {
            throw new common_1.BadRequestException(result.message || 'Register failed');
        }
        const { user, accessToken, refreshTokenInfo } = result.data;
        res.cookie('refresh_token', refreshTokenInfo.value, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
            maxAge: refreshTokenInfo.options.maxAge,
        });
        return {
            message: 'Register successful',
            user,
            accessToken,
        };
    }
    async refresh(req, res) {
        const refreshToken = req.cookies?.refresh_token;
        if (!refreshToken) {
            throw new common_1.UnauthorizedException('Refresh token missing');
        }
        const result = await this.kafka
            .send('auth.refresh', { refreshToken })
            .toPromise();
        if (!result.success) {
            throw new common_1.UnauthorizedException(result.error || 'Invalid refresh token');
        }
        const { accessToken, refreshTokenInfo } = result.data;
        res.cookie('refresh_token', refreshTokenInfo.value, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
            maxAge: refreshTokenInfo.options.maxAge,
        });
        return {
            message: 'Access token refreshed',
            accessToken,
        };
    }
    async logout(req, res) {
        const refreshToken = req.cookies?.refresh_token;
        if (!refreshToken) {
            res.clearCookie('refresh_token', {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                path: '/',
            });
            return { success: true, message: 'Logged out (no token found)' };
        }
        const result = await this.kafka
            .send('auth.logout', { refreshToken })
            .toPromise();
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            path: '/',
        });
        if (result.success) {
            return { success: true, message: 'Logged out successfully' };
        }
        else {
            return { success: false, message: result.error };
        }
    }
};
exports.AuthGateway = AuthGateway;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthGateway.prototype, "login", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto, Object]),
    __metadata("design:returntype", Promise)
], AuthGateway.prototype, "register", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthGateway.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthGateway.prototype, "logout", null);
exports.AuthGateway = AuthGateway = __decorate([
    (0, common_1.Controller)('auth'),
    __param(0, (0, inject_decorator_1.Inject)('KAFKA_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientKafka])
], AuthGateway);
//# sourceMappingURL=auth.gateway.js.map