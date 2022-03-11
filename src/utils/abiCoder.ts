import { AbiCoder } from 'ethers/lib/utils';

const abiCoder = new AbiCoder();

export const decodeAddress = (data: string) => {
  return abiCoder.decode(['address'], data)[0];
};
