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
import { storage } from "../utils/firebase";
import { UserAuth } from '../components/UserContext';

export const Upload: React.FC<{ id: string, senderAddress: string, contract: registry.Contract, getContract: Function, fetchBalance: Function }> = ({ id, senderAddress, contract, getContract, fetchBalance }) => {

	const [hash, setHash] = useState("");
	const [name, setName] = useState("");
	const dateAdded = Date.now().toString();
	const [loading, setLoading] = useState(false);
	const [fileUpload, setFileUpload] = useState(null);
	const [fileUrls, setFileUrls] = useState<string[]>([]);
	const [userData, setUserData] = useState(null);

	const [formData, setFormData] = useState({
		name: "",
		email: "",
		matrixNum: "",
		course: "",
		gradYear: "",
		cgpa: ""
	});

    const { userDataGlobal, user } = UserAuth();

	const uploadFile = () => {
		if (fileUpload == null) return;
		const fileRef = ref(storage, `certificates/${name}`);
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
			.then(() => {
				toast.dismiss()
				toast.success(`Certificate ${hash.toString().slice(0, 10)} added successfully.`);
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


	function onSubmit(e: React.FormEvent<HTMLFormElement>) {
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
				<Form.Group className="my-2">
					<Form.Control
						type="text"
						placeholder="Name"
						value={formData.name}
						onChange={(e) =>
							setFormData({ ...formData, name: e.target.value })
						}
						required
						/>
				</Form.Group>
				<Form.Group className="my-2">
						<Form.Control
						type="email"
						placeholder="Email"
						value={formData.email}
						onChange={(e) =>
							setFormData({ ...formData, email: e.target.value })
						}
						required
						/>
				</Form.Group>
				<Form.Group className="my-2">
						<Form.Control
						type="text"
						placeholder="Matrix Number"
						value={formData.matrixNum}
						onChange={(e) =>
							setFormData({ ...formData, matrixNum: e.target.value })
						}
						required
						/>
				</Form.Group>
				<Form.Group className="my-2">
						<Form.Control
						type="text"
						placeholder="Course"
						value={formData.course}
						onChange={(e) =>
							setFormData({ ...formData, course: e.target.value })
						}
						required
						/>
				</Form.Group>
				<Form.Group className="my-2">
						<Form.Control
						type="text"
						placeholder="Graduation Year"
						value={formData.gradYear}
						onChange={(e) =>
							setFormData({ ...formData, gradYear: e.target.value })
						}
						required
						/>
				</Form.Group>
				<Form.Group className="my-2">
						<Form.Control
						type="text"
						placeholder="CGPA"
						value={formData.cgpa}
						onChange={(e) =>
							setFormData({ ...formData, cgpa: e.target.value })
						}
						required
						/>
				</Form.Group>
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
			{/* {userData && (
                <div>
                    <h1>Welcome, {userData.username}!</h1>
					<Table bordered responsive className={styles.customTable}>
                        <tbody>
                            <tr className={styles.customRow}>
                                <td className={styles.customLabel}>Email</td>
                                <td className={styles.customData}>{userData.email}</td>
                            </tr>
                            <tr className={styles.customRow}>
                                <td className={styles.customLabel}>Name</td>
                                <td className={styles.customData}>{userData.name}</td>
                            </tr>
                            <tr className={styles.customRow}>
                                <td className={styles.customLabel}>Matrix Num</td>
                                <td className={styles.customData}>{userData.matrixNum}</td>
                            </tr>
                            <tr className={styles.customRow}>
                                <td className={styles.customLabel}>Course</td>
                                <td className={styles.customData}>{userData.course}</td>
                            </tr>
                            <tr className={styles.customRow}>
                                <td className={styles.customLabel}>Graduation Year</td>
                                <td className={styles.customData}>{userData.gradyear}</td>
                            </tr>
                            <tr className={styles.customRow}>
                                <td className={styles.customLabel}>CGPA</td>
                                <td className={styles.customData}>{userData.cgpa}</td>
                            </tr>
                            <tr className={styles.customRow}>
                                <td className={styles.customLabel}>Algorand Explorer Link</td>
                                <td className={styles.customData}>email@example.com</td>
                            </tr>
                        </tbody>
                    </Table>
                    <Button 
                        bsPrefix="btnCustom"
                        className={styles.btnCustom}
                        type="submit"
                        variant="default"
                        onClick={handleBack}>
                            Back
                    </Button>
                </div>
            )} */}
		</>
	)
}
