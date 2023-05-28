import algosdk from "algosdk";
import * as algo from "./constants";
/* eslint import/no-webpack-loader-syntax: off */
import approvalProgram from "!raw-loader!../contracts/certificate_contract_approval.teal";
import clearProgram from "!raw-loader!../contracts/certificate_contract_clear.teal";

export interface Doc {
    name: string;
    hash: string;
}

export interface Contract {
    appId: number;
    appAddress: string;
    creatorAddress: string;
    userOptedIn: boolean;
    totalDocument: number;
    userDocuments: any[];
}

// Compile smart contract in .teal format to program
const compileProgram = async (programSource: any) => {
    let encoder = new TextEncoder();
    let programBytes = encoder.encode(programSource);
    let compileResponse = await algo.algodClient.compile(programBytes).do();
    return new Uint8Array(Buffer.from(compileResponse.result, "base64"));
};

// CREATE Contract: ApplicationCreateTxn
export const createContract = async (senderAddress: string) => {
    console.log("Deploying new doc reg application...");
    let params = await algo.algodClient.getTransactionParams().do();
    // Compile programs
    const compiledApprovalProgram = await compileProgram(approvalProgram);
    const compiledClearProgram = await compileProgram(clearProgram);

    // Build note to identify transaction later and required app args as Uint8Arrays
    let note = new TextEncoder().encode(algo.docRegistryNote);

    // Create ApplicationCreateTxn
    let txn = algosdk.makeApplicationCreateTxnFromObject({
        from: senderAddress,
        suggestedParams: params,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        approvalProgram: compiledApprovalProgram,
        clearProgram: compiledClearProgram,
        numLocalInts: algo.numLocalInts,
        numLocalByteSlices: algo.numLocalBytes,
        numGlobalInts: algo.numGlobalInts,
        numGlobalByteSlices: algo.numGlobalBytes,
        note: note,
    });

    // Get transaction ID
    let txId = txn.txID().toString();

    // Sign & submit the transaction
    let signedTxn = await algo.myAlgoConnect.signTransaction(txn.toByte());
    console.log("Signed transaction with txID: %s", txId);
    await algo.algodClient.sendRawTransaction(signedTxn.blob).do();

    // Wait for transaction to be confirmed
    let confirmedTxn = await algosdk.waitForConfirmation(algo.algodClient, txId, 4);

    // Get the completed Transaction
    console.log(
        "Transaction " +
        txId +
        " confirmed in round " +
        confirmedTxn["confirmed-round"]
    );

    // Get created application id and notify about completion
    let transactionResponse = await algo.algodClient
        .pendingTransactionInformation(txId)
        .do();
    let appId = transactionResponse["application-index"];
    console.log("Created new app-id: ", appId);
    return appId;
};

// OPT-IN: opt_in_call
export const optIn = async (senderAddress: string) => {
    console.log("Opting in to contract......");

    if (algo.appId === Number(0)) return

    let params = await algo.algodClient.getTransactionParams().do();

    // Create ApplicationOptIn Transaction
    let txn = algosdk.makeApplicationOptInTxnFromObject({
        from: senderAddress,
        suggestedParams: params,
        appIndex: algo.appId,
    });

    // Get transaction ID
    let txId = txn.txID().toString();

    // Sign & submit the transaction
    let signedTxn = await algo.myAlgoConnect.signTransaction(txn.toByte());
    console.log("Signed transaction with txID: %s", txId);
    await algo.algodClient.sendRawTransaction(signedTxn.blob).do();

    // Wait for transaction to be confirmed
    const confirmedTxn = await algosdk.waitForConfirmation(
        algo.algodClient,
        txId,
        4
    );

    // Get the completed Transaction
    console.log(
        "Transaction " +
        txId +
        " confirmed in round " +
        confirmedTxn["confirmed-round"]
    );
    // display results
    let transactionResponse = await algo.algodClient
        .pendingTransactionInformation(txId)
        .do();
    console.log("Opted-in to app-id:", transactionResponse["txn"]["txn"]["apid"]);
};

