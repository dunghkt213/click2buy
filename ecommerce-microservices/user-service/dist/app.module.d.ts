import { OnModuleInit } from '@nestjs/common';
import { Connection } from 'mongoose';
export declare class AppModule implements OnModuleInit {
    private readonly connection;
    constructor(connection: Connection);
    onModuleInit(): Promise<void>;
}
