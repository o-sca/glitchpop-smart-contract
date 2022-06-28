const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Glitchpop ERC721 Contract", function () {
  let ERC721Token;
  let contract;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
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
  });

  describe("Deployment", function () {
    it("The wallet that deployed the contract should be the rightful owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Owner will have the first token when deployed successfully", async function () {
      expect(await contract.ownerOf(1)).to.equal(owner.address);
    });

    it("Series of arguments passed through the constructor should match", async function () {
      expect(await contract.name()).to.equal("Glitchpop");
      expect(await contract.symbol()).to.equal("GP");
      expect(await contract.cost()).to.equal(10000000000000000n);
      expect(await contract.maxFreeMintsPerTx()).to.equal(3);
      expect(await contract.maxFreeSupply()).to.equal(500);
      expect(await contract.maxMintAmountPerTx()).to.equal(3);
      expect(await contract.maxSupply()).to.equal(2200);
      expect(await contract.maxPerWallet()).to.equal(3);
    });

    it("Contract should be set as paused when intially deployed", async function () {
      expect(await contract.paused()).to.equal(true);
    });

    it("TokenURI are concatenated properly", async function () {
      expect(await contract.tokenURI(1)).to.equal("ipfs://test/1.json");
    });
  });

  describe("Paused", function () {
    it("Mint should fail on paused contract", async function () {
      await expect(
        contract.connect(addr1).mint(3, { value: ethers.utils.parseEther("0") })
      ).to.be.revertedWith("The contract is paused!");
    });

    it("Any other signer except owner will fail on unpausing contract", async function () {
      await expect(contract.connect(addr2).setPaused()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("Owner unpausing contract should be successful", async function () {
      await expect(contract.setPaused()).to.not.be.reverted;
    });
  });

  describe("Free Mint", function () {
    it("Free mint will fail if exceeding 3 per tx", async function () {
      await contract.setPaused();
      await expect(
        contract.connect(addr2).mint(4, { value: ethers.utils.parseEther("0") })
      ).to.be.revertedWith("Exceeds free max per tx!");
    });

    it("Free mint should succeed if >= 3 per tx", async function () {
      await contract.setPaused();
      await contract
        .connect(addr1)
        .mint(3, { value: ethers.utils.parseEther("0") });
      const addr1Balance = await contract.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(3);
    });

    it("Free mint should fail when maxFreeSupply is OOS", async function () {
      await contract.setPaused();
      await contract.setMaxFreeSupply(0);
      await expect(contract.connect(addr1).mint(3)).to.be.reverted;
    });
  });

  describe("Paid Mint", function () {
    it("Paid mint will fail if exceeding 3 per tx", async function () {
      await contract.setPaused();
      await contract.setMaxFreeSupply(0);
      await expect(
        contract
          .connect(addr2)
          .mint(4, { value: ethers.utils.parseEther("0.04") })
      ).to.be.revertedWith("Exceeds max wallet limits!");
    });

    it("Paid mint should succeed when >= 3 per tx * cost", async function () {
      await contract.setPaused();
      await contract.setMaxFreeSupply(0);
      await contract
        .connect(addr1)
        .mint(3, { value: ethers.utils.parseEther("0.03") });
      const addr1Balance = await contract.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(3);
    });

    it("Mint should fail if address already minted 3 prior", async function () {
      await contract.setPaused();
      await contract.setMaxFreeSupply(0);
      await contract
        .connect(addr1)
        .mint(3, { value: ethers.utils.parseEther("0.03") });
      await expect(
        contract
          .connect(addr1)
          .mint(3, { value: ethers.utils.parseEther("0.03") })
      ).to.be.revertedWith("Exceeds max wallet limits!");
    });

    it("Mint should fail when maxSupply is OOS", async function () {
      await contract.setPaused();
      await contract.setMaxSupply(0);
      await expect(
        contract
          .connect(addr1)
          .mint(3, { value: ethers.utils.parseEther("0.03") })
      ).to.be.revertedWith("Max supply exceeded!");
    });
  });

  describe("Withrawing", function () {
    it("Withdrawing should revert if caller is not owner", async function () {
      await expect(contract.connect(addr1).withdraw()).to.be.reverted;
    });

    it("Withdrawing should succeed if caller is owner", async function() {
      await expect(contract.withdraw()).to.not.be.reverted;
    });
  });
});
