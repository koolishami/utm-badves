import React from "react"
import { Link } from "react-router-dom"
import styles from "./Header.module.css";

export const Header = () => {
	return (
		<header className={styles.menu} id="menu">
			<Link to="/" id="linkHome">
				Home
			</Link>
			<Link to="/submit-document" id="linkSubmitDocument">
				Submit Document
			</Link>
			<Link to="/verify-document" id="linkVerifyDocument">
				Verify Document
			</Link>
			<Link to="/your-documents" id="linkYourDocuments">
				Your Documents
			</Link>
		</header>
	)
}
