'use client'
import { useEffect, useState } from "react";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { Account, PublicKey, Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { InputTransactionData } from "@aptos-labs/wallet-adapter-core";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";

const aptosConfig = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(aptosConfig);
const APTOS_COIN = "0x1::aptos_coin::AptosCoin";

export default function Home() {

  const { account, network, signAndSubmitTransaction } = useWallet();
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  // useEffect(() => {
  //   const fetchList = async () => {
  //     if (!account) return [];
  //     // change this to be your module account address
  //     const moduleAddress = "0xcbddf398841353776903dbab2fdaefc54f181d07e114ae818b1a67af28d1b018";
  //     try {
  //       const todoListResource = await aptos.getAccountResource(
  //         {
  //           accountAddress: account?.address,
  //           resourceType: `${moduleAddress}::todolist::TodoList`
  //         }
  //       );
  //       setAccountHasList(true);
  //     } catch (e: any) {
  //       setAccountHasList(false);
  //     }
  //   };

  //   fetchList();
  // }, [account?.address]);

  const [accountHasList, setAccountHasList] = useState<boolean>(false);

  const getBalance = async () => {
    if (account) {
      type Coin = { coin: { value: string } };

      const resource = await aptos.getAccountResource<Coin>({
        accountAddress: account.address,
        resourceType: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
      });

      setBalance(Number(resource.coin.value) / 100000000)
      setLoading(false)
    }
  }

  const getFaucet = async () => {
    if (account) {
      await aptos.fundAccount({
        accountAddress: account.address,
        amount: 100000000,
      });

      getBalance()
    }
  }

  useEffect(() => {
    getBalance()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balance, account])

  const sendTransaction = async () => {
    if (account) {
      const transaction = await aptos.transaction.build.simple({
        sender: account.address,
        data: {
          // All transactions on Aptos are implemented via smart contracts.
          function: "0x1::aptos_account::transfer",
          functionArguments: ['0x115c1e9c37f777226ec3230b78473ea401df6f2ea6f7229e0c1c71938e61f30d', 100],
        },
      });

      console.log("Built the transaction!")

      console.log("\n === 2. Simulating Response (Optional) === \n")
      const [userTransactionResponse] = await aptos.transaction.simulate.simple({
        signerPublicKey: account.publicKey as unknown as PublicKey,
        transaction,
      });
      console.log(userTransactionResponse)

      // 3. Sign
      console.log("\n=== 3. Signing transaction ===\n");
      const senderAuthenticator = aptos.transaction.sign({
        signer: account as unknown as Account,
        transaction,
      });
      console.log("Signed the transaction!")

      // 4. Submit
      console.log("\n=== 4. Submitting transaction ===\n");
      const submittedTransaction = await aptos.transaction.submit.simple({
        transaction,
        senderAuthenticator,
      });

      console.log(`Submitted transaction hash: ${submittedTransaction.hash}`);

      // 5. Wait for results
      console.log("\n=== 5. Waiting for result of transaction ===\n");
      const executedTransaction = await aptos.waitForTransaction({ transactionHash: submittedTransaction.hash });
      console.log(executedTransaction)
    }
  }

  const onSignAndSubmitTransaction = async () => {
    if (!account) return;
    const transaction: InputTransactionData = {
      sender: account.address,
      data: {
        function: "0x1::aptos_account::transfer_coins",
        typeArguments: [APTOS_COIN],
        functionArguments: ['', 1000], // 1 is in Octas
      },
    };
    try {
      const response = await signAndSubmitTransaction(transaction);
      await aptos.waitForTransaction({
        transactionHash: response.hash,
      });
      // toast({
      //   title: "Success",
      //   description: <TransactionHash hash={response.hash} network={network} />,
      // });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="h-[1000px] bg-white w-dvh flex flex-col items-center gap-5 m-5">
        <WalletSelector />
        {account && <div className="flex flex-col gap-5">
          <div id="action_button" className="flex items-center justify-center gap-1">
            <button onClick={() => getFaucet()} className="rounded-xl border bg-orange-300 p-3 hover:opacity-70 text-green-800">Faucet</button>
            <button onClick={() => onSignAndSubmitTransaction()} className="rounded-xl border bg-orange-300 p-3 hover:opacity-70 text-green-800">Send transaction</button>
          </div>
          <div id="accoutn-info">
            <p><b>Address:</b> {account.address}</p>
            <p><b>Balance:</b> {loading ? `loading...` : balance} APT</p>
            <p><b>PublicKey:</b> {account.publicKey}</p>
            <p><b>minKeysRequired:</b> {account.minKeysRequired}</p>
            <p><b>ansName:</b> {account.ansName}</p>
          </div>
        </div>
        }
      </div>
    </>
  );
}
