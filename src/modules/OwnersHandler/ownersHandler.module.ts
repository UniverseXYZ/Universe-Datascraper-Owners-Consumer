import { Module } from '@nestjs/common';
import { DalNFTTokenOwnerModule } from '../Dal/dal-nft-token-owner/dal-nft-token-owner.module';
import { DalNFTTransferHistoryModule } from '../Dal/dal-nft-transfer-history/dal-nft-transfer-history.module';
import OwnersHandler from './ownersHandler.service';

@Module({
  imports: [DalNFTTransferHistoryModule, DalNFTTokenOwnerModule],
  providers: [OwnersHandler],
  exports: [OwnersHandler],
})
export class OwnersHandlerModule {}
