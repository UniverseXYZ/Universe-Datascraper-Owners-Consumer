# Universe Datascraper Token Owners Consumer

## Description

This consumer is to analyser transfer history for the given contract address and token id. And it then calculates the latest owners and store them.

It would be useful specifically for ERC1155

## Requirements:

- NodeJS version 14+
- NPM

## Required External Service

- AWS SQS
- Infura
- MongoDB

## Primary Third Party Libraries

- NestJS
- Mongoose (MongoDB)
- bbc/sqs-producer (Only applicable for producers)
- bbc/sqs-consumer (Only applicable for consumers)

## DataFlow

### Input Data

The token owners producer sends the messages that contain below parameters to this consumer. 
- Token type (Current supported): ERC721, ERC1155, CryptoPunks
- Contract address
- Token Id 
- MessageId(uuid generated)

### Data Analysis and Storage

- ERC721/CryptoPunks: Gets the latest block number and get the to address as latest owner.
- ERC1155: Gets the whole history and calculate the value for each address. Then it will get latest owners and values they own.


### Output

Store token owners to the database.

## MongoDB Collection Usage

This consumer leverage the following data collection in [schema](https://github.com/plugblockchain/Universe-Datascraper-Schema)
- NFT Collection Task: set task status in processing, split or error. 
- NFT Token Owners: store owners.  
- NFT Transfer Histories: fetch the histories.
- NFT Token Owners Task: to set task in processing and store error if happens.  
