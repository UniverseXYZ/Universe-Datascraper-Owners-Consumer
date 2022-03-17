import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DalNFTErc1155TokenOwnerService } from './dal-nft-erc1155-token-owner.service';
import {
  NFTErc1155TokenOwner,
  NFTErc1155TokenOwnerSchema,
} from './schemas/nft-erc1155-token-owner.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NFTErc1155TokenOwner.name, schema: NFTErc1155TokenOwnerSchema },
    ]),
  ],
  providers: [DalNFTErc1155TokenOwnerService],
  exports: [DalNFTErc1155TokenOwnerService],
})
export class DalNFTErc1155TokenOwnerModule {}
