import algosdk from "algosdk";
import MyAlgoConnect from "@randlabs/myalgo-connect";
import { Contract } from "../utils/registry";

const config = {
  algodToken: "",
  algodServer: "https://node.testnet.algoexplorerapi.io",
  algodPort: "",
  indexerToken: "",
  indexerServer: "https://algoindexer.testnet.algoexplorerapi.io",
  indexerPort: "",
};

export const algodClient = new algosdk.Algodv2(
  config.algodToken,
  config.algodServer,
  config.algodPort
);

export const indexerClient = new algosdk.Indexer(
  config.indexerToken,
  config.indexerServer,
  config.indexerPort
);

export const myAlgoConnect = new MyAlgoConnect();

export const minRound = 29556983;

// https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0002.md
export const docRegistryNote = "docregistry:uv01";

// Maximum local storage allocation, immutable
export const numLocalInts = 0;
// Local variables stored as Int = 0
export const numLocalBytes = 16;
// Local variables stored as Bytes: doc hashes

// Maximum global storage allocation, immutable
export const numGlobalInts = 64;
// Global variables stored as Int: doc hashes add date
export const numGlobalBytes = 0;
// Global variables stored as Bytes = 0

// App ID
export const appId = 115858618;

export const contractTemplate: Contract = {
  appId: 0,
  appAddress: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ",
  creatorAddress: "0",
  userOptedIn: false,
  totalDocument: 0,
  userDocuments: [],
};