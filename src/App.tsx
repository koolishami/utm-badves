import { useCallback, useEffect, useState } from "react"
import "../node_modules/bootstrap/dist/css/bootstrap.min.css"
import "./App.css"
import { Header } from "./components/Header"
import { Nav, Button } from "react-bootstrap"
import { Route, Routes, useLocation, useNavigate } from "react-router-dom"
import { toast } from "react-toastify";
import { indexerClient, myAlgoConnect } from "./utils/constants";
import Wallet from "./components/Wallet"
import backgroundImage from "./assets/img/UTM-background.jpg"
import { Notification } from "./components/Notifications"
import { Home } from "./pages/Home"
import { Footer } from "./components/Footer"
import { Submit } from "./pages/Submit"
import { Verify } from "./pages/Verify"
import { YourCertificates } from "./pages/YourCertificates"
import { Login } from "./pages/Login"
import { Contract, getContractData } from "./utils/registry";
import { contractTemplate } from "./utils/constants"
import Loader from "./components/Loader"
import styles from "./Pages.module.css"
import { db } from "./utils/firebase"
import {
	collection,
	getDocs,
} from "firebase/firestore";
import { UserProvider } from './components/UserContext';

function App() {
	const [address, setAddress] = useState("");
	const [name, setName] = useState("");
	const [balance, setBalance] = useState(0);
	const [contract, setContract] = useState<Contract>(contractTemplate);
	const [loading, setLoading] = useState(false);
	const [admin, setAdmin] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const [isSubmitRoute, setIsSubmitRoute] = useState(false);

	const fetchBalance = async (accountAddress: string) => {
		indexerClient.lookupAccountByID(accountAddress).do()
			.then(response => {
				const _balance = response.account.amount;
				setBalance(_balance);
			})
			.catch(error => {
				console.log(error);
			});
	};

	const connectWallet = async () => {
		myAlgoConnect.connect()
			.then(accounts => {
				const _account = accounts[0];
				setAddress(_account.address);
				setName(_account.name);
				fetchBalance(_account.address);
				navigate("/");
			}).catch(error => {
				toast.error('Could not connect to MyAlgo wallet');
				console.error(error);
			})
	};

	const disconnect = () => {
		setAddress("");
		setName("");
		setBalance(0);
		navigate("/");
		window.location.reload();
	};

	const getContract = useCallback(async () => {
		if (address) {
			toast.loading(`Updating Registry`)
			setLoading(true)
			setContract(await getContractData(address));
			setLoading(false)
			toast.dismiss()
		}
	}, [address]);

	useEffect(() => {
		let isTemplate = true;
		if (isTemplate) {
			getContract();
			isAdminTrue();
		}
		return () => {
			isTemplate = false;
		};
	}, [getContract]);

	useEffect(() => {
		setIsSubmitRoute(location.pathname === "/submit-certificate");
	  }, [location.pathname]);	  

	const isAdminTrue = async () => {
		setAdmin(false);
		const administratorsCollectionRef = collection(db, "admins");
		const querySnapshot = await getDocs(administratorsCollectionRef);

		querySnapshot.forEach((doc) => {
			const adminData = doc.data();
			if (adminData.address === address) {
				setAdmin(true);
				return; // Exit the loop if admin is found
			}
		});
	}

	return (
		<UserProvider>
			<Notification />
				{!loading ?(
					<main style={{ backgroundImage: `url(${backgroundImage})`, 
								minHeight: "100vh",
								backgroundSize: "cover"}}>
						<Header address={address} admin={admin}/>
						{address && (
							<Nav className="justify-content-center pt-0 pb-3">
								<Nav.Item>
									<Wallet
										address={address}
										name={name}
										amount={balance}
										symbol="ALGO"
										disconnect={disconnect}
									/>
								</Nav.Item>
							</Nav>
						)}
						{!address && (<div className="d-flex justify-content-center">
							<Button
								onClick={() => connectWallet().catch((e: Error) => console.log(e))}
								variant="outline-light"
								className="rounded-pill px-3 mb-3 mt-0"
							>
								Connect Wallet
							</Button>
						</div>
						)}
						<div className={`${styles.wrapper} ${isSubmitRoute ? styles.submitWrapper : ""}`}>
							<Routes>
								<Route element={<Home senderAddress={address} contract={contract} getContract={getContract} fetchBalance={fetchBalance} admin={admin} />} path="/" />
								<Route element={<Submit senderAddress={address} contract={contract} getContract={getContract} fetchBalance={fetchBalance}  />} path="/submit-certificate" />
								<Route element={<Verify senderAddress={address} contract={contract} getContract={getContract} fetchBalance={fetchBalance} />} path="/verify-certificate" />
								<Route element={<YourCertificates senderAddress={address} contract={contract} getContract={getContract} fetchBalance={fetchBalance} />} path="/your-certificates" />
								<Route element={<Login senderAddress={address} contract={contract} getContract={getContract} fetchBalance={fetchBalance}/>} path="/login" />
							</Routes>   
						</div>
					</main>
				) : <Loader />}
		</UserProvider>
	)
}

export default App