// ADD DOCUMENT: Group transaction consisting of ApplicationCallTxn and PaymentTxn
export const addDoc = async (senderAddress: string, doc: Doc, contract: Contract) => {
    console.log("Adding document...");

    if (algo.appId === Number(0)) return

    let params = await algo.algodClient.getTransactionParams().do();

    // Build required app args as Uint8Array
    let addArg = new TextEncoder().encode("add");
    let docNameArg = new TextEncoder().encode(doc.name);
    let docHashArg = new TextEncoder().encode(doc.hash);
    let appArgs = [addArg, docNameArg, docHashArg];

    // Create ApplicationCallTxn
    let appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        from: senderAddress,
        appIndex: algo.appId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        suggestedParams: params,
        appArgs: appArgs,
    });

    // Create PaymentTxn
    let paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: senderAddress,
        to: contract.creatorAddress,
        amount: 1000000,
        suggestedParams: params,
    });

    let txnArray = [appCallTxn, paymentTxn];

    // Create group transaction out of previously build transactions
    let groupID = algosdk.computeGroupID(txnArray);
    for (let i = 0; i < 2; i++) txnArray[i].group = groupID;

    // Sign & submit the group transaction
    let signedTxn = await algo.myAlgoConnect.signTransaction(
        txnArray.map((txn) => txn.toByte())
    );
    console.log("Signed group transaction");
    let tx = await algo.algodClient
        .sendRawTransaction(signedTxn.map((txn) => txn.blob))
        .do();

    // Wait for group transaction to be confirmed
    let confirmedTxn = await algosdk.waitForConfirmation(algo.algodClient, tx.txId, 4);

    // Notify about completion
    console.log(
        "Group transaction " +
        tx.txId +
        " confirmed in round " +
        confirmedTxn["confirmed-round"]
    );
};


// CHECK DOCUMENT: Group transaction consisting of ApplicationCallTxn and PaymentTxn
export const checkDoc = async (senderAddress: string, doc: Doc, contract: Contract) => {
    console.log("Checking document...");

    if (algo.appId === Number(0)) return

    let params = await algo.algodClient.getTransactionParams().do();

    // Build required app args as Uint8Array
    let addArg = new TextEncoder().encode("check");
    let docHashArg = new TextEncoder().encode(doc.hash);
    let appArgs = [addArg, docHashArg];

    // Create ApplicationCallTxn
    let appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        from: senderAddress,
        appIndex: algo.appId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        suggestedParams: params,
        appArgs: appArgs,
    });

    // Create PaymentTxn
    let paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: senderAddress,
        to: contract.creatorAddress,
        amount: 100000,
        suggestedParams: params,
    });

    let txnArray = [appCallTxn, paymentTxn];

    // Create group transaction out of previously build transactions
    let groupID = algosdk.computeGroupID(txnArray);
    for (let i = 0; i < 2; i++) txnArray[i].group = groupID;

    // Sign & submit the group transaction
    let signedTxn = await algo.myAlgoConnect.signTransaction(
        txnArray.map((txn) => txn.toByte())
    );
    console.log("Signed group transaction");
    let tx = await algo.algodClient
        .sendRawTransaction(signedTxn.map((txn) => txn.blob))
        .do();

    // Wait for group transaction to be confirmed
    let confirmedTxn = await algosdk.waitForConfirmation(algo.algodClient, tx.txId, 4);

    // Notify about completion
    console.log(
        "Group transaction " +
        tx.txId +
        " confirmed in round " +
        confirmedTxn["confirmed-round"]
    );
};

