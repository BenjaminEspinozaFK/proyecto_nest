import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response } from 'express';
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new HttpException('Unauthorized access', HttpStatus.UNAUTHORIZED);
    }

    // Extraer el token del header (manejar tanto "123456" como "Bearer 123456")
    const token = authorization.startsWith('Bearer ')
      ? authorization.slice(7)
      : authorization;

    if (token !== '123456') {
      throw new HttpException('Forbidden access', HttpStatus.FORBIDDEN);
    }
    next();
  }
}
