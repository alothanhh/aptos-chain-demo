'use client'
import { useEffect, useState } from "react";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { Account, PublicKey, Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { InputTransactionData } from "@aptos-labs/wallet-adapter-core";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { mint_nft } from "@/constant/constant";

const aptosConfig = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(aptosConfig);

type Tnft = {
  current_token_data: {
    current_collection: {
      collection_name: string,
      description: string,
      uri: string
    }
  }
}[]

export default function Home() {

  const { account, network, signAndSubmitTransaction } = useWallet();
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)

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

  const onSignAndSubmitTransaction = async () => {
    if (!account) return;
    const transaction: InputTransactionData = {
      sender: account.address,
      data: {
        function: `${mint_nft.publisher}::${mint_nft.module_name}::${mint_nft.fun}`,
        typeArguments: [],
        functionArguments: ['hihi', 'hihu', 'hoho'], // 1 is in Octas
      },
    };
    try {
      const response = await signAndSubmitTransaction(transaction);
      await aptos.waitForTransaction({
        transactionHash: response.hash,
      });

      getNft()
    } catch (error) {
      console.error(error);
    }
  };

  const [nfts, setListNfts] = useState<Tnft>([])

  const getNft = async () => {
    if (account) {
      const tokens = await aptos.getAccountOwnedTokens({ accountAddress: account.address });

      setListNfts(
        tokens as any
      )

    }
  }

  useEffect(() => {
    if (account) getNft()
  }, [account])

  return (
    <div className="min-h-dvh bg-black w-dvh flex flex-col items-center gap-5 m-auto">
      <div className="flex justify-end p-4 bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%0 w-full">
        <WalletSelector />
      </div>
      {account && <div className="flex flex-col pt-4 gap-10">
        <div id="action_button" className="flex items-center font-medium text-white justify-center gap-4">
          <button onClick={() => getFaucet()} className="rounded-xl font-medium text-white border bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3 hover:opacity-70">Faucet</button>
          <button onClick={() => onSignAndSubmitTransaction()} className="rounded-xl font-medium text-white border bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3 hover:opacity-70">Min NFT</button>
        </div>
        <div id="accoutn-info" className="text-white text-xl">
          <p><b>Address:</b> {account.address}</p>
          <p><b>Balance:</b> {loading ? `loading...` : balance} APT</p>
          <p><b>PublicKey:</b> {account.publicKey}</p>
        </div>
      </div>
      }
      <div className="grid grid-cols-2 gap-5 h-full">
        {
          nfts.length > 0 ? nfts.map((nft, index) => (<div className="flex justify-between flex-col w-[200px] h-[200px] p-5 text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:scale-110 duration-200" key={index}>
            <p className="w-full truncate">
              {nft.current_token_data.current_collection.collection_name}
            </p>
            <p className="w-full truncate">
              {nft.current_token_data.current_collection.description}
            </p>
            <p className="w-full truncate">
              {nft.current_token_data.current_collection.uri}
            </p>
          </div>)
          ) :
            <div>Empty</div>
        }

      </div>
    </div>
  );
}
