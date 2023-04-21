// import createApi from '../index.js';
const { createApi } = require('../index.js');

test('connect to testnet node', async () => {
    const api = await createApi('testnet');
    const chain = await api.rpc.system.chain();
    expect(`${chain}`).toBe('Avail Testnet 03');
    await api.disconnect();
    // console.log(api.isConnected);
    // console.log(api.stats);
});

test('fetch latest testnet block', async () => {
    const api = await createApi('testnet');
    const block = await api.rpc.chain.getBlock();
    console.log('Latest block number: ', block.block.header.number.toNumber());
    expect(block).toBeDefined();
    await api.disconnect();
});

// TODO: Add test for transfer