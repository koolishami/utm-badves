import algosdk from "algosdk";
import MyAlgoConnect from "@randlabs/myalgo-connect";
import { Contract } from "../utils/registry";

const config = {
  algodToken: "",
  algodServer: "	https://testnet-api.algonode.cloud",
  algodPort: "",
  indexerToken: "",
  indexerServer: "https://testnet-idx.algonode.cloud",
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
export const certRegistryNote = "certregistry:uv02";

// Maximum local storage allocation, immutable
export const numLocalInts = 0;
// Local variables stored as Int = 0
export const numLocalBytes = 16;
// Local variables stored as Bytes: cert hashes

// Maximum global storage allocation, immutable
export const numGlobalInts = 64;
// Global variables stored as Int: cert hashes add date
export const numGlobalBytes = 0;
// Global variables stored as Bytes = 0

// App ID
export const appId = 249055119;

export const contractTemplate: Contract = {
  appId: 0,
  appAddress: "TGNFBJBNRE6U25W2AEK4A54VM6NH46IETKZOXXMWXA66DIXNILSOIMACGQ",
  creatorAddress: "OQPYYI7ZZRBP5IGJECIN53EZEP2WGTFCUAGMT5FDCT2L2DAJMFZAL6MZYA",
  userOptedIn: false,
  totalCertificate: 0,
  userCertificates: [],
};