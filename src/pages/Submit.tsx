import React from "react"
import { Upload } from "../components/Upload"
import { Contract } from "../utils/registry";

export const Submit: React.FC<{ senderAddress: string, contract: Contract, getContract: Function, fetchBalance: Function }> = ({ senderAddress, contract, getContract, fetchBalance }) => {
	return (
		<div className="my-5">
			<h5 className="fw-bold">Submit a Document</h5>
			<p>
				Users can register (upload) new documents to the "Document
				Registry" smart contract on the Algorand blockchain decentralized network.
			</p>
			<p>
				Users must <b>Opt In</b> before they can upload document.
			</p>
			<div>
				<Upload id="documentForUpload" senderAddress={senderAddress} contract={contract} getContract={getContract} fetchBalance={fetchBalance} />
			</div>
		</div>
	)
}
