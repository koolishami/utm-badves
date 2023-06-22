import React from "react"
import { Link, useLocation } from "react-router-dom"
import styles from "./Header.module.css";
import { UserAuth } from '../components/UserContext';

interface Props {
	address: string,
	admin: boolean
}

export const Header: React.FC<Props> = ({ address, admin }) => {

    const { userDataGlobalLogin , user } = UserAuth();
	const location = useLocation();

	// Function to check if the current route is active
	const isActive = (route: string) => {
		return location.pathname === route ? styles.active : "";
	};

	return (
		<header className={styles.menu} id="menu">
			<Link to="/" id="linkHome" className={isActive("/")}>
				Home
			</Link>
			<Link to="/verify-certificate" id="linkVerifyCertificate" className={isActive("/verify-certificate")}>
				Verify Certificate
			</Link>
			{admin && address && (
				<Link to="/submit-certificate" id="linkSubmitCertificate" className={isActive("/submit-certificate")}>
					Submit Certificate
				</Link> 
			)}
			{admin && (
				<Link to="/uploaded-certificates" id="linkUploadedCertificates" className={isActive("/uploaded-certificates")}>
				Uploaded Certificates
				</Link>
			)}
			{!admin && user && userDataGlobalLogin && (
				<Link to="/login" id="linkLogin" className={isActive("/login")}>
				Information
				</Link>
			)}
			{!admin && (!user || !userDataGlobalLogin) && (
				<Link to="/login" id="linkLogin" className={isActive("/login")}>
				Login
				</Link>
			)}	
		</header>
	)
}