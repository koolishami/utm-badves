import React from "react"
import { Upload } from "../components/Upload"
import { Contract } from "../utils/registry";
import styles from "../Pages.module.css"

export const Submit: React.FC<{ senderAddress: string, contract: Contract, getContract: Function, fetchBalance: Function}> = ({ senderAddress, contract, getContract, fetchBalance }) => {
	
	return (
		<div className={styles.content}>
			<h1 className="fw-bold">Submit a Certificate</h1>
				<ul>
					<li><b className="fw-bold">Opt In</b> before uploading a certificate.</li>
					<li>User will be <b className="fw-bold">automatically created</b> with username, email, and NRIC/Passport No. as credentials.</li>
				</ul>
			<div>
				<Upload id="certificateForUpload" senderAddress={senderAddress} contract={contract} getContract={getContract} fetchBalance={fetchBalance} />
			</div>
		</div>
	)
}
