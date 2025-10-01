import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://click2buy:click2buy@cluster0-shard-00-00.avgeqq9.mongodb.net:27017,cluster0-shard-00-01.avgeqq9.mongodb.net:27017,cluster0-shard-00-02.avgeqq9.mongodb.net:27017/click2buy?ssl=true&replicaSet=atlas-xxxx-shard-0&authSource=admin&retryWrites=true&w=majority',
    ),
  ],
})
export class AppModule {}
