import { SchemaFactory } from '@nestjs/mongoose';

export function createMongoSchema<T>(classRef: new () => T) {
  const schema = SchemaFactory.createForClass(classRef);

  // Thêm field ảo 'id' để dễ sử dụng khi trả JSON
  schema.virtual('id').get(function () {
    return (this as any)?._id?.toHexString();
  });

  // Ẩn _id và __v khi trả JSON
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
