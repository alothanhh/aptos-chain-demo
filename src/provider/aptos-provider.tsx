'use client'
import React, { ReactNode } from 'react';
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";

interface AptosProviderProps {
    children: ReactNode;
}

function AptosProvider({ children }: AptosProviderProps) {
    const wallets = [new PetraWallet()];

    return (
        <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
            {children}
        </AptosWalletAdapterProvider>
    );
}

export default AptosProvider;