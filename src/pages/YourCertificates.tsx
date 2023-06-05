import React, { useState } from "react"
import { Button, Spinner } from "react-bootstrap"
import { toast } from "react-toastify";
import { base64ToUTF8String, formatTime } from "../utils/conversions";
import { Contract, deleteCert } from "../utils/registry";
import {
	ref,
	getDownloadURL,
    deleteObject
} from "firebase/storage";
import { storage } from "../utils/firebase";

export const YourCertificates: React.FC<{ senderAddress: string, contract: Contract, getContract: Function, fetchBalance: Function }> = ({ senderAddress, contract, getContract, fetchBalance }) => {
    const [loading, setLoading] = useState(false);
    const [activeCert, setActiveCert] = useState("");

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

    const deleteCertificate = (cert: any) => {
        let certName = getName(cert)
        setActiveCert(certName)
        setLoading(true);
        let key = base64ToUTF8String(cert["key"])
        deleteCert(senderAddress, key)
            .then(() => {
                let end = key.length - 14;
                const fileName = key.substring(0, end)
                const fileRef = ref(storage, `images/${fileName}`)
                deleteObject(fileRef).then(() => {
                    toast.success(`${certName} deleted successfully`);                    
                    setTimeout(() => {
                        update();
                    }, 3000);
                }).catch(error => {
                    console.log ({error});
                    toast.error(`Failed to delete ${certName}`);
                });
            }).catch(error => {
                console.log({ error });
                toast.error(`Failed to delete ${certName}`);
            }).finally(() => {
                setLoading(false);
            });;
    }

    const openFile = async (cert: any) => {
        let key = base64ToUTF8String(cert["key"]);
        console.log(key);
        let end = key.length - 14;
        const fileName = key.substring(0, end)
        const fileRef = ref(storage, `images/${fileName}`)
        const downloadURL = await getDownloadURL(fileRef);
        window.open(downloadURL, '_blank');
    }



    return (
        <div className="my-5">
            <h1>Your Certificates</h1>
            <p>
                Overview of all certificates you have uploaded to the contract.
            </p>

            <div className="my-1" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                <table className="w-full text-sm border border-1">
                    <thead>
                        <tr>
                            <td className="px-3 py-3 border border-1">Name</td>
                            <td className="px-3 py-3 border border-1">Date Added</td>
                            <td className="text-right px-4 py-3 border border-1">Action</td>
                        </tr>
                    </thead>
                    <tbody className="font-mono border border-1">
                        {contract.userCertificates?.map(certificate => (
                            <tr key={certificate["key"]}>
                                <td className="border border-1 px-3 py-3">
                                    <span className="flex items-center space-x-1">
                                        {getName(certificate)}
                                    </span>
                                </td>
                                <td className="border border-1 px-2">
                                    <span className="flex items-center space-x-1">
                                        {getDate(certificate)}
                                    </span>
                                </td>
                                <td className="w-1/4 border border-1 flex justify-end items-center">
                                        <Button
                                            color="rgb(0, 123, 255)"
                                            variant="outline-primary"
                                            onClick={() => openFile(certificate)}
                                            className="btn m-1"
                                        ><i className="bi bi-eye"></i>
                                        </Button>
                                        <Button
                                            color="rgb(92, 0, 31)"
                                            variant="outline-danger"
                                            onClick={() => deleteCertificate(certificate)}
                                            className="btn"
                                        >
                                            {loading ? activeCert === getName(certificate) ?
                                                <Spinner 
                                                    animation="border" 
                                                    as="span" 
                                                    size="sm" 
                                                    role="status" 
                                                    aria-hidden="true" 
                                                    className="opacity-25" 
                                                /> 
                                                : <i className="bi bi-trash"></i>
                                                : <i className="bi bi-trash"></i>
                                            }
                                        </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>



        </div>
    )
}
