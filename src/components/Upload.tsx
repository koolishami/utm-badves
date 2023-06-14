import React, { useState, useEffect } from "react"
import { toast } from "react-toastify";
import { Form, Button, Spinner, Col, Row, Table } from "react-bootstrap"
import { sha3_256 } from "js-sha3"
import styles from "../Pages.module.css"
import * as registry from "../utils/registry"
import {
	ref,
	uploadBytes,
	getDownloadURL,
} from "firebase/storage";
import { auth, storage, db } from "../utils/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { UserAuth } from '../components/UserContext';
import { createUserWithEmailAndPassword } from "firebase/auth";

export const Upload: React.FC<{ id: string, senderAddress: string, contract: registry.Contract, getContract: Function, fetchBalance: Function }> = ({ id, senderAddress, contract, getContract, fetchBalance }) => {

	const [hash, setHash] = useState("");
	const [name, setName] = useState("");
	const dateAdded = Date.now().toString();
	const [loading, setLoading] = useState(false);
	const [fileUpload, setFileUpload] = useState(null);
	const [fileUrls, setFileUrls] = useState<string[]>([]);
	const [userData, setUserData] = useState(null);
	const currentYear = new Date().getFullYear(); // Get the current year

	const [formData, setFormData] = useState({
		name: "",
		username: "",
		email: "",
		nric: "",
		course: "",
		gradYear: currentYear.toString(),
		cgpa: "",
		transactionId: ""
	});

	const { logout, txid, setUserDataGlobal } = UserAuth();

	const uploadFile = () => {
		if (fileUpload == null) return;
		const fileRef = ref(storage, `certificates/${formData.username}/${name}`);
		uploadBytes(fileRef, fileUpload).then((snapshot) => {
			getDownloadURL(snapshot.ref).then((url) => {
				setFileUrls((prev) => [...prev, url]);
		  	});
		});
	}

	function handleOnChange(file: any) {
		setName(file.name);
		var reader = new FileReader();
		reader.onload = function () {
			//@ts-ignore
			let certificateHash = sha3_256(reader.result);
			setHash(certificateHash)
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

	const addCertficate = async (cert: registry.Cert) => {
		setLoading(true);
		toast.loading(`Adding Certificate ${hash.toString().slice(0, 10)} to registry`)
		registry.addCert(senderAddress, cert, contract)
			.then(async () => {
				toast.dismiss()
				toast.success(`Certificate ${hash.toString().slice(0, 10)} added successfully.`);
				// Store form data in Firestore
				try {
					console.log(formData)
					// Create a reference to the "graduates" collection
					const graduatesCollection = collection(db, "graduates");
					console.log(graduatesCollection)
					
					// Create a document reference using the username as the document ID
					const graduateDocRef = doc(graduatesCollection, formData.username);
					console.log(graduateDocRef)
					
					// Set the form data in the document
					await setDoc(graduateDocRef, {
						name: formData.name,
						username: formData.username,
						email: formData.email,
						nric: formData.nric,
						course: formData.course,
						gradYear: formData.gradYear,
						cgpa: formData.cgpa,
						transactionId: `https://testnet.algoexplorer.io/tx/${txid}`
					});
					toast.success("Form data stored successfully!");
					console.log("Form data stored successfully!");
				} catch (error) {
					toast.error("Error storing form data");
					console.error("Error storing form data:", error);
				}
				try {
					const email = formData.email;
					const password = formData.nric;
					
					// Create the user with email and password
					await createUserWithEmailAndPassword(auth, email, password);
					toast.success("User created successfully!");
					logout();
				} catch (error) {
					console.error("Error creating user:", error);
				}
				setTimeout(() => {
					update();
				}, 2000);
				uploadFile();
			}).catch(error => {
				console.log({ error });
				toast.dismiss()
				if (error.message.slice(-39) === "transaction rejected by ApprovalProgram") {
					toast.error(`Certificate ${hash.toString().slice(0, 10)} already exists on registry.`);
				} else {
					toast.error(`${error.message}`)
				}
			}).finally(() => {
				setLoading(false);
			});
	};


	const verifyCertificate = async (cert: registry.Cert) => {
		toast.loading(`Checking registry for certificate ${hash.toString().slice(0, 10)}`)
		setLoading(true);
		registry.checkCert (senderAddress, cert, contract)
			.then(() => {
				toast.dismiss()
				toast.success(`Certificate ${hash.toString().slice(0, 10)} is valid.`);
				toast.success("Showing graduate's information..");
				fetchBalance(senderAddress);
			}).catch(error => {
				console.log({ error });
				toast.dismiss()
				if (error.message.slice(-39) === "transaction rejected by ApprovalProgram") {
					toast.error(`Certificate ${hash.toString().slice(0, 10)} is not valid.`);
				} else {
					toast.error(`${error.message}`)
				}
			}).finally(() => {
				setLoading(false);
			});
	};

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		console.log(formData);
		e.preventDefault();
		if (!hash && !contract.userOptedIn && id === "certificateForUpload") {
			optIn()
		} else if (!hash) {
			return;
		} else if (id === "certificateToVerify") {
			verifyCertificate({ name, hash })
		} else if (id === "certificateForUpload") {
			let name_n_date = name + "-" + dateAdded;
			addCertficate({ name: name_n_date, hash })
		} else {
			console.log("invalid ID")
		}
	}

	const handleBack = async () => {
        try {
            setUserData(null); // Clear userData state
        } catch (error) {
            console.log(error);
          	toast.error("Something went wrong!");
        }
    };

	return (
		<>
			<Form onSubmit={onSubmit} className="mt-4">
				{id === "certificateForUpload" && (
					<>
						<Form.Group>
							<Form.Control 
								className="mb-2"
								type="text"
								placeholder="Name"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								required
							/>
							<Form.Control 
								className="mb-2"
								type="text"
								placeholder="Username"
								value={formData.username}
								onChange={(e) =>
									setFormData({ ...formData, username: e.target.value })
								}
								required
							/>
							<Form.Control
								className="mb-2"
								type="email"
								placeholder="Email"
								value={formData.email}
								onChange={(e) =>
									setFormData({ ...formData, email: e.target.value })
								}
								required
								pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" // Add email validation pattern
							/>
							<Form.Control
								className="mb-2"
								type="text"
								placeholder="NRIC/Passport No. (No '-' required)"
								value={formData.nric}
								onChange={(e) =>
									setFormData({ ...formData, nric: e.target.value })
								}
								required
							/>
							<Form.Select
								className="mb-2"
								value={formData.course}
								onChange={(e) =>
									setFormData({ ...formData, course: e.target.value })
								}
								required
							>
									<option value="">Select a course</option>
									<option value="Bachelor of Computer Science (Software Engineering) with Honors">
										Bachelor of Computer Science (Software Engineering) with Honors
									</option>
									<option value="Bachelor of Computer Science (Bioinformatics)">
										Bachelor of Computer Science (Bioinformatics)
									</option>
									<option value="Bachelor of Computer Science (Graphics and Multimedia Software) with Honors">
										Bachelor of Computer Science (Graphics and Multimedia Software) with Honors
									</option>
									<option value="Bachelor of Computer Science (Data Engineering)">
										Bachelor of Computer Science (Data Engineering)</option>
									<option value="Bachelor of Computer Science (Networks and Security) with Honors">
										Bachelor of Computer Science (Networks and Security) with Honors
									</option>
							</Form.Select>
							<Form.Control
								className="mb-2"
								type="text"
								placeholder="Graduation Year"
								value={formData.gradYear}
								onChange={(e) => {
									const numericValue = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    								setFormData({ ...formData, gradYear: numericValue });
								}}
								
								required
							/>
							<Form.Control
								className="mb-2"
								type="text"
								placeholder="CGPA"
								value={formData.cgpa}
								onChange={(e) =>
									setFormData({ ...formData, cgpa: e.target.value })
								}
								required
							/>
						</Form.Group>
					</>
				)}
				<Form.Group className="my-2">
					<Form.Control
						id={id}
						type="file"
						disabled={!contract.userOptedIn && id === "certificateForUpload"}
						onChange={(e: any) => {
							handleOnChange(e.target.files[0]);
							setFileUpload(e.target.files[0]);}}
					/>
				</Form.Group>
				<Button 
					bsPrefix="btnCustom"
					className={styles.btnCustom}
					type="submit"
					variant="default"
					id={`${id}Button`}>
					{loading ?
						(<>
							<span> {id === "certificateForUpload" ? contract.userOptedIn ? "Uploading" : "Opting in" : "Verifying"} </span>
							<Spinner animation="border" as="span" size="sm" role="status" aria-hidden="true" className="opacity-25" />
						</>)
						: id === "certificateForUpload" ? contract.userOptedIn ? "Upload" : "Opt In" : "Verify"
					}
				</Button>
			</Form>
		</>
	)
}
