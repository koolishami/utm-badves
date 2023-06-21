import React from "react"
import { Upload } from "../components/Upload"
import styles from "../Pages.module.css"
import { Contract } from "../utils/registry";
import { UserAuth } from "../components/UserContext";

export const Verify: React.FC<{ senderAddress: string, contract: Contract, getContract: Function, fetchBalance: Function }> = ({ senderAddress, contract, getContract, fetchBalance }) => {
	const {isVerified} = UserAuth();

	return (
		<div className={styles.formContainer} >
			{!isVerified && (
				<>
					<h1>Verify a Certificate</h1>
					<p>Blockchain users can verify certificates with 0.1 Algos.</p>
				</>
			)}
			<Upload id="certificateToVerify" senderAddress={senderAddress} contract={contract} getContract={getContract} fetchBalance={fetchBalance} />
		</div>
	)
}
