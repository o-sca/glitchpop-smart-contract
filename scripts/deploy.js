const hre = require("hardhat");
const { sendWebhook } = require("./util.js");

const parseArgs = () => {
  let arguments = [];
  require("../arguments.js").forEach((arg) => {
    arguments.push(arg);
  });
  return arguments;
};

const getCurrentGas = async () => {
  return hre.ethers.utils.formatUnits(
    await hre.ethers.provider.getGasPrice(),
    "gwei"
  );
};

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log(
    "Account balance:",
    hre.ethers.utils.formatEther(await deployer.getBalance()).toString(),
    "ETH"
  );

  const ContractFactory = await hre.ethers.getContractFactory("NFT");

  const contract = await ContractFactory.deploy();

  await contract.deployed();

  const gasFees = await hre.ethers.provider.getFeeData();
  const receipt = await contract.deployTransaction.wait();
  const gasUsed = receipt.gasUsed.toString();

  const txFee =
    Number(gasUsed) *
    (gasFees.maxFeePerGas !== null
      ? hre.ethers.utils.formatUnits(gasFees.maxFeePerGas, "gwei")
      : hre.ethers.utils.formatUnits(gasFees.gasPrice, "ether"));

  let ctx = {
    contract: contract.deployTransaction.creates,
    hash: contract.deployTransaction.hash,
    txFee: txFee.toString(),
    gasLimit: contract.deployTransaction.gasLimit.toString(),
    gasUsed: gasUsed,
    chainId: contract.deployTransaction.chainId,
  };

  console.log(ctx);

  await sendWebhook(ctx);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    console.error(e.code);
    process.exit(1);
  });
