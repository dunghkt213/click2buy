export declare function createMongoSchema<T>(classRef: new () => T): import("mongoose").Schema<T, import("mongoose").Model<T, any, any, any, import("mongoose").IfAny<T, any, import("mongoose").Document<unknown, any, T, any, {}> & (import("mongoose").Require_id<T> extends infer T_1 ? T_1 extends import("mongoose").Require_id<T> ? T_1 extends {
    __v?: infer U;
} ? T_1 : T_1 & {
    __v: number;
} : never : never)>, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, import("mongoose").ObtainDocumentType<any, T, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>>, import("mongoose").IfAny<import("mongoose").FlatRecord<import("mongoose").ObtainDocumentType<any, T, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>>>, any, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<import("mongoose").ObtainDocumentType<any, T, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>>>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").Require_id<import("mongoose").FlatRecord<import("mongoose").ObtainDocumentType<any, T, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>>>> & {
    __v: number;
}>>;
