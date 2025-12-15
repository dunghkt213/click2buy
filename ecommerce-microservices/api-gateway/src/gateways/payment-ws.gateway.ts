import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { JwtService } from '@nestjs/jwt';
  
  @WebSocketGateway({
    cors: {
      origin: 'http://localhost:5173',
      credentials: true,
    },
  })
  export class PaymentWsGateway
    implements OnGatewayConnection, OnGatewayDisconnect
  {
    @WebSocketServer()
    server: Server;
  
    constructor(private readonly jwt: JwtService) {}
  
    handleConnection(client: Socket) {
      try {
        const cookie = client.handshake.headers.cookie;
        if (!cookie) throw new Error('No cookie');
  
        // ✅ DÙNG REFRESH TOKEN
        const match = cookie.match(/refresh_token=([^;]+)/);
        if (!match) throw new Error('No refresh token');
  
        const decoded = this.jwt.verify(match[1], {
          secret: process.env.REFRESH_SECRET, // 👈 DÒNG QUYẾT ĐỊNH
        });
        console.log("secret", process.env.REFRESH_SECRET);
        console.log('Decoded WS token:', decoded);
  
        const userId = decoded.sub || decoded.userId;
        client.join(userId);
  
        console.log('🔌 WS connected user:', userId);
      } catch (e) {
        console.log('❌ WS auth failed:', e.message);
        // ❌ KHÔNG disconnect → tránh loop
      }
    }
  
    handleDisconnect(client: Socket) {
      console.log('❌ WS disconnected:', client.id);
    }
  
    sendToUser(userId: string, event: any) {
      this.server.to(userId).emit('payment', event);
    }
  }
  