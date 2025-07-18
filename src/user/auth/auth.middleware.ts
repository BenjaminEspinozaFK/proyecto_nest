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
    if (authorization !== '123456') {
      throw new HttpException('Forbidden access', HttpStatus.FORBIDDEN);
    }
    next();
  }
}
