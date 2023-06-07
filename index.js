require('dotenv/config')

const { ApiPromise, WsProvider, Keyring } = require("@polkadot/api");
// import { KeyringPair } from '@polkadot/keyring/types';


function createApi(network = 'testnet') {
    let provider;
    switch (network) {
        case 'testnet': {
            provider = new WsProvider(process.env.WS);
            break;
        }
        case 'devnet': {
            provider = new WsProvider('wss://devnet.avail.tools/ws');
            break;
        }
        case 'local': {
            provider = new WsProvider('ws://127.0.0.1:9944');
            break;
        }
        default: {
            provider = new WsProvider(network);
        }
    }   

    return ApiPromise.create({
        noInitWarn: true,
        provider,
        rpc: {
            kate: {
                blockLength: {
                    description: "Get Block Length",
                    params: [
                        {
                            name: 'at',
                            type: 'Hash',
                            isOptional: true
                        }
                    ],
                    type: 'BlockLength'
                },
                queryProof: {
                    description: 'Generate the kate proof for the given `cells`',
                    params: [
                        {
                            name: 'cells',
                            type: 'Vec<Cell>'
                        },
                        {
                            name: 'at',
                            type: 'Hash',
                            isOptional: true
                        },
                    ],
                    type: 'Vec<u8>'
                },
                queryDataProof: {
                    description: 'Generate the data proof for the given `index`',
                    params: [
                        {
                            name: 'data_index',
                            type: 'u32'
                        },
                        {
                            name: 'at',
                            type: 'Hash',
                            isOptional: true
                        }
                    ],
                    type: 'DataProof'
                }
            }
        },
        types: {
            AppId: 'Compact<u32>',
            DataLookupIndexItem: {
                appId: 'AppId',
                start: 'Compact<u32>'
            },
            DataLookup: {
                size: 'Compact<u32>',
                index: 'Vec<DataLookupIndexItem>'
            },
            KateCommitment: {
                rows: 'Compact<u16>',
                cols: 'Compact<u16>',
                dataRoot: 'H256',
                commitment: 'Vec<u8>'
            },
            V1HeaderExtension: {
                commitment: 'KateCommitment',
                appLookup: 'DataLookup'
            },
            VTHeaderExtension: {
                newField: 'Vec<u8>',
                commitment: 'KateCommitment',
                appLookup: 'DataLookup'
            },
            HeaderExtension: {
                _enum: {
                    V1: 'V1HeaderExtension',
                    VTest: 'VTHeaderExtension'
                }
            },
            DaHeader: {
                parentHash: 'Hash',
                number: 'Compact<BlockNumber>',
                stateRoot: 'Hash',
                extrinsicsRoot: 'Hash',
                digest: 'Digest',
                extension: 'HeaderExtension'
            },
            Header: 'DaHeader',
            CheckAppIdExtra: {
                appId: 'AppId'
            },
            CheckAppIdTypes: {},
            CheckAppId: {
                extra: 'CheckAppIdExtra',
                types: 'CheckAppIdTypes'
            },
            BlockLength: {
                max: 'PerDispatchClass',
                cols: 'Compact<u32>',
                rows: 'Compact<u32>',
                chunkSize: 'Compact<u32>'
            },
            PerDispatchClass: {
                normal: 'u32',
                operational: 'u32',
                mandatory: 'u32'
            },
            DataProof: {
                root: 'H256',
                proof: 'Vec<H256>',
                numberOfLeaves: 'Compact<u32>',
                leaf_index: 'Compact<u32>',
                leaf: 'H256'
            },
            Cell: {
                row: 'u32',
                col: 'u32',
            }
        },
        signedExtensions: {
            CheckAppId: {
                extrinsic: {
                    appId: 'AppId'
                },
                payload: {}
            },
        },
    });
}

async function transfer({api, mnemonic, dest, amount, onResult }) {
    const keyring = new Keyring({ type: 'sr25519' });
    const account = keyring.addFromUri(mnemonic);
    let nonce = await api.rpc.system.accountNextIndex(account.address);
    const options = { app_id: 0, nonce: nonce };
    const multiplier = 1_000_000_000_000_000_000n;
    const amountInAVL = BigInt(amount) * multiplier;
    console.log(`Amount: ${amountInAVL} AVL`);
    const transfer = api.tx.balances.transfer(dest, amountInAVL);
    if (onResult) {
      return await transfer.signAndSend(account, options, onResult)
    } else {
      return await transfer.signAndSend(account, options)
    }
}

module.exports = {
    createApi,
    transfer
};

