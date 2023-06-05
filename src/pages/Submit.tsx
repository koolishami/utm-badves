import React from "react"
import { Upload } from "../components/Upload"
import { Contract } from "../utils/registry";
import {
	ref,
	uploadBytes,
	getDownloadURL,
} from "firebase/storage";
import { storage } from "../utils/firebase";

export const Submit: React.FC<{ senderAddress: string, contract: Contract, getContract: Function, fetchBalance: Function }> = ({ senderAddress, contract, getContract, fetchBalance }) => {
	const [fileUpload, setFileUpload] = React.useState();
	
	return (
		<div className="my-5 text-center">
			<h1 className="fw-bold">Submit a Certificate</h1>
			<p>
				Admins can register (upload) new certificates to the "Certificate
				Registry" smart contract on the Algorand blockchain decentralized network.
			</p>
			<p>
				Admins must <b>Opt In</b> before they can upload certificate.
			</p>
			<div>
				<Upload id="certificateForUpload" senderAddress={senderAddress} contract={contract} getContract={getContract} fetchBalance={fetchBalance} />
			</div>
		</div>
	)
}
