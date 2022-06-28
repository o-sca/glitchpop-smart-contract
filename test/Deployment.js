const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Contract", function () {
  let ERC721Token;
  let contract;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function() {
    ERC721Token = await ethers.getContractFactory("Glitchpop");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    contract = await ERC721Token.deploy(
      "ipfs://test/",
      "Glitchpop",
      "GP",
      10000000000000000n,
      3,
      500,
      3,
      2200,
      3
    );
  })

  describe("Deployment", function () {
    
    it("The wallet that deployed the contract should be the rightful owner", async function() {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Owner will have the first token when deployed successfully", async function() {
      expect(await contract.ownerOf(1)).to.equal(owner.address);
    });

    it("Series of arguments passed through the constructor should match", async function() {
      expect(await contract.name()).to.equal("Glitchpop");
      expect(await contract.symbol()).to.equal("GP");
      expect(await contract.cost()).to.equal(10000000000000000n);
      expect(await contract.maxFreeMintsPerTx()).to.equal(3);
      expect(await contract.maxFreeSupply()).to.equal(500);
      expect(await contract.maxMintAmountPerTx()).to.equal(3);
      expect(await contract.maxSupply()).to.equal(2200);
      expect(await contract.maxPerWallet()).to.equal(3);
    });
  });
});