// DELETING DOCUMENT:  ApplicationCallTxn
export const deleteDoc = async (senderAddress: string, key: string) => {
    console.log("Deleting document...");

    if (algo.appId === Number(0)) return

    let params = await algo.algodClient.getTransactionParams().do();

    // Build required app args as Uint8Array
    let deleteArg = new TextEncoder().encode("delete");
    let name = new TextEncoder().encode(key);
    let appArgs = [deleteArg, name];

    // Create ApplicationCallTxn
    let appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        from: senderAddress,
        appIndex: algo.appId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        suggestedParams: params,
        appArgs: appArgs,
    });

    // Get transaction ID
    let txId = appCallTxn.txID().toString();

    // Sign & submit the transaction
    let signedTxn = await algo.myAlgoConnect.signTransaction(appCallTxn.toByte());
    console.log("Signed transaction with txID: %s", txId);
    await algo.algodClient.sendRawTransaction(signedTxn.blob).do();

    // Wait for group transaction to be confirmed
    let confirmedTxn = await algosdk.waitForConfirmation(algo.algodClient, txId, 4);

    // Notify about completion
    console.log(
        "Group transaction " +
        txId +
        " confirmed in round " +
        confirmedTxn["confirmed-round"]
    );
};

// DELETE Contract:
export const deleteContract = async (senderAddress: string) => {
    console.log("Deleting application");

    if (algo.appId === Number(0)) return

    let params = await algo.algodClient.getTransactionParams().do();

    // Create ApplicationDeleteTxn
    let txn = algosdk.makeApplicationDeleteTxnFromObject({
        from: senderAddress,
        suggestedParams: params,
        appIndex: algo.appId,
    });

    // Get transaction ID
    let txId = txn.txID().toString();

    // Sign & submit the transaction
    let signedTxn = await algo.myAlgoConnect.signTransaction(txn.toByte());
    console.log("Signed transaction with txID: %s", txId);
    await algo.algodClient.sendRawTransaction(signedTxn.blob).do();

    // Wait for transaction to be confirmed
    const confirmedTxn = await algosdk.waitForConfirmation(
        algo.algodClient,
        txId,
        4
    );

    // Get the completed Transaction
    console.log(
        "Transaction " +
        txId +
        " confirmed in round " +
        confirmedTxn["confirmed-round"]
    );

    // Get application id of deleted application and notify about completion
    let transactionResponse = await algo.algodClient
        .pendingTransactionInformation(txId)
        .do();
    let appId = transactionResponse["txn"]["txn"].apid;
    console.log("Deleted app-id: ", appId);
};

export const getContractData = async (senderAddress: string) => {

    console.log("Getting Registry Data...");

    let contract: Contract = algo.contractTemplate;

    if (algo.appId === Number(0)) return contract

    // Step 2: Get Registry application by application id
    let contract_ = await getApplication(algo.appId, senderAddress);

    if (contract_) {
        contract = contract_;
    }
    console.log("Registry data Fetched...");
    return contract;
};

const getApplication = async (appId: number, senderAddress: string) => {
    try {
        // 1. Get application by appId
        let response = await algo.indexerClient
            .lookupApplications(appId)
            .includeAll(true)
            .do();
        if (response.application.deleted) {
            return null;
        }
        let globalState = response.application.params["global-state"];

        // 2. Parse fields of response and return proposal
        let appAddress = algosdk.getApplicationAddress(appId);
        let creatorAddress = response.application.params.creator;
        let userOptedIn = false;
        let totalDocument = 0;
        let userDocuments = [];

        if (globalState) {
            totalDocument = globalState.length
        }

        let userInfo = await algo.indexerClient
            .lookupAccountAppLocalStates(senderAddress)
            .do();

        let appLocalState = userInfo["apps-local-states"];
        for (let i = 0; i < appLocalState.length; i++) {
            if (appId === appLocalState[i]["id"]) {
                userOptedIn = true;
                userDocuments = appLocalState[i]["key-value"];
            }
        }
        return {
            appId,
            appAddress,
            creatorAddress,
            userOptedIn,
            totalDocument,
            userDocuments,
        };
    } catch (err) {
        return null;
    }
};
