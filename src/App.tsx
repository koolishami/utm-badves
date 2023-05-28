import { useCallback, useEffect, useState } from "react"
import "../node_modules/bootstrap/dist/css/bootstrap.min.css"
import "./App.css"
import { Header } from "./components/Header"
import { Nav } from "react-bootstrap"
import { Route, Routes } from "react-router-dom"
import { toast } from "react-toastify";
import { indexerClient, myAlgoConnect } from "./utils/constants";
import Wallet from "./components/Wallet"
import coverImg from "./assets/img/registry.jpeg";
import backgroundImage from "./assets/img/UTM-background.jpg"
import { Notification } from "./components/Notifications"
import Cover from "./components/Cover";
import { Home } from "./pages/Home"
import { Footer } from "./components/Footer"
import { Submit } from "./pages/Submit"
import { Verify } from "./pages/Verify"
import { YourDocuments } from "./pages/YourDocuments"
import { Contract, getContractData } from "./utils/registry";
import { contractTemplate } from "./utils/constants"
import Loader from "./components/Loader"


function App() {
	const [address, setAddress] = useState("");
	const [name, setName] = useState("");
	const [balance, setBalance] = useState(0);
	const [contract, setContract] = useState<Contract>(contractTemplate);
	const [loading, setLoading] = useState(false);

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
			}).catch(error => {
				console.log('Could not connect to MyAlgo wallet');
				console.error(error);
			})
	};

	const disconnect = () => {
		setAddress("");
		setName("");
		setBalance(0);
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
		}
		return () => {
			isTemplate = false;
		};
	}, [getContract]);

	return (
		<>
			<Notification />
			{address ? (
				!loading ?(
					<main style={{ backgroundImage: `url(${backgroundImage})`, 
								minHeight: "100vh",
								backgroundSize: "cover"}}>
						<Header></Header>
						<Nav className="justify-content-end pt-3 pb-5">
							<Nav.Item>
								<Wallet
									address={address}
									name={name}
									amount={balance}
									symbol="NEAR"
									disconnect={disconnect}
								/>
							</Nav.Item>
						</Nav>
						<Routes>
							<Route element={<Home senderAddress={address} contract={contract} fetchBalance={fetchBalance} />} path="/" />
							<Route element={<Submit senderAddress={address} contract={contract} getContract={getContract} fetchBalance={fetchBalance} />} path="/submit-document" />
							<Route element={<Verify senderAddress={address} contract={contract} getContract={getContract} fetchBalance={fetchBalance} />} path="/verify-document" />
							<Route element={<YourDocuments senderAddress={address} contract={contract} getContract={getContract} fetchBalance={fetchBalance} />} path="/your-documents" />
						</Routes>
						<Footer />
					</main>
				) : <Loader />
			) : (
				<Cover name="UTM-BADVES" login={connectWallet} coverImg={coverImg} backgroundImage={backgroundImage} />
			)}
		</>

	)
}

export default App
