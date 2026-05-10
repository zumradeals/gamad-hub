import { Module } from "@nestjs/common";
import { AuthController, IdentityController, ProfileController } from "./identity.controller";
import { IdentityRepository } from "./identity.repository";
import { IdentityService } from "./identity.service";

@Module({
  controllers: [IdentityController, AuthController, ProfileController],
  providers: [IdentityRepository, IdentityService],
  exports: [IdentityService]
})
export class IdentityModule {}
