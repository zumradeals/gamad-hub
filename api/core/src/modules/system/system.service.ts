import { Injectable } from '@nestjs/common';

@Injectable()
export class SystemService {
  getHealth() {
    return {
      status: 'ok',
      version: '2.0.0',
      timestamp: new Date(),
    };
  }
}
