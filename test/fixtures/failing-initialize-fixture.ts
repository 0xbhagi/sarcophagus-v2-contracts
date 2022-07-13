import { BigNumber } from "ethers";
import { solidityKeccak256 } from "ethers/lib/utils";
import { deployments } from "hardhat";
import { setupArchaeologists } from "./setup-archaeologists";

/**
 * A fixture to initialize the sarcophagus to set up a test that reqiures a
 * successful initialization. Not intended to be used for the actual
 * intializeSarcophagus tests.
 */
export const failingInitializeFixture = deployments.createFixture(
  async ({ deployments, getNamedAccounts, getUnnamedAccounts, ethers }) => {
    // Deploy contracts
    await deployments.fixture();

    // Get the entities interacting with the contracts
    const unnamedAccounts = await getUnnamedAccounts();
    const embalmer = await ethers.getSigner(unnamedAccounts[0]);
    const recipient = await ethers.getSigner(unnamedAccounts[1]);

    const diamond = await ethers.getContract("Diamond_DiamondProxy");
    const sarcoToken = await ethers.getContract("SarcoTokenMock");
    const embalmerFacet = await ethers.getContractAt("EmbalmerFacet", diamond.address);

    // Transfer 10,000 sarco tokens to each archaeologist to be put into free
    // bond
    await sarcoToken.transfer(embalmer.address, BigNumber.from(10_000));

    // Approve the archaeologist on the sarco token so transferFrom will work
    await sarcoToken.connect(embalmer).approve(diamond.address, ethers.constants.MaxUint256);

    // Set up the data for the sarcophagus
    const name = "Test Sarcophagus";
    const identifier = solidityKeccak256(["string"], ["unhashedIdentifier"]);
    const archaeologists = await setupArchaeologists();
    const arweaveArchaeologist = archaeologists[0];
    const canBeTransferred = true;
    // 1 week
    const resurrectionTime = BigNumber.from(Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7);
    const minShards = 2;

    const embalmerBalance = await sarcoToken.balanceOf(embalmer.address);

    return {
      identifier,
      sarcoToken,
      embalmer,
      archaeologists,
      arweaveArchaeologist,
      embalmerBalance,
      embalmerFacet,
      recipient,
      resurrectionTime,
      name,
      canBeTransferred,
      minShards,
    };
  }
);