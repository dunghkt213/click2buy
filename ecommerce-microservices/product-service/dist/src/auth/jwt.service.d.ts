import * as jwt from 'jsonwebtoken';
export declare class JwtService {
    private readonly secret;
    validateToken(token: string): string | jwt.JwtPayload;
    decodeToken(token: string): string | jwt.JwtPayload | null;
}
