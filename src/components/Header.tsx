import React from "react"
import { Link } from "react-router-dom"
import styles from "./Header.module.css";
import { UserAuth } from '../components/UserContext';

interface Props {
	address: string,
	admin: boolean
}

export const Header: React.FC<Props> = ({ address, admin }) => {

    const { userDataGlobal, user } = UserAuth();

	return (
		<header className={styles.menu} id="menu">
			<Link to="/" id="linkHome">
				Home
			</Link>
			<Link to="/verify-certificate" id="linkVerifyCertificate">
				Verify Certificate
			</Link>
			{admin && address && (
				<Link to="/submit-certificate" id="linkSubmitCertificate">
					Submit Certificate
				</Link> 
			)}
			{address && (
				<Link to="/your-certificates" id="linkYourCertificates">
				Your Certificates
				</Link>
			)}
			{!admin && (user || userDataGlobal) (
				<Link to="/login" id="linkLogin">
				Information
				</Link>
			)}
			{!admin && !user && userDataGlobal && (
				<Link to="/login" id="linkLogin">
				Login
				</Link>
			)}	
		</header>
	)
}