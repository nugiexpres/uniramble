import axios from "axios";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();

const SOURCIFY_API = process.env.SOURCIFY_API_KEY;

if (!SOURCIFY_API) {
  console.error("❌ SOURCIFY_API is not set in .env file");
  process.exit(1);
}

// Mapping chain names to their respective chain IDs
const CHAIN_IDS: Record<string, string> = {
  monadTestnet: "10143",
  ethereum: "1",
  goerli: "5",
  polygon: "137",
  mumbai: "80001",
};

async function verifySourcify(chainName: string, contractName: string, contractAddress: string) {
  console.log(`🔍 Verifying ${contractName} at ${contractAddress} on ${chainName} via Sourcify...`);

  const chainId = CHAIN_IDS[chainName];
  if (!chainId) {
    console.error(`❌ Unsupported chain: ${chainName}`);
    return;
  }

  const deploymentDir = path.join(__dirname, `../artifacts/contracts/${chainName}`);
  if (!fs.existsSync(deploymentDir)) {
    console.error(`❌ Deployment directory not found: ${deploymentDir}`);
    return;
  }

  const metadataPath = path.join(deploymentDir, `${contractName}.json`);
  if (!fs.existsSync(metadataPath)) {
    console.error(`❌ Metadata file not found for ${contractName} at: ${metadataPath}`);
    return;
  }

  const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));

  // Find the correct source file
  const sourceFile = Object.keys(metadata.sources).find(key => key.endsWith(`${contractName}.sol`));

  if (!sourceFile) {
    console.error(`❌ Source file for ${contractName}.sol not found in metadata.`);
    return;
  }

  const sourcePath = path.join(deploymentDir, metadata.sources[sourceFile]?.ast?.absolutePath || "");

  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Source file not found for ${contractName} at: ${sourcePath}`);
    return;
  }

  console.log(`✅ Metadata and source located for ${contractName}.`);

  const form = new FormData();
  form.append("address", contractAddress);
  form.append("chain", chainId);
  form.append("files", fs.createReadStream(metadataPath), "metadata.json");
  form.append("files", fs.createReadStream(sourcePath), path.basename(sourcePath));

  try {
    console.log(`🔍 Sending verification request for ${contractName}...`);
    const res = await axios.post(`${SOURCIFY_API}/verify`, form, {
      headers: form.getHeaders(),
    });

    if (res.status === 200 && res.data && res.data.status === "ok") {
      console.log(`✅ Successfully Verified ${contractName} on ${chainName} - Status: ${res.statusText}`);
    } else {
      console.error(`❌ Verification failed for ${contractName} on ${chainName}. Status: ${res.statusText}`);
      console.error(`Detailed response: ${JSON.stringify(res.data, null, 2)}`);
    }
  } catch (error: any) {
    console.error(`❌ Verification failed for ${contractName} on ${chainName}:`, error.response?.data || error.message);
  }
}

async function main() {
  console.log("🚀 Starting Sourcify verification script...");

  const chainName = process.argv[2];
  const contractName = process.argv[3];
  const contractAddress = process.argv[4];

  if (!chainName || !contractName || !contractAddress) {
    console.error("❌ Missing arguments. Usage: yarn verify:sourcify <chainName> <contractName> <contractAddress>");
    process.exit(1);
  }

  await verifySourcify(chainName, contractName, contractAddress);

  console.log("✅ Verification process completed.");
}

// eslint-disable-next-line prettier/prettier
main().catch((error) => {
  console.error("❌ An error occurred during script execution:", error);
});
