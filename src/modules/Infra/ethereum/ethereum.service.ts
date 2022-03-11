import { Injectable, Logger } from '@nestjs/common';
import { EthereumNetworkType } from './interface';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';

@Injectable()
export default class EthereumService {
  public ether: ethers.providers.BaseProvider;
  private readonly logger = new Logger(EthereumService.name);

  constructor(private configService: ConfigService) {
    const key = this.configService.get('ethereum_network');

    const projectSecret = this.configService.get('infura.project_secret');
    const projectId = this.configService.get('infura.project_id');

    if (!projectSecret || !projectId) {
      this.logger.log('Infura project id or secret is not defined');
      throw new Error('Infura project id or secret is not defined');
    }

    const ethersProvider = ethers.getDefaultProvider(EthereumNetworkType[key], {
      infura: {
        projectId,
      },
    });
    this.ether = ethersProvider;
  }

  getEther() {
    return this.ether;
  }
}
