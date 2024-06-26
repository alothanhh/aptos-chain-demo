'use client'
import { useEffect, useState } from "react";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";

const aptosConfig = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(aptosConfig);

export default function Home() {

  const { account } = useWallet();

  console.log(account?.address)

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

  // async function example() {
  //   console.log(
  //     "This example will create two accounts (Alice and Bob), fund them, and transfer between them.",
  //   );

  // Setup the client
  // const config = new AptosConfig({ network: Network.TESTNET });
  // const aptos = new Aptos(config);

  // const alice: Account = Account.generate();

  // await aptos.fundAccount({
  //   accountAddress: alice.accountAddress,
  //   amount: 100000000,
  // });

  //   console.log("=== Addresses ===\n");
  //   console.log(`Alice's address is: ${alice.accountAddress}`);
  //   // console.log(`Bob's address is: ${bob.accountAddress}`);

  // }

  // useEffect(() => {
  //   example()
  // }, [])

  // const createAnAccount = async (aptos: Aptos) => {
  //   // Generate a new account key pair

  //   console.log(alice.accountAddress)

  //   // Fund the account on chain. Funding an account creates it on-chain.
  // }

  return (
    <>
      <div className="h-[1000px] bg-white w-dvh">
        <WalletSelector />
      </div>

    </>
  );
}
