import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {

    console.log("===== API-GATEWAY REQUEST =====");
    console.log("Method:", req.method);
    console.log("URL:", req.originalUrl);
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log("================================");

    next();
  }
}
