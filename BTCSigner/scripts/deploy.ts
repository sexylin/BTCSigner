import { ethers } from "hardhat";

async function main() {
  const signerContract = await ethers.getContractFactory('BTCSigner');
  const btcSigner = await signerContract.deploy();
  console.log('Vigil deployed to:', await btcSigner.getAddress());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
