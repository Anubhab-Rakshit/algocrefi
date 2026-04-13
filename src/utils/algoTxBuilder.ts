import algosdk from "algosdk";

const APP_ID = 758675636;
const APP_ACCOUNT = "DBYOKAGRPAPK6UPNTXB4WAIROK7KRXETIBAWAF4VVI6CPATIFHXM22INLM";
const USDC_ASSET_ID = 10458941;
const algodClient = new algosdk.Algodv2("", "https://testnet-api.algonode.cloud", 443);

async function getSuggestedParams() {
  return algodClient.getTransactionParams().do();
}

export async function buildOptInTx(walletAddress: string) {
  return algosdk.makeApplicationOptInTxnFromObject({
    sender: walletAddress,
    appIndex: APP_ID,
    suggestedParams: await getSuggestedParams(),
  });
}

export async function buildDepositTxGroup(walletAddress: string, amountMicroAlgo: number) {
  const suggestedParams = await getSuggestedParams();
  const depositMethod = algosdk.ABIMethod.fromSignature("deposit(uint64)uint64");
  const paymentTxnIndex = 0;

  const paymentTx = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: walletAddress,
    receiver: APP_ACCOUNT,
    amount: amountMicroAlgo,
    suggestedParams,
  });

  const depositAppCallTx = algosdk.makeApplicationNoOpTxnFromObject({
    sender: walletAddress,
    appIndex: APP_ID,
    appArgs: [depositMethod.getSelector(), algosdk.encodeUint64(paymentTxnIndex)],
    suggestedParams,
  });

  algosdk.assignGroupID([paymentTx, depositAppCallTx]);
  return [paymentTx, depositAppCallTx];
}

export async function buildWithdrawTx(walletAddress: string, shares: number) {
  const withdrawMethod = algosdk.ABIMethod.fromSignature("withdraw(uint64)uint64");
  return algosdk.makeApplicationNoOpTxnFromObject({
    sender: walletAddress,
    appIndex: APP_ID,
    appArgs: [withdrawMethod.getSelector(), algosdk.encodeUint64(shares)],
    suggestedParams: await getSuggestedParams(),
  });
}

export async function buildCollateralLoanGroup(
  walletAddress: string,
  _algoAmountMicro: number,
  _daysToRepay: number,
  requiredUsdcUnits: number
) {
  const suggestedParams = await getSuggestedParams();

  const usdcTx = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    sender: walletAddress,
    receiver: APP_ACCOUNT,
    assetIndex: USDC_ASSET_ID,
    amount: requiredUsdcUnits,
    suggestedParams,
  });

  const appCallTx = algosdk.makeApplicationNoOpTxnFromObject({
    sender: walletAddress,
    appIndex: APP_ID,
    foreignAssets: [USDC_ASSET_ID],
    suggestedParams,
  });

  algosdk.assignGroupID([usdcTx, appCallTx]);
  return [usdcTx, appCallTx];
}

export async function buildUnsecuredLoanTx(walletAddress: string, algoAmountMicro: number, daysToRepay: number) {
  return algosdk.makeApplicationNoOpTxnFromObject({
    sender: walletAddress,
    appIndex: APP_ID,
    suggestedParams: await getSuggestedParams(),
  });
}

export async function buildRepayGroup(walletAddress: string, dueAmountMicro: number) {
  const suggestedParams = await getSuggestedParams();
  const paymentTx = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: walletAddress,
    receiver: APP_ACCOUNT,
    amount: dueAmountMicro,
    suggestedParams,
  });

  const repayTx = algosdk.makeApplicationNoOpTxnFromObject({
    sender: walletAddress,
    appIndex: APP_ID,
    foreignAssets: [USDC_ASSET_ID],
    suggestedParams,
  });

  algosdk.assignGroupID([paymentTx, repayTx]);
  return [paymentTx, repayTx];
}

export { APP_ID, APP_ACCOUNT, USDC_ASSET_ID, algodClient };
