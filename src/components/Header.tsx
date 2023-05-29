import React from "react"
import { Link } from "react-router-dom"
import styles from "./Header.module.css";

export const Header = () => {
	return (
		<header className={styles.menu} id="menu">
			<Link to="/" id="linkHome">
				Home
			</Link>
			<Link to="/submit-certificate" id="linkSubmitCertificate">
				Submit Certificate
			</Link>
			<Link to="/verify-certificate" id="linkVerifyCertificate">
				Verify Certificate
			</Link>
			<Link to="/your-certificates" id="linkYourCertificates">
				Your Certificates
			</Link>
		</header>
	)
}
