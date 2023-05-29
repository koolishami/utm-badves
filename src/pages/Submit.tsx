import React from "react"
import { Upload } from "../components/Upload"
import { Contract } from "../utils/registry";

export const Submit: React.FC<{ senderAddress: string, contract: Contract, getContract: Function, fetchBalance: Function }> = ({ senderAddress, contract, getContract, fetchBalance }) => {
	return (
		<div className="my-5">
			<h5 className="fw-bold">Submit a Certificate</h5>
			<p>
				Users can register (upload) new certificates to the "Certificate
				Registry" smart contract on the Algorand blockchain decentralized network.
			</p>
			<p>
				Users must <b>Opt In</b> before they can upload certificate.
			</p>
			<div>
				<Upload id="certificateForUpload" senderAddress={senderAddress} contract={contract} getContract={getContract} fetchBalance={fetchBalance} />
			</div>
		</div>
	)
}
