"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const token_service_1 = require("./token/token.service");
let AppService = class AppService {
    tokenService;
    AuthClient;
    constructor(tokenService, AuthClient) {
        this.tokenService = tokenService;
        this.AuthClient = AuthClient;
    }
    async onModuleInit() {
        this.AuthClient.subscribeToResponseOf('user.create');
        this.AuthClient.subscribeToResponseOf('user.getByforpasswordHash');
    }
    async validateUser(dto) {
        console.log('🔍 Validating user via user-service:', { field: 'username', value: dto.username });
        const user = await this.AuthClient
            .send('user.getByforpasswordHash', { username: dto.username })
            .toPromise();
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const match = await bcrypt.compare(dto.password, user.passwordHash);
        if (!match) {
            throw new common_1.UnauthorizedException('Invalid password');
        }
        return user;
    }
    async generateAccessToken(userRole, userId) {
        const secret = process.env.ACCESS_SECRET;
        if (!secret)
            throw new Error('ACCESS_SECRET missing');
        return jwt.sign({ sub: userId, role: userRole }, secret, { expiresIn: process.env.ACCESS_EXPIRES_IN || '5m' });
    }
    async generateRefreshToken(userRole, userId) {
        const secret = process.env.REFRESH_SECRET;
        if (!secret)
            throw new Error('REFRESH_SECRET missing');
        const refreshExpiresIn = process.env.REFRESH_EXPIRES_IN || '30d';
        const refreshToken = jwt.sign({ sub: userId, role: userRole }, secret, { expiresIn: refreshExpiresIn });
        const decoded = jwt.decode(refreshToken);
        const expMs = decoded?.exp ? decoded.exp * 1000 : Date.now() + 30 * 24 * 60 * 60 * 1000;
        const expiresAt = new Date(expMs);
        if (!userId) {
            throw new common_1.UnauthorizedException("Invalid token: missing userId (sub)");
        }
        await this.tokenService.saveToken(userId, refreshToken, expiresAt);
        return refreshToken;
    }
    verifyAccessToken(token) {
        try {
            const secret = process.env.ACCESS_SECRET;
            if (!secret)
                throw new Error('ACCESS_SECRET missing');
            return jwt.verify(token, secret);
        }
        catch {
            return null;
        }
    }
    async verifyRefreshToken(token) {
        try {
            const secret = process.env.REFRESH_SECRET;
            if (!secret)
                throw new Error('REFRESH_SECRET missing');
            const decoded = jwt.verify(token, secret);
            const validInDb = await this.tokenService.isTokenValid(token);
            if (!validInDb) {
                throw new common_1.UnauthorizedException('Refresh token revoked or expired in DB');
            }
            return decoded;
        }
        catch (err) {
            return null;
        }
    }
    async login(dto) {
        const user = await this.validateUser(dto);
        const accessToken = await this.generateAccessToken(user.role, user._id);
        const refreshToken = await this.generateRefreshToken(user.role, user._id);
        console.log("access o ham login", accessToken);
        return {
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                name: user.name,
            },
            accessToken: accessToken,
            refreshTokenInfo: {
                name: 'refreshToken',
                value: refreshToken,
                options: {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    path: '/auth/refresh',
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                },
            },
        };
    }
    async registerUser(dto) {
        const createdUser = await this.AuthClient
            .send('user.create', dto)
            .toPromise();
        console.log('User registered via auth-service:', createdUser);
        if (!createdUser || createdUser?.error) {
            throw new common_1.UnauthorizedException(createdUser?.error || 'Failed to create user');
        }
        const accessToken = await this.generateAccessToken(createdUser.role, createdUser.id);
        const refreshToken = await this.generateRefreshToken(createdUser.role, createdUser.id);
        return {
            user: createdUser,
            accessToken,
            refreshTokenInfo: {
                name: 'refreshToken',
                value: refreshToken,
                options: {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    path: '/auth/refresh',
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                },
            },
        };
    }
    async refreshAccessToken(refreshToken) {
        const decoded = await this.verifyRefreshToken(refreshToken);
        if (!decoded) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        const userId = decoded.sub;
        const userRole = decoded.role;
        const secret = process.env.ACCESS_SECRET;
        if (!secret)
            throw new Error('ACCESS_SECRET missing');
        const newAccessToken = jwt.sign({ sub: userId, role: userRole }, secret, { expiresIn: process.env.ACCESS_EXPIRES_IN || '5m' });
        return {
            accessToken: newAccessToken,
            refreshTokenInfo: {
                name: 'refreshToken',
                value: refreshToken,
                options: {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    path: '/auth/refresh',
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                },
            },
        };
    }
    async revoke(refreshToken) {
        await this.tokenService.revokeToken(refreshToken);
        return { revoked: true };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('AUTH_SERVICE')),
    __metadata("design:paramtypes", [token_service_1.TokenService,
        microservices_1.ClientKafka])
], AppService);
//# sourceMappingURL=app.service.js.map