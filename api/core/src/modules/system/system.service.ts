import { Injectable } from "@nestjs/common";

@Injectable()
export class SystemService {
  health() {
    return {
      success: true,
      data: {
        status: "ok",
        timestamp: new Date().toISOString()
      }
    };
  }
}
