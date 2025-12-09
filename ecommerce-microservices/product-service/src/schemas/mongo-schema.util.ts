import { SchemaFactory } from '@nestjs/mongoose';

export function createMongoSchema<T>(classRef: new () => T) {
  const schema = SchemaFactory.createForClass(classRef);

  schema.virtual('id').get(function () {
    return (this as any)?._id?.toHexString();
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
