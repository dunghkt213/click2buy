"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUser = void 0;
const common_1 = require("@nestjs/common");
exports.CurrentUser = (0, common_1.createParamDecorator)((_, context) => {
    const kafkaCtx = context.switchToRpc().getContext();
    const message = kafkaCtx.getMessage().value;
    return message.user;
});
//# sourceMappingURL=current-user.decorator.js.map