const { task } = require("hardhat/config");

task("accounts", "Prints the list of accounts", require("./accounts"));
task("gas-price", "Prints gas price").setAction(async function ({ address }, { ethers }) {
    console.log("Gas price", (await ethers.provider.getGasPrice()).toString());
});

task("bytecode", "Prints bytecode").setAction(async function ({ address }, { ethers }) {
    console.log("Bytecode", await ethers.provider.getCode(address));
});

task("feeder:feed", "Feed").setAction(async function ({ feedDev }, { getNamedAccounts, ethers: { BigNumber }, getChainId }) {
    const { deployer, dev } = await getNamedAccounts();

    const feeder = new ethers.Wallet(process.env.FEEDER_PRIVATE_KEY, ethers.provider);

    await (
        await feeder.sendTransaction({
            to: deployer,
            value: BigNumber.from(1).mul(BigNumber.from(10).pow(18)),
        })
    ).wait();
});

task("feeder:return", "Return funds to feeder").setAction(async function ({ address }, { ethers: { getNamedSigners } }) {
    const { deployer, dev } = await getNamedSigners();

    await (
        await deployer.sendTransaction({
            to: process.env.FEEDER_PUBLIC_KEY,
            value: await deployer.getBalance(),
        })
    ).wait();

    await (
        await dev.sendTransaction({
            to: process.env.FEEDER_PUBLIC_KEY,
            value: await dev.getBalance(),
        })
    ).wait();
});

task("farm:dunePerBlock", "DuneDistributor: DunePerBlock").setAction(async function ({}, { ethers: { getNamedSigner, getContractFactory } }, runSuper) {
    const DuneDistributor = await getContractFactory("DuneDistributor");
    const duneDistributor = await DuneDistributor.attach("0xF69E3c9E83612A2F3Ba69020cE57b3b700E8D70dc840f2b6835F3C0585");
    const dunePerBlock = await duneDistributor.dunePerBlock();
    console.log(dunePerBlock.toString());
});

task("Distributor:add-pools", "DuneDistributor: Add pools").setAction(async function ({}, { ethers: { getNamedSigner, getContract } }, runSuper) {
    const farm = await getContract("DuneDistributor");
    const connectedFarm = await farm.connect(await getNamedSigner("deployer"));

    const factory = await getContract("DuneFactory");
    const duneFactory = factory.attach("0xF8E7FD32c5aeD1961252ef109709B19188be93D1")
    const connectedFactory = await factory.connect(await getNamedSigner("deployer"));
    
    const dune = "0xaC5487bFE2502eCc06e057912b6F4946471093b9";
    const rose = "0x5C78A65AD6D0eC6618788b6E8e211F31729111Ca";
    const usdt = "0xdC19A122e268128B5eE20366299fc7b5b199C8e3";
    const usdc = "0xE8A638b3B7565Ee7c5eb9755E58552aFc87b94DD";
    const eth = "0x3223f17957Ba502cbe71401D55A0DB26E5F7c68F";
    const wbtc = "0xd43ce0aa2a29DCb75bDb83085703dc589DE6C7eb";


    const dune_rose = await duneFactory.getPair(dune, rose);
    console.log(dune_rose,'dune_rose')
    
    const dune_usdt = await duneFactory.getPair(dune, usdt);
    console.log(dune_usdt,'dune_usdt')

    const rose_usdt = await duneFactory.getPair(rose, usdt);
    console.log(rose_usdt,'dune_usdt')

    const rose_eth = await duneFactory.getPair(rose, eth);
    console.log(rose_eth,'rose_eth')
    
    const rose_wbtc = await duneFactory.getPair(rose, wbtc);
    console.log(rose_wbtc,'rose_wbtc')
    
    const usdt_usdc = await duneFactory.getPair(usdt, usdc);
    console.log(usdt_usdc,'usdt_usdc')
    

    //single staking
    console.log(`Creating ROSE farm`);
    await (await connectedFarm.add("10", rose, "300", "15")).wait();

    //lp farms
    console.log(`Creating DUNE/ROSE farm`);
    await (await connectedFarm.add("200", dune_rose, "0", "15")).wait();

    console.log(`Creating DUNE/USDT farm`);
    await (await connectedFarm.add("60", dune_usdt, "0", "15")).wait();

    console.log(`Creating ROSE/USDT farm`);
    await (await connectedFarm.add("20", rose_usdt, "0", "15")).wait();

    console.log(`Creating ROSE/ETH farm`);
    await (await connectedFarm.add("20", rose_eth, "0", "15")).wait();

    console.log(`Creating ROSE/WBTC farm`);
    await (await connectedFarm.add("20", rose_wbtc, "0", "15")).wait();

    console.log(`Creating USDT/USDC farm`);
    await (await connectedFarm.add("5", usdt_usdc, "0", "15")).wait();
    
    
    
});

task("Factory:add-pairs", "DuneFactory: Add pairs").setAction(async function ({}, { ethers: { getNamedSigner, getContract } }, runSuper) {
    const factory = await getContract("DuneFactory");
    const connectedFactory = await factory.connect(await getNamedSigner("deployer"));

    const dune = "0xaC5487bFE2502eCc06e057912b6F4946471093b9";
    const rose = "0x5C78A65AD6D0eC6618788b6E8e211F31729111Ca";
    const usdt = "0xdC19A122e268128B5eE20366299fc7b5b199C8e3";
    const usdc = "0xE8A638b3B7565Ee7c5eb9755E58552aFc87b94DD";
    const eth = "0x3223f17957Ba502cbe71401D55A0DB26E5F7c68F";
    const wbtc = "0xd43ce0aa2a29DCb75bDb83085703dc589DE6C7eb";



    
    //DUNE/ROSE
    await (await connectedFactory.createPair(dune, rose)).wait();
    //DUNE/USDT
    await (await connectedFactory.createPair(dune, usdt)).wait();
    //ROSE/USDT
    await (await connectedFactory.createPair(rose, usdt)).wait();
    //ROSE/ETH
    await (await connectedFactory.createPair(rose, eth)).wait();
    //ROSE/WBTC
    await (await connectedFactory.createPair(rose, wbtc)).wait();
    //USDT/USDC
    await (await connectedFactory.createPair(usdt, usdc)).wait();
});


task("vault:add-pools", "DuneVault: Add pools").setAction(async function ({}, { ethers: { getNamedSigner, getContract } }, runSuper) {
    const farm = await getContract("DuneVault");
    const dune = "0xaC5487bFE2502eCc06e057912b6F4946471093b9";

    const connectedFarm = await farm.connect(await getNamedSigner("deployer"));

    console.log(`Creating Dune [0 days lockup pool].`);
    await (await connectedFarm.add("5", dune, "0", "15", "0")).wait();

    console.log(`Creating Dune [7 days lockup pool].`);
    await (await connectedFarm.add("25", dune, "0", "15", "604800")).wait();

    console.log(`Creating Dune [30 days lockup pool].`);
    await (await connectedFarm.add("70", dune, "0", "15", "2592000")).wait();
});

task("Factory:init", "DuneFactory: get init code hash").setAction(async function ({}, { ethers: { getNamedSigner, getContract } }, runSuper) {
    const factory = await getContract("DuneFactory");
    const connectedFactory = await factory.connect(await getNamedSigner("deployer"));

    console.log(await (await connectedFactory.INIT_CODE_PAIR_HASH()));
    
});
