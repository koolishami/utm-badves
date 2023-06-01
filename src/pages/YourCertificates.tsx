import React, { useState } from "react"
import { Button, Spinner } from "react-bootstrap"
import { toast } from "react-toastify";
import { base64ToUTF8String, formatTime } from "../utils/conversions";
import { Contract, deleteCert } from "../utils/registry";

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
                toast.success(`${certName} deleted successfully`);
                setTimeout(() => {
                    update();
                }, 3000);
            }).catch(error => {
                console.log({ error });
                toast.error(`Failed to delete ${certName}`);
            }).finally(() => {
                setLoading(false);
            });;
    }

    return (
        <div className="my-5">
            <h1>Your Certificates</h1>
            <p>
                Overview of all certificates you have uploaded to the contract.
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
                        {contract.userCertificates?.map(certificate => (
                            <tr key={certificate["key"]}>
                                <td className="border-t border-gray-800 px-4 py-3">
                                    <span className="flex items-center space-x-1">
                                        {getName(certificate)}
                                    </span>
                                </td>
                                <td className="relative w-1/4 border-t border-gray-800">
                                    <span className="absolute inset-0 truncate px-4 py-3">
                                        {getDate(certificate)}
                                    </span>
                                </td>
                                <td className="relative w-1/4 border-t border-gray-800 px-4 py-3 text-right">
                                        <Button
                                            color="rgb(92, 0, 31)"
                                            variant="outline-danger"
                                            onClick={() => deleteCertificate(certificate)}
                                            className="btn"
                                        >
                                            {loading ? activeCert === getName(certificate) ?
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
