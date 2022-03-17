import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateNFTErc1155TokenOwnerDto } from './dto/create-nft-erc1155-token-owner.dto';
import {
  NFTErc1155TokenOwner,
  NFTErc1155TokenOwnerDocument,
} from './schemas/nft-erc1155-token-owner.schema';

@Injectable()
export class DalNFTErc1155TokenOwnerService {
  private readonly logger = new Logger(DalNFTErc1155TokenOwnerService.name);
  constructor(
    @InjectModel(NFTErc1155TokenOwner.name)
    private readonly nftTokenOwnerModel: Model<NFTErc1155TokenOwnerDocument>,
  ) {}

  async upsertNFTTokenOwners(
    tokens: CreateNFTErc1155TokenOwnerDto[],
  ): Promise<void> {
    this.logger.log(`Bulk write ${tokens.length} token owners`);
    await this.nftTokenOwnerModel.bulkWrite(
      tokens.map((x) => ({
        updateOne: {
          filter: {
            contractAddress: x.contractAddress,
            tokenId: x.tokenId,
            address: x.address,
          },
          update: {
            ...x,
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );
  }

  async removeAllNFTTokenOwners(
    contractAddress: string,
    tokenId: string,
  ): Promise<void> {
    this.logger.log(
      `Remove all token owners for contract: ${contractAddress} - tokenId: ${tokenId}`,
    );
    await this.nftTokenOwnerModel.deleteMany({ contractAddress, tokenId });
  }
}
