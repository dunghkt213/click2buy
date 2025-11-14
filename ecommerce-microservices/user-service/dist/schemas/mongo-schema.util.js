"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMongoSchema = createMongoSchema;
const mongoose_1 = require("@nestjs/mongoose");
function createMongoSchema(classRef) {
    const schema = mongoose_1.SchemaFactory.createForClass(classRef);
    schema.virtual('id').get(function () {
        return this?._id?.toHexString();
    });
    schema.set('toJSON', {
        virtuals: true,
        versionKey: false,
        transform: (_doc, ret) => {
            delete ret._id;
            return ret;
        },
    });
    return schema;
}
//# sourceMappingURL=mongo-schema.util.js.map