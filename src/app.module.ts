import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/Infra/health/health.module';
import configuration from './modules/configuration';
import { DatabaseModule } from './modules/Infra/database/database.module';
import { EthereumModule } from './modules/Infra/ethereum/ethereum.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseService } from './modules/Infra/database/database.service';
import { SqsConsumerModule } from './modules/sqs-consumer/sqs-consumer.module';
import { DalNFTTokensModule } from './modules/Dal/dal-nft-token/dal-nft-token.module';
import { DalNFTTokenOwnersTaskModule } from './modules/Dal/dal-nft-token-owners-task/dal-nft-token-owners-task.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: false,
      ignoreEnvVars: false,
      isGlobal: true,
      load: [configuration],
    }),
    TerminusModule,
    MongooseModule.forRootAsync({
      imports: [DatabaseModule],
      useExisting: DatabaseService,
    }),
    HealthModule,
    EthereumModule,
    SqsConsumerModule,
    DalNFTTokensModule,
    DalNFTTokenOwnersTaskModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
