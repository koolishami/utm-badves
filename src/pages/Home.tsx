import React, { useState } from "react"
import { Button, Spinner } from "react-bootstrap"
import { toast } from "react-toastify";
import { Contract, createContract } from "../utils/registry";
import { truncateAddress } from "../utils/conversions";
import styles from "../Pages.module.css"

export const Home: React.FC<{ senderAddress: string, contract: Contract, getContract: Function, fetchBalance: Function }> = ({ senderAddress, contract, getContract, fetchBalance }) => {
	const [loading, setLoading] = useState(false);

	const deployContract = async () => {
		toast.loading(`Deploying new Registry`)
		setLoading(true)
		await createContract(senderAddress)
			.then(() => {
				toast.dismiss();
				toast.success(`Contract created successfully`);
				getContract();
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
		<div className={styles.content}>
			<section id="viewHome" className="my-5">
				<h1>Certificate Registry</h1>
				Welcome to the "Certificate Registry" DApp. This decentralized app runs on
				the Algorand Blockchain network and holds a registry of certificates in on chain.
				<ul>
					<li>
						The registry keeps the hashes of the certificates along with their
						publish date.
					</li>
					<li>
						<b className="fw-bold">Admin</b> can submit new certificates
						to be stored on the blockchain.
					</li>
					<li>
						<b className="fw-bold">Blockchain users</b> can verify the existence of certain
						certificate in the registry.
					</li>
					<li>
						Contract <b className="fw-bold">address</b> (on Algo testnet):{" "}
						<a href={`https://goalseeker.purestake.io/algorand/testnet/application/${contract.appId}`} id="contractLink" target="_blank" rel="noreferrer">
							{" "}
							{truncateAddress(contract.appAddress)}
						</a>
					</li>
					<li>
						Number of <b className="fw-bold">Documents</b> in registry:{" "}
						<b className="fw-bold">
							<a id="docsInRegistry" href="#docsInRegistry">
								{contract.totalCertificate}
							</a>
						</b>{" "}
						Documents
					</li>
				</ul>
				{contract.appId === 0 ? (
					<Button className={styles.btn} variant="success" id="Button" onClick={() => deployContract()}>
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
