import React, { useState } from "react"
import { toast } from "react-toastify";
import { Form, Button, Spinner } from "react-bootstrap"
import { sha3_256 } from "js-sha3"
import * as registry from "../utils/registry"

export const Upload: React.FC<{ id: string, senderAddress: string, contract: registry.Contract, getContract: Function, fetchBalance: Function }> = ({ id, senderAddress, contract, getContract, fetchBalance }) => {

	const [hash, setHash] = useState("");

	const [name, setName] = useState("");

	const dateAdded = Date.now().toString();

	const [loading, setLoading] = useState(false);

	function handleOnChange(file: any) {
		setName(file.name);
		var reader = new FileReader();
		reader.onload = function () {
			//@ts-ignore
			let documentHash = sha3_256(reader.result);
			setHash(documentHash)
		};
		reader.readAsBinaryString(file);
	}

	async function update() {
		await getContract();
		fetchBalance(senderAddress);
	}

	const optIn = async () => {
		setLoading(true);
		toast.loading(`Opting in to Registry`)
		registry.optIn(senderAddress)
			.then(() => {
				toast.dismiss()
				toast.success(`Opt in successfull`);
				setTimeout(() => {
					update();
				}, 2000);
			}).catch(error => {
				console.log({ error });
				toast.dismiss()
				toast.error("Failed to opt in");
			}).finally(() => {
				setLoading(false);
			});
	};

	const addDocument = async (doc: registry.Doc) => {
		setLoading(true);
		toast.loading(`Adding Document ${hash.toString().slice(0, 10)} to registry`)
		registry.addDoc(senderAddress, doc, contract)
			.then(() => {
				toast.dismiss()
				toast.success(`Document ${hash.toString().slice(0, 10)} added successfully.`);
				setTimeout(() => {
					update();
				}, 2000);
			}).catch(error => {
				console.log({ error });
				toast.dismiss()
				if (error.message.slice(-39) === "transaction rejected by ApprovalProgram") {
					toast.error(`Document ${hash.toString().slice(0, 10)} already exists on registry.`);
				} else {
					toast.error(`${error.message}`)
				}
			}).finally(() => {
				setLoading(false);
			});
	};


	const verifyDocument = async (doc: registry.Doc) => {
		toast.loading(`Checking registry for document ${hash.toString().slice(0, 10)}`)
		setLoading(true);
		registry.checkDoc(senderAddress, doc, contract)
			.then(() => {
				toast.dismiss()
				toast.success(`Document ${hash.toString().slice(0, 10)} is valid.`);
				fetchBalance(senderAddress);
			}).catch(error => {
				console.log({ error });
				toast.dismiss()
				if (error.message.slice(-39) === "transaction rejected by ApprovalProgram") {
					toast.error(`Document ${hash.toString().slice(0, 10)} is not valid.`);
				} else {
					toast.error(`${error.message}`)
				}
			}).finally(() => {
				setLoading(false);
			});
	};



	function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		if (!hash && !contract.userOptedIn && id === "documentForUpload") {
			optIn()
		} else if (!hash) {
			return;
		} else if (id === "documentToVerify") {
			verifyDocument({ name, hash })
		} else if (id === "documentForUpload") {
			let name_n_date = name + "-" + dateAdded;
			addDocument({ name: name_n_date, hash })
		} else {
			console.log("invalid ID")
		}
	}


	return (
		<Form onSubmit={onSubmit} className="mt-4">
			<Form.Group className="my-2">
				<Form.Control
					id={id}
					type="file"
					disabled={!contract.userOptedIn && id === "documentForUpload"}
					onChange={(e: any) => handleOnChange(e.target.files[0])}
				/>
			</Form.Group>
			<Button type="submit" variant="success" id={`${id}Button`}>
				{loading ?
					(<>
						<span> {id === "documentForUpload" ? contract.userOptedIn ? "Uploading" : "Opting in" : "Verifying"} </span>
						<Spinner animation="border" as="span" size="sm" role="status" aria-hidden="true" className="opacity-25" />
					</>)
					: id === "documentForUpload" ? contract.userOptedIn ? "Upload" : "Opt In" : "Check Document"
				}
			</Button>
		</Form>
	)
}
