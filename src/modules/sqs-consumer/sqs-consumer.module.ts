import { Module } from '@nestjs/common';
import { DalNFTTokenOwnersTaskModule } from '../Dal/dal-nft-token-owners-task/dal-nft-token-owners-task.module';
import { EthereumModule } from '../Infra/ethereum/ethereum.module';
import { OwnersHandlerModule } from '../OwnersHandler/ownersHandler.module';
import { SqsConsumerService } from './sqs-consumer.service';

@Module({
  imports: [DalNFTTokenOwnersTaskModule, OwnersHandlerModule, EthereumModule],
  providers: [SqsConsumerService],
  exports: [SqsConsumerService],
})
export class SqsConsumerModule {}
