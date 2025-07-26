"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const user_controller_1 = require("./user.controller");
const user_service_1 = require("./user.service");
const logger_middleware_1 = require("./logger/logger.middleware");
const auth_middleware_1 = require("./auth/auth.middleware");
const prisma_service_1 = require("../prisma.service");
let UsersModule = class UsersModule {
    configure(consumer) {
        consumer
            .apply(logger_middleware_1.LoggerMiddleware)
            .forRoutes({ path: 'users', method: common_1.RequestMethod.GET }, { path: 'users', method: common_1.RequestMethod.POST })
            .apply(auth_middleware_1.AuthMiddleware)
            .forRoutes('users');
    }
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        controllers: [user_controller_1.UsersController],
        providers: [user_service_1.UsersService, prisma_service_1.PrismaService],
    })
], UsersModule);
//# sourceMappingURL=user.module.js.map