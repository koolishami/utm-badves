import React, { useState } from 'react';
import { Contract } from "../utils/registry";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Form, Button, InputGroup } from "react-bootstrap";
import styles from "../Pages.module.css"
import { toast } from "react-toastify";

export const Login: React.FC<{ senderAddress: string, contract: Contract, getContract: Function, fetchBalance: Function }> = ({ senderAddress, contract, getContract, fetchBalance }) => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [userData, setUserData] = useState<any>(null);
    const [validated, setValidated] = useState(false);

    const handleFetchEmail = async () => {
        try {
            const db = getFirestore();
            const usersCollectionRef = collection(db, 'users');
            const querySnapshot = await getDocs(query(usersCollectionRef, where('username', '==', username)));

            if (querySnapshot.empty) {
                console.log('No user found with the given username');
                setEmail('');
            } else {
                // Assuming username is unique, retrieve the email from the first matching document
                const userData = querySnapshot.docs[0].data();
                const { email } = userData;
                setEmail(email);
            }
        } catch (error) {
			toast.error("Email not found.");
            console.log('Error fetching email:', error);
            setEmail('');
        }
    };

    const handleSignIn = async (event : React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.stopPropagation();
        }
        
        setValidated(true);
        if (form.checkValidity()) {
            try {
                handleFetchEmail();
                const auth = getAuth();
                const credentials = await signInWithEmailAndPassword(auth, email, password);
    
                // User authentication succeeded, fetch user data from Firestore
                const db = getFirestore();
                const userDocRef = doc(db, 'users', credentials.user.uid);
                const userDocSnapshot = await getDoc(userDocRef);
    
                if (userDocSnapshot.exists()) {
                    const userData = userDocSnapshot.data();
                    setUserData(userData);
                } else {
                    console.log('User data not found');
                }
            } catch (error) {
                toast.error("Authentication failed.")
                console.log('Authentication failed:', error);
            }
        }
    };

    return (
        <div className={styles.formContainer}>
            <h1 className="fw-bold">Login</h1>
            <Form noValidate validated={validated} onSubmit={handleSignIn} >
                <InputGroup className={styles.inputBox}>
                    <Form.Control
                        type="text"
                        placeholder='Username'
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <Form.Control.Feedback type="invalid">
                        Please provide a valid username.
                    </Form.Control.Feedback>
                </InputGroup>
                <InputGroup className={styles.inputBox}>
                    <Form.Control
                        placeholder='Password'
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Form.Control.Feedback type="invalid">
                        Please provide a valid password.
                    </Form.Control.Feedback>
                </InputGroup>
                <Button 
                    bsPrefix="btnCustom"
				    className={styles.btnCustom} 
                    type="submit"
                    >Sign In
                </Button>
            </Form>
                
            {userData && (
                <div>
                    <h2>Welcome, {userData.username}!</h2>
                    <p>Email: {userData.email}</p>
                    {/* Display other user data as needed */}
                </div>
            )}
        </div>
    );
};