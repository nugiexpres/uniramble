import { ethers } from "ethers";
import { parse, stringify } from "envfile";
import * as fs from "fs";

const envFilePath = "./.env";

/**
 * Generate a new random private key and write it to the .env file
 * @param existingEnvConfig
 */
const setNewEnvConfig = (existingEnvConfig = {}) => {
  console.log("👛 Generating new Wallet");
  const randomWallet = ethers.Wallet.createRandom();

  const newEnvConfig = {
    ...existingEnvConfig,
    DEPLOYER_PRIVATE_KEY: randomWallet.privateKey,
    SALT: Date.now().toString(), // salt unik
  };

  // Store in .env
  fs.writeFileSync(envFilePath, stringify(newEnvConfig));
  console.log("📄 Private Key saved to packages/hardhat/.env file");
  console.log("🪄 Generated wallet address:", randomWallet.address);
  console.log("🧂 Generated salt:", newEnvConfig.SALT); // Log salt
};

async function main() {
  if (!fs.existsSync(envFilePath)) {
    // No .env file yet.
    setNewEnvConfig();
    return;
  }

  // .env file exists
  const existingEnvConfig = parse(fs.readFileSync(envFilePath).toString());
  if (existingEnvConfig.DEPLOYER_PRIVATE_KEY) {
    console.log("⚠️ You already have a deployer account. Check the packages/hardhat/.env file");
    return;
  }

  setNewEnvConfig(existingEnvConfig);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
