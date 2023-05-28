import React, { useState } from "react"
import { Button, Spinner } from "react-bootstrap"
import { toast } from "react-toastify";
import { Contract, createContract } from "../utils/registry";
import { truncateAddress } from "../utils/conversions";

export const Home: React.FC<{ senderAddress: string, contract: Contract, fetchBalance: Function }> = ({ senderAddress, contract, fetchBalance }) => {
	const [loading, setLoading] = useState(false);

	const deployContract = async () => {
		toast.loading(`Deploying new Registry`)
		setLoading(true)
		await createContract(senderAddress)
			.then(() => {
				toast.dismiss();
				toast.success(`Contract created successfully`);
				fetchBalance(senderAddress);
			})
			.catch((error) => {
				console.log(error);
				toast.dismiss();
				toast.error("Failed to create contract.");
			});
		setLoading(false);
	}

	return (
		<div>
			<section id="viewHome" className="my-5">
				<h1>Document Registry</h1>
				Welcome to the "Document Registry" DApp. This decentralized app runs on
				the Algorand Blockchain network and holds a registry of documents in on chain.
				<ul>
					<li>
						The registry keeps the hashes of the documents along with their
						publish date.
					</li>
					<li>
						<b className="fw-bold">Users</b> can submit new documents
						to be stored on the blockchain.
					</li>
					<li>
						<b className="fw-bold">Users</b> can verify the existence of certain
						document in the registry.
					</li>
					<li>
						Contract <b className="fw-bold">address</b> (on Algo testnet):{" "}
						<a href={`https://testnet.algoexplorer.io/address/${contract.appId}`} id="contractLink" target="_blank" rel="noreferrer">
							{" "}
							{truncateAddress(contract.appAddress)}
						</a>
					</li>
					<li>
						Number of <b className="fw-bold">Documents</b> in registry:{" "}
						<b className="fw-bold">
							<a id="docsInRegistry" href="#docsInRegistry">
								{contract.totalDocument}
							</a>
						</b>{" "}
						Documents
					</li>
				</ul>
				{contract.appId === 0 ? (
					<Button variant="success" id="Button" onClick={() => deployContract()}>
						{loading ?
							(<>
								<span>Deploying...</span>
								<Spinner animation="border" as="span" size="sm" role="status" aria-hidden="true" className="opacity-25" />
							</>)
							: "Deploy new contract"
						}
					</Button>
				) : <></>
				}
			</section>
		</div>
	)
}
