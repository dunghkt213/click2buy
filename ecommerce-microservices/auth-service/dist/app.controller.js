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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const app_service_1 = require("./app.service");
const register_dto_1 = require("./dto/register.dto");
const login_dto_1 = require("./dto/login.dto");
let AppController = class AppController {
    appService;
    constructor(appService) {
        this.appService = appService;
    }
    async handleRegister(data) {
        try {
            const result = await this.appService.registerUser(data);
            return {
                success: true,
                message: 'User registered successfully',
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                    refreshTokenInfo: result.refreshTokenInfo,
                }
            };
        }
        catch (err) {
            return { success: false, message: err.message };
        }
    }
    async handleLogin(message) {
        try {
            const result = await this.appService.login(message);
            return {
                success: true,
                message: 'Login successful',
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                    refreshTokenInfo: result.refreshTokenInfo,
                },
            };
        }
        catch (err) {
            return { success: false, error: err.message, message: err.message };
        }
    }
    async handleLogout(message) {
        try {
            await this.appService.revoke(message.refreshToken);
            return {
                success: true,
                message: 'Logout successful',
            };
        }
        catch (err) {
            return { success: false, error: err.message };
        }
    }
    async handleRefresh(message) {
        try {
            const result = await this.appService.refreshAccessToken(message.refreshToken);
            return {
                success: true,
                message: 'Access token refreshed',
                data: {
                    accessToken: result.accessToken,
                    refreshTokenInfo: result.refreshTokenInfo,
                },
            };
        }
        catch (err) {
            return { success: false, error: err.message };
        }
    }
    async handleVerify(message) {
        const payload = this.appService.verifyAccessToken(message.token);
        if (!payload) {
            return { success: false, error: 'Invalid or expired access token' };
        }
        return {
            success: true,
            data: {
                user: {
                    id: payload['sub'],
                    username: payload['username'] || 'unknown',
                },
            },
        };
    }
    async handleRevoke(message) {
        await this.appService.revoke(message.refreshToken);
        return { success: true, message: 'Refresh token revoked' };
    }
};
exports.AppController = AppController;
__decorate([
    (0, microservices_1.MessagePattern)('auth.register'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.registerDto]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "handleRegister", null);
__decorate([
    (0, microservices_1.MessagePattern)('auth.login'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "handleLogin", null);
__decorate([
    (0, microservices_1.MessagePattern)('auth.logout'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "handleLogout", null);
__decorate([
    (0, microservices_1.MessagePattern)('auth.refresh'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "handleRefresh", null);
__decorate([
    (0, microservices_1.MessagePattern)('auth.verify'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "handleVerify", null);
__decorate([
    (0, microservices_1.MessagePattern)('auth.revoke'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "handleRevoke", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppController);
//# sourceMappingURL=app.controller.js.map