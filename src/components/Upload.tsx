import React, { useState } from "react"
import { toast } from "react-toastify";
import { Form, Button, Spinner, Table, Image } from "react-bootstrap"
import { sha3_256 } from "js-sha3"
import styles from "../Pages.module.css"
import * as registry from "../utils/registry"
import {
	ref,
	uploadBytes,
	listAll,
	getDownloadURL
} from "firebase/storage";
import { auth, storage, db } from "../utils/firebase";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { UserAuth } from '../components/UserContext';
import { createUserWithEmailAndPassword } from "firebase/auth";
import QRCode from "qrcode";

export const Upload: React.FC<{ id: string, senderAddress: string, contract: registry.Contract, getContract: Function, fetchBalance: Function }> = ({ id, senderAddress, contract, getContract, fetchBalance }) => {

	const [hash, setHash] = useState("");
	const [name, setName] = useState("");
	const dateAdded = Date.now().toString();
	const [loading, setLoading] = useState(false);
	const [fileUpload, setFileUpload] = useState(null);
	const [addCertSuccess, setAddCertSuccess] = useState(false);
    const searchQuery = "";
	const currentYear = new Date().getFullYear(); // Get the current year

	const [formData, setFormData] = useState({
		name: "",
		username: "",
		email: "",
		nric: "",
		course: "",
		gradYear: currentYear.toString(),
		cgpa: ""
	});

	const { logout, isVerified, setIsVerified, userDataGlobalVerify, setUserDataGlobalVerify, qrCodeUrlVerified, setqrCodeUrlVerified } = UserAuth();

	const uploadFile = () => {
		if (fileUpload == null) return;
		const fileRef = ref(storage, `certificates/${formData.username}/${name}`);
		uploadBytes(fileRef, fileUpload);
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


	const generateQRCode = (qrcodeURL: string) => {
		QRCode.toDataURL(
			qrcodeURL,
			async (err, qrcodeData) => {
				if (err) {
					console.error(err);
					return;
				}
		
				try {
					// Convert the base64 data URL to a Blob
					const response = await fetch(qrcodeData);
					const blob = await response.blob();
		
					// Specify the path and filename for the uploaded QR code image
					const qrCodePath = `certificates/${formData.username}/qrCode-${formData.username}.png`;; // Adjust the filename and format as needed
			
					// Create a reference to the storage location
					const qrCodeRef = ref(storage, qrCodePath);
			
					// Upload the QR code image to Firebase Storage
					await uploadBytes(qrCodeRef, blob).then(() => {
						console.log('QR code image uploaded successfully!');
					})
				} catch (error) {
					console.error('Error uploading QR code image:', error);
				}
			}
		);
	};
	  

	const addCertficate = async (cert: registry.Cert) => {
		setLoading(true);
		toast.loading(`Adding Certificate ${hash.toString().slice(0, 10)} to registry`);

		try {
			const txId = await registry.addCert(senderAddress, cert, contract);
			console.log(txId);
			toast.dismiss();
			toast.success(`Certificate ${hash.toString().slice(0, 10)} added successfully.`);
			setAddCertSuccess(true);
			console.log(addCertSuccess);
			setTimeout(() => {
			update();
			}, 2000);

			// Store form data in Firestore
			try {
				console.log(formData);
				// Create a reference to the "graduates" collection
				const graduatesCollection = collection(db, "graduates");
				console.log(graduatesCollection);

				// Create a document reference using the username as the document ID
				const graduateDocRef = doc(graduatesCollection, formData.username);
				console.log(graduateDocRef);

				// Set the form data in the document
				await setDoc(graduateDocRef, {
					name: formData.name,
					username: formData.username,
					email: formData.email,
					nric: formData.nric,
					course: formData.course,
					gradYear: formData.gradYear,
					cgpa: formData.cgpa,
					transactionId: `https://testnet.algoexplorer.io/tx/${txId}`,
					fileHash: hash
				});

				const qrCodeData = `https://testnet.algoexplorer.io/tx/${txId}`;
				
				generateQRCode(qrCodeData);
				uploadFile();

				toast.success("Form data stored successfully!");
				console.log("Form data stored successfully!");
			} catch (error) {
				toast.error("Error storing form data.");
				console.error("Error storing form data:", error);
			}

			//Create user in Firebase Authentication
			try {
				const email = formData.email;
				const password = formData.nric;

				// Create the user with email and password
				await createUserWithEmailAndPassword(auth, email, password);
				toast.success("User created successfully!");
				logout();
			} catch (error) {
				toast.error("Error creating user.");
				console.error("Error creating user:", error);
			}
		} catch (error: any) {
			console.log({ error });
			setAddCertSuccess(false);
			toast.dismiss();
			if (error.message.slice(-39) === "transaction rejected by ApprovalProgram") {
			toast.error(`Certificate ${hash.toString().slice(0, 10)} already exists on registry.`);
			} else {
			toast.error(`${error.message}`);
			}
		} finally {
			setLoading(false);
		}
	};

	const verifyCertificate = async (cert: registry.Cert) => {
		toast.loading(`Checking registry for certificate ${hash.toString().slice(0, 10)}`);
		setLoading(true);
		
		if(senderAddress===""){
			toast.error(`Please connect your wallet before verifying`)
			return
		}
	
		await new Promise<void>((resolve, reject) => {
			registry.checkCert(senderAddress, cert, contract)
			.then(async () => {
				// Verification successful
				toast.dismiss();
				toast.success(`Certificate ${hash.toString().slice(0, 10)} is valid.`);
				toast.loading("Showing graduate's information");
				type SearchResult = {
					fileName: string;
					folderName: string;
					fileHash: string;
				};
				const certificatesRef = ref(storage, "certificates");
				const certificatesSnapshot = await listAll(certificatesRef);
				
				const searchResults = new Set<SearchResult>(); // Define the type for searchResults set
			
				const matchingFolders = certificatesSnapshot.prefixes.filter((folder) =>
					folder.name.toLowerCase().includes(searchQuery.toLowerCase())
				);

				if (matchingFolders.length === 0) {
					toast.error("User not found!");
					setLoading(false);
					return;
				}

				for (const folder of matchingFolders) {
					const folderFiles = await listAll(folder);
					folderFiles.items.forEach(async (file) => {
						const reader = new FileReader();
						reader.onload = function () {
							const fileContent = reader.result as string;
							const storedFileHash = sha3_256(fileContent).toString();
					
							const fileName = file.name.split('/').pop();
							if (fileName) {
								searchResults.add({ fileName, folderName: folder.name, fileHash: storedFileHash });
							}

							Array.from(searchResults).forEach(async (result: SearchResult) => {
								if (result.fileName === name || storedFileHash === hash) {
									const folderNameFound = result.folderName;
									try {
										const usersCollectionRef = collection(db, 'graduates');
										const querySnapshot  = await getDocs(usersCollectionRef);
						
										if (!querySnapshot.empty) {
											querySnapshot.forEach((doc) => {
											const docData = doc.data();
											if (docData.username === folderNameFound) {
												setUserDataGlobalVerify(docData);
												setIsVerified(true);
												toast.dismiss();

												getDownloadURL(ref(storage, `certificates/${folderNameFound}/qrCode-${folderNameFound}.png`))
													.then((url) => {
															// `url` is the download URL for '${folderNameFound}/qrCode.png'
															setqrCodeUrlVerified(url)
														})
														.catch((error) => {
															// Handle any errors
															toast.error("An error occured. Check console.")
															console.log(error.code)
														});
											}
											});
										} else {
										console.log('User data not found');
										}
									} catch (error) {
										toast.error("Authentication failed.")
									}
								}
							});
						};
						getDownloadURL(file).then((url) => {
							const xhr = new XMLHttpRequest();
							xhr.responseType = 'blob';
							xhr.onload = () => {
								reader.readAsBinaryString(xhr.response);
							};
							xhr.open('GET', url);
							xhr.send();
						});
					});
				}
				resolve();
			}).catch(error => {
				console.error('Certificate verification error:', error);
				toast.dismiss();
				if (error.message.slice(-39) === "transaction rejected by ApprovalProgram") {
					toast.error(`Certificate ${hash.toString().slice(0, 10)} is not valid.`);
				} else {
					toast.error(`${error.message}`);
				}
				setIsVerified(false); // Verification failed
				setLoading(false);
				console.log(error);
				reject();
			}).finally(() => {
				setLoading(false);
			})
		})
	};

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
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
			setUserDataGlobalVerify(null);
			setIsVerified(false);
        } catch (error) {
            console.log(error);
          	toast.error("Something went wrong!");
        }
    };

	return (
		<>
			<Form onSubmit={onSubmit}>
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
				{(id === "certificateForUpload" || (id === "certificateToVerify" && !isVerified)) || userDataGlobalVerify===null ? (
					<>
						<Form.Group>
							<Form.Control
								id={id}
								type="file"
								disabled={(!contract.userOptedIn && id === "certificateForUpload") || (senderAddress === "" && id === "certificateToVerify")}
								onChange={(e: any) => {
									handleOnChange(e.target.files[0]);
									setFileUpload(e.target.files[0]);
								} } />
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
									: id === "certificateForUpload" ? contract.userOptedIn ? "Upload" : "Opt In" : "Verify"}
						</Button>
					</>
				) : (
					<>
            			<h1>Verified Graduate's Information</h1>
						<div style={{ maxHeight: '350px', overflowY: 'auto' }}>
							<Table bordered responsive>
								<tbody>
									<tr className={styles.customRow}>
										<td className={styles.customLabel}>Email</td>
										<td className={styles.customData}>{userDataGlobalVerify.email}</td>
									</tr>
									<tr className={styles.customRow}>
										<td className={styles.customLabel}>Name</td>
										<td className={styles.customData}>{userDataGlobalVerify.name}</td>
									</tr>
									<tr className={styles.customRow}>
										<td className={styles.customLabel}>NRIC/Passport No.</td>
										<td className={styles.customData}>{userDataGlobalVerify.nric}</td>
									</tr>
									<tr className={styles.customRow}>
										<td className={styles.customLabel}>Course</td>
										<td className={styles.customData}>{userDataGlobalVerify.course}</td>
									</tr>
									<tr className={styles.customRow}>
										<td className={styles.customLabel}>Graduation Year</td>
										<td className={styles.customData}>{userDataGlobalVerify.gradYear}</td>
									</tr>
									<tr className={styles.customRow}>
										<td className={styles.customLabel}>CGPA</td>
										<td className={styles.customData}>{userDataGlobalVerify.cgpa}</td>
									</tr>
									<tr className={styles.customRow}>
										<td className={styles.customLabel}>Algorand Explorer Link</td>
										<td className={styles.customData}>
											<a href={userDataGlobalVerify.transactionId} target="_blank" rel="noopener noreferrer">
												{userDataGlobalVerify.transactionId}
											</a>
										</td>
									</tr>
									<tr className={styles.customRow}>
										<td className={styles.customLabel}>QR Code (Algorand Explorer Link)</td>
										<td className={styles.customData}>
											<Image src={qrCodeUrlVerified} fluid />
										</td>
									</tr>
								</tbody>
							</Table>
						</div>
						<Button 
							bsPrefix="btnCustom"
							className={styles.btnCustom}
							type="submit"
							variant="default"
							onClick={handleBack}>
								Back
						</Button> 
					</>
				)}
			</Form>
		</>
	)
}
