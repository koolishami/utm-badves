import React, { useState } from "react"
import { Button, Spinner, Form } from "react-bootstrap"
import { toast } from "react-toastify";
import { base64ToUTF8String, formatTime } from "../utils/conversions";
import { Contract, deleteCert } from "../utils/registry";
import {
	ref,
	getDownloadURL,
    deleteObject,
    listAll
} from "firebase/storage";
import { storage } from "../utils/firebase";
import { UserAuth } from "../components/UserContext";
import styles from "../Pages.module.css"

export const YourCertificates: React.FC<{ senderAddress: string, contract: Contract, getContract: Function, fetchBalance: Function }> = ({ senderAddress, contract, getContract, fetchBalance }) => {
    const [loading, setLoading] = useState(false);
    const [activeCert, setActiveCert] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const searchResults = useState<string[]>([]);
    const [certDate, setCertDate] = useState("");
    const [fileFolderResults, setFileFolderResults] = useState<{ searchResults: string[]; folderResults: string[]; certDate: string; cert: Contract; }[]>([]);

    const { userDataGlobal } = UserAuth();


    const getName = (cert: any) => {
        let key = base64ToUTF8String(cert["key"])
        let end = key.length - 14;
        return key.substring(0, end)
    }

    const getDate = (cert: any) => {
        let key = base64ToUTF8String(cert["key"])
        let date = key.slice(-13)
        return formatTime(Number(date))
    }

    async function update() {
        await getContract();
        fetchBalance(senderAddress);
    }

    const deleteCertificate = (folderName: string, fileName: string, cert: any) => {
        let certName = getName(cert);
        setActiveCert(certName);
        setLoading(true);
        let key = base64ToUTF8String(cert["key"]);
        deleteCert(senderAddress, key)
            .then(() => {
                const fileRef = ref(storage, `certificates/${folderName}/${fileName}`);
                deleteObject(fileRef)
                .then(() => {
                    toast.success(`${certName} deleted successfully`);
                    setTimeout(() => {
                    update();
                    }, 3000);
                })
                .catch((error) => {
                    console.log({ error });
                    toast.error(`Failed to delete ${certName}`);
                });
            })
            .catch((error) => {
                console.log({ error });
                toast.error(`Failed to delete ${certName}`);
            })
            .finally(() => {
                setLoading(false);
            });
      };
      
    const openFile = async (folderName: string, fileName: string) => {
        const fileRef = ref(storage, `certificates/${folderName}/${fileName}`);
        const downloadURL = await getDownloadURL(fileRef);
        window.open(downloadURL, "_blank");
    };

    const handleSearch = async () => {
        type SearchResult = {
            fileName: string;
            folderName: string;
        };
        setLoading(true);
        try {
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
                folderFiles.items.forEach((file) => {
                    const fileName = file.name.split("/").pop();
                    if (fileName) {
                        searchResults.add({ fileName, folderName: folder.name });
                    }
                });
            }
            console.log(contract.userCertificates)
            console.log(contract.appAddress)
            const userCertificates = contract.userCertificates || [];

            const fileFolderResults = userCertificates.reduce((acc, certificate) => {
                const certName = getName(certificate);
            
                Array.from(searchResults).forEach((result: SearchResult) => {
                if (result.fileName === certName) {
                    const existingResult = acc.find(
                        (r: { certName: string; folderName: string; }) => r.certName === certName && r.folderName === result.folderName
                    );
            
                    if (existingResult) {
                        existingResult.searchResults.push(certName);
                        console.log(existingResult);
                    } else {
                        const resultObj = {
                            searchResults: [certName],
                            folderResults: result.folderName,
                            certDate: getDate(certificate),
                            cert: certificate,
                        };
                        acc.push(resultObj);
                    }
                }
                });
            
                return acc;
            }, []);

            if (fileFolderResults.length === 0) {
                toast.error("User not found!");
                setLoading(false);
                return;
            }
            
            setFileFolderResults(fileFolderResults);
        } catch (error) {
            console.log(error);
            toast.error("Failed to perform search.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="my-5">
            <h1>Uploaded Certificates</h1>
            <p>Search the certificates you have uploaded to the contract by name.</p>
        
            <div className="mb-2">
                <Form.Control
                    className="mb-2"
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button bsPrefix="btnCustom" className={styles.btnCustom} variant="default" onClick={handleSearch}>
                Search
                </Button>
            </div>
            {fileFolderResults.length!=0 && (
                <div className="my-1" style={{ maxHeight: "250px", overflowY: "auto" }}>
                    <table className="w-full text-sm border border-1">
                    <thead>
                        <tr>
                        <th className="px-3 py-3 border border-1">Name</th>
                        <th className="px-3 py-3 border border-1">Date Added</th>
                        <th className="text-right px-4 py-3 border border-1">Action</th>
                        </tr>
                    </thead>
                    <tbody className="font-mono border border-1">
                        {fileFolderResults.map((fileFolderResult, index) =>
                            fileFolderResult.searchResults.map((searchResult, innerIndex) => (
                                <tr key={index}>
                                    <td className="border border-1 px-3 py-3">
                                        <span className="flex items-center space-x-1">{searchResult}</span>
                                    </td>
                                    <td className="border border-1 px-2">
                                        <span className="flex items-center space-x-1">{fileFolderResult.certDate}</span>
                                    </td>
                                    <td className="w-1/4 border border-1 flex justify-end items-center">
                                        <Button
                                            color="rgb(0, 123, 255)"
                                            variant="outline-primary"
                                            onClick={() => openFile(fileFolderResult.folderResults.toString(), searchResult)}
                                            className="btn m-1"
                                        >
                                        <i className="bi bi-eye"></i>
                                        </Button>
                                        <Button
                                        color="rgb(92, 0, 31)"
                                        variant="outline-danger"
                                        onClick={() =>
                                            deleteCertificate(
                                                fileFolderResult.folderResults.toString(),
                                                searchResult,
                                                fileFolderResult.cert
                                            )
                                        }
                                        className="btn"
                                        >
                                        {loading ? (
                                            activeCert === searchResult ? (
                                            <Spinner
                                                animation="border"
                                                as="span"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                                className="opacity-25"
                                            />
                                            ) : (
                                            <i className="bi bi-trash"></i>
                                            )
                                        ) : (
                                            <i className="bi bi-trash"></i>
                                        )}
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    </table>
                </div>
            )}
        </div>
      );      
}