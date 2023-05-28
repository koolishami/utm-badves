import React, { useState } from "react"
import { Button, Spinner } from "react-bootstrap"
import { toast } from "react-toastify";
import { base64ToUTF8String, formatTime } from "../utils/conversions";
import { Contract, deleteDoc } from "../utils/registry";

export const YourDocuments: React.FC<{ senderAddress: string, contract: Contract, getContract: Function, fetchBalance: Function }> = ({ senderAddress, contract, getContract, fetchBalance }) => {
    const [loading, setLoading] = useState(false);
    const [activeDoc, setActiveDoc] = useState("");

    const getName = (doc: any) => {
        let key = base64ToUTF8String(doc["key"])
        let end = key.length - 14;
        return key.substring(0, end)
    }

    const getDate = (doc: any) => {
        let key = base64ToUTF8String(doc["key"])
        let date = key.slice(-13)
        return formatTime(Number(date))
    }

    async function update() {
        await getContract();
        fetchBalance(senderAddress);
    }

    const deleteDocument = (doc: any) => {
        let docName = getName(doc)
        setActiveDoc(docName)
        setLoading(true);
        let key = base64ToUTF8String(doc["key"])
        deleteDoc(senderAddress, key)
            .then(() => {
                toast.success(`${docName} deleted successfully`);
                setTimeout(() => {
                    update();
                }, 3000);
            }).catch(error => {
                console.log({ error });
                toast.error(`Failed to delete ${docName}`);
            }).finally(() => {
                setLoading(false);
            });;
    }

    return (
        <div className="my-5">
            <h5 className="fw-bold">Your Documents</h5>
            <p>
                Overview of all documents you have uploaded to the contract.
            </p>

            <div className="bg-gray-900 rounded-sm">
                <table className="w-full text-sm">
                    <thead>
                        <tr>
                            <td className="px-4 py-3">Name</td>
                            <td className="px-4 py-3">Date Added</td>
                            <td className="text-right px-4 py-3">Action</td>
                        </tr>
                    </thead>
                    <tbody className="font-mono">
                        {contract.userDocuments?.map(document => (
                            <tr key={document["key"]}>
                                <td className="border-t border-gray-800 px-4 py-3">
                                    <span className="flex items-center space-x-1">
                                        {getName(document)}
                                    </span>
                                </td>
                                <td className="relative w-1/4 border-t border-gray-800">
                                    <span className="absolute inset-0 truncate px-4 py-3">
                                        {getDate(document)}
                                    </span>
                                </td>
                                <td className="relative w-1/4 border-t border-gray-800 px-4 py-3 text-right">
                                    <Button
                                        variant="outline-danger"
                                        onClick={() => deleteDocument(document)}
                                        className="btn"
                                    >
                                        {loading ? activeDoc === getName(document) ?
                                            <Spinner animation="border" as="span" size="sm" role="status" aria-hidden="true" className="opacity-25" /> : <i className="bi bi-trash"></i>
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
