import { Injectable, Logger } from '@nestjs/common';
import { SupportedTokenTypes } from 'datascraper-schema';
import { ethers } from 'ethers';
import R from 'ramda';
import { DalNFTTokenOwnerService } from '../Dal/dal-nft-token-owner/dal-nft-token-owner.service';
import { CreateNFTTokenOwnerDto } from '../Dal/dal-nft-token-owner/dto/create-nft-token-owner.dto';
import { DalNFTTransferHistoryService } from '../Dal/dal-nft-transfer-history/dal-nft-transfer-history.service';
import { TransferOwner } from './interfaces/types';

@Injectable()
export default class OwnersHandler {
  private readonly logger = new Logger(OwnersHandler.name);

  constructor(
    private readonly nftTokenOwnerService: DalNFTTokenOwnerService,
    private readonly nftTransferHistoryService: DalNFTTransferHistoryService,
  ) {}

  public async start(
    contractAddress: string,
    tokenId: string,
    tokenType: string,
  ) {
    this.logger.log(
      `Start processing contract: ${contractAddress} - tokenId: ${tokenId}`,
    );
    switch (tokenType) {
      case SupportedTokenTypes.CryptoPunks:
      case SupportedTokenTypes.ERC721:
        await this.handleERC721(contractAddress, tokenId, tokenType);
        break;
      case SupportedTokenTypes.ERC1155:
        await this.handleERC11511(contractAddress, tokenId);
        break;
      default:
        break;
    }
  }

  private async handleERC721(
    contractAddress: string,
    tokenId: string,
    tokenType: string,
  ) {
    const latestHistory =
      await this.nftTransferHistoryService.getLatestTransferBy(
        contractAddress,
        tokenId,
      );

    if (!latestHistory) {
      this.logger.log(
        `No latest history found. Skip processing contract: ${contractAddress} - tokenId: ${tokenId}`,
      );
      return;
    }

    const owner = {
      contractAddress,
      tokenId,
      tokenType,
      address: latestHistory.to,
      blockNumber: latestHistory.blockNum,
      transactionHash: latestHistory.hash,
      value: '1',
    } as CreateNFTTokenOwnerDto;

    await this.nftTokenOwnerService.upsertNFTTokenOwners([owner]);
  }

  private async handleERC11511(contractAddress: string, tokenId: string) {
    // remove all owners for this contract address and token id
    await this.nftTokenOwnerService.removeAllNFTTokenOwners(
      contractAddress,
      tokenId,
    );
    // get all from addresses and to addresses
    const histories =
      await this.nftTransferHistoryService.getAllTransferHistories(
        contractAddress,
        tokenId,
      );

    // compose owners:
    // all to address minus the value in their transactions
    // all from address plus the value in theri transactions
    const fromOwners: TransferOwner[] = histories.map((x) => ({
      contractAddress,
      tokenId,
      address: x.from,
      value: ethers.BigNumber.from(`-${x.erc1155Metadata.value}`).toString(),
      transactionHash: x.hash,
      blockNum: x.blockNum,
      tokenType: SupportedTokenTypes.ERC1155,
    }));

    const toOwners: TransferOwner[] = histories.map((x) => ({
      contractAddress,
      tokenId,
      address: x.to,
      value: ethers.BigNumber.from(x.erc1155Metadata.value).toString(),
      transactionHash: x.hash,
      blockNum: x.blockNum,
      tokenType: SupportedTokenTypes.ERC1155,
    }));

    // calculation:
    // sum up from and to address and sum up their values
    // from +1 and to -1
    const groupOwnersByAddress = R.groupBy<TransferOwner, string>(
      (x) => x.address,
    );

    const groupedOwners = groupOwnersByAddress([...fromOwners, ...toOwners]);

    const allAddresses = Object.keys(groupedOwners);

    const calculatingOwners = [] as TransferOwner[];
    for (const addr of allAddresses) {
      const blockNumbers = groupedOwners[addr].map((x) => x.blockNum);
      const maxBlockNumber = R.reduce(R.max, -Infinity, blockNumbers);
      const transactionHash = groupedOwners[addr].find(
        (x) => x.blockNum === maxBlockNumber,
      ).transactionHash;
      const sum = groupedOwners[addr]
        .map((x) => x.value)
        .reduce(
          (acc, v) => acc.add(ethers.BigNumber.from(v)),
          ethers.BigNumber.from(0),
        );

      calculatingOwners.push({
        contractAddress,
        tokenId,
        address: addr,
        value: sum.toString(),
        blockNum: maxBlockNumber,
        tokenType: SupportedTokenTypes.ERC1155,
        transactionHash,
      } as TransferOwner);
    }

    const currentOwners = calculatingOwners.filter((x) =>
      ethers.BigNumber.from(x.value).gt(ethers.BigNumber.from(0)),
    );

    await this.nftTokenOwnerService.upsertNFTTokenOwners(
      currentOwners.map((x) => ({
        contractAddress: x.contractAddress,
        tokenId: x.tokenId,
        address: x.address,
        value: x.value,
        blockNum: x.blockNum,
        tokenType: SupportedTokenTypes.ERC1155,
        transactionHash: x.transactionHash,
      })),
    );
  }
}
