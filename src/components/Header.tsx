import React from "react"
import { Link } from "react-router-dom"
import styles from "./Header.module.css";
import { Contract } from "../utils/registry";

interface Props {
	address: string,
}

export const Header: React.FC<Props> = ({ address }) => {
	return (
		<header className={styles.menu} id="menu">
			<Link to="/" id="linkHome">
				Home
			</Link>
			<Link to="/verify-certificate" id="linkVerifyCertificate">
				Verify Certificate
			</Link>
			{address && (
				<Link to="/submit-certificate" id="linkSubmitCertificate">
					Submit Certificate
				</Link> 
			)}
			{address && (
				<Link to="/your-certificates" id="linkYourCertificates">
				Your Certificates
				</Link>
			)}
			<Link to="/login" id="linkLogin">
				Login
			</Link>
		</header>
	)
}