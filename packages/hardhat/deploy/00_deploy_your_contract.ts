import { HardhatRuntimeEnvironment } from "hardhat/types";
import "hardhat-deploy";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  // const [deployerSigner] = await hre.ethers.getSigners();
  //  const deployer = deployerSigner.address;
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("PaymentGateway", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  const PaymentGatewayContract = await hre.deployments.get("PaymentGateway");

  await deploy("FoodNFT", {
    from: deployer,
    args: [PaymentGatewayContract.address],
    log: true,
    autoMine: true,
  });

  const foodNFTContract = await hre.deployments.get("FoodNFT");

  await deploy("ERC6551Registry", {
    from: deployer,
    log: true,
    autoMine: true,
  });

  await deploy("ERC6551Account", {
    from: deployer,
    log: true,
    autoMine: true,
  });

  // await deploy("Ingredient", {
  //   from: deployer,
  //   log: true,
  //   autoMine: true,
  // });

  const registryContract = await hre.deployments.get("ERC6551Registry");

  await deploy("BreadToken", {
    from: deployer,
    log: true,
    autoMine: true,
  });
  const BreadContract = await hre.deployments.get("BreadToken");

  await deploy("MeatToken", {
    from: deployer,
    log: true,
    autoMine: true,
  });
  const MeatContract = await hre.deployments.get("MeatToken");

  await deploy("LettuceToken", {
    from: deployer,
    log: true,
    autoMine: true,
  });
  const LettuceContract = await hre.deployments.get("LettuceToken");

  await deploy("CoinToken", {
    from: deployer,
    log: true,
    autoMine: true,
  });
  const CoinContract = await hre.deployments.get("CoinToken");

  await deploy("SpiceToken", {
    from: deployer,
    log: true,
    autoMine: true,
  });

  // Deploy the SpecialPass contract
  // const ChogNFTPass = await deploy("ChogNFTPass", {
  //  from: deployer,
  //  log: true,
  // });

  // Deploy the SpecialBox contract with SpecialPass and FoodNFT addresses as constructor arguments
  await deploy("SpecialBox", {
    from: deployer,
    args: [foodNFTContract.address], // FoodNFT contract addresses
    log: true,
  });
  const SpecialBoxContract = await hre.deployments.get("SpecialBox");

  // Deploy FaucetMon contract
  const faucetMon = await deploy("FaucetMon", {
    from: deployer,
    log: true,
  });

  console.log("FaucetMon deployed at:", faucetMon.address);

  // Deploy UnirambleMarketplace with the required constructor argument
  await deploy("UnirambleMarketplace", {
    from: deployer,
    args: [foodNFTContract.address], // Pass the FoodNFT contract address as the nftAddress
    log: true,
    autoMine: true,
  });
  const unirambleMarketplaceContract = await hre.deployments.get("UnirambleMarketplace");

  await deploy("ChefHelper", {
    from: deployer,
    log: true,
    autoMine: true,
  });
  const ChefHelperContract = await hre.deployments.get("ChefHelper");

  await deploy("IngredientOracle", {
    from: deployer,
    log: true,
    autoMine: true,
  });
  const IngredientOracleContract = await hre.deployments.get("IngredientOracle");

  await deploy("FoodScramble", {
    from: deployer,
    args: [
      deployer,
      registryContract.address,
      BreadContract.address,
      MeatContract.address,
      LettuceContract.address,
      CoinContract.address,
      foodNFTContract.address,
      SpecialBoxContract.address,
      faucetMon.address,
      unirambleMarketplaceContract.address,
      ChefHelperContract.address,
      IngredientOracleContract.address,
    ],
    log: true,
    autoMine: true,
  });
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["FoodNFT", "ERC6551Registry", "FoodScramble", "FaucetMon"];
