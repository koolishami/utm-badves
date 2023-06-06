import React from "react"
import { Upload } from "../components/Upload"
import styles from "../Pages.module.css"
import { Contract } from "../utils/registry";

export const Verify: React.FC<{ senderAddress: string, contract: Contract, getContract: Function, fetchBalance: Function }> = ({ senderAddress, contract, getContract, fetchBalance }) => {
	return (
		<div className={styles.h1} >
			<h1>Verify a Certificate</h1>
			<p>
				Blockchain users can verify certificates by checking whether they exist in
				the "Certificate Registry" smart contract on the Algorand blockchain
				decentralized network.
			</p>
			<Upload id="certificateToVerify" senderAddress={senderAddress} contract={contract} getContract={getContract} fetchBalance={fetchBalance} />
		</div>
	)
}
