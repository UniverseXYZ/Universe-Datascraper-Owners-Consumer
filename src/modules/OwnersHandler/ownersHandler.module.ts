import { Module } from '@nestjs/common';
import { DalNFTErc1155TokenOwnerModule } from '../Dal/dal-nft-erc1155-token-owner/dal-nft-erc1155-token-owner.module';
import { DalNFTTokenOwnerModule } from '../Dal/dal-nft-token-owner/dal-nft-token-owner.module';
import { DalNFTTransferHistoryModule } from '../Dal/dal-nft-transfer-history/dal-nft-transfer-history.module';
import OwnersHandler from './ownersHandler.service';

@Module({
  imports: [
    DalNFTTransferHistoryModule,
    DalNFTTokenOwnerModule,
    DalNFTErc1155TokenOwnerModule,
  ],
  providers: [OwnersHandler],
  exports: [OwnersHandler],
})
export class OwnersHandlerModule {}
