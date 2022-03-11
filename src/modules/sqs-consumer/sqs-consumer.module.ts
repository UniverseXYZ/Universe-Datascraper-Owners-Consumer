import { Module } from '@nestjs/common';
import { DalNFTTokenOwnersTaskModule } from '../Dal/dal-nft-token-owners-task/dal-nft-token-owners-task.module';
import { OwnersHandlerModule } from '../OwnersHandler/ownersHandler.module';
import { SqsConsumerService } from './sqs-consumer.service';

@Module({
  imports: [DalNFTTokenOwnersTaskModule, OwnersHandlerModule],
  providers: [SqsConsumerService],
  exports: [SqsConsumerService],
})
export class SqsConsumerModule {}
