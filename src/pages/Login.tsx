import React, { useEffect, useState } from 'react';
import { Contract } from "../utils/registry";
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { Form, Button, InputGroup, Table } from "react-bootstrap";
import styles from "../Pages.module.css"
import { toast } from "react-toastify";
import { UserAuth } from '../components/UserContext';
import { auth, db } from '../utils/firebase';
import { signOut } from 'firebase/auth';

export const Login: React.FC<{ senderAddress: string, contract: Contract, getContract: Function, fetchBalance: Function}> = ({ senderAddress, contract, getContract, fetchBalance,  }) => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [email, setEmail] = useState<string>('');

    const { userDataGlobalLogin, setUserDataGlobalLogin, signIn, logout, user } = UserAuth();

    const handleLogin = async () => {
        try {
            if (email !== ""){
                toast.loading('Logging in..')
            }
            const usersCollectionRef = collection(db, 'graduates');
            const querySnapshot = await getDocs(query(usersCollectionRef, where('username', '==', username)));

            if (querySnapshot.empty) {
                console.log('No user found with the given username');
                setEmail('');
            } else {
                // Assuming username is unique, retrieve the email from the first matching document
                const userData = querySnapshot.docs[0].data();
                const { email } = userData;
                setEmail(email);

                // User authentication using Context API (signIn from UserContext)
                await signIn(email, password);

                // User authentication succeeded, fetch user data from Firestore
                const db = getFirestore();
                const usersCollectionRef = collection(db, 'graduates');
                const newQuerySnapshot = await getDocs(usersCollectionRef);

                if (!newQuerySnapshot.empty) {
                    newQuerySnapshot.forEach((doc) => {
                        const docData = doc.data();
                        if (docData.email === email) {
                            setUserDataGlobalLogin(docData);
                        }
                    });
                } else {
                    console.log('User data not found');
                }
            }
        } catch (error) {
            toast.dismiss()
            toast.error("Authentication failed.")
            console.log('Authentication failed:', error);
        }
        toast.dismiss()
    };

    useEffect(() => {
        if (email && password) {
            handleLogin();
        } else {
            signOut(auth);
        }
    }, [email, password]);

    useEffect(() => {
        console.log(user)
        console.log(email, password)
    }, [email])

    const handleLogout = async () => {
        try {
            setUserDataGlobalLogin(null); // Clear userDataGlobal in the context
            logout();
        } catch (error) {
            console.log(error);
          toast.error("Something went wrong! Unable to logout.");
        }
    };

    return (
        <div className={styles.formContainer}>
            {!userDataGlobalLogin && (
                <><h1 className="fw-bold">Login</h1>
                <Form>
                    <InputGroup className={styles.inputBox}>
                        <Form.Control
                            type="text"
                            placeholder='Username'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required />
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
                            required />
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid password.
                        </Form.Control.Feedback>
                    </InputGroup>
                    <Button
                        bsPrefix="btnCustom"
                        className={styles.btnCustom}
                        type="submit"
                        onClick={(e) => {
                            e.preventDefault();
                            handleLogin();
                        }}
                    >Sign In
                    </Button>
                </Form></>
            )}
                
            {userDataGlobalLogin && (
                <div>
                    <h1>Welcome, {userDataGlobalLogin.username}!</h1>
					<Table bordered responsive className={styles.customTable}>
                        <tbody>
                            <tr className={styles.customRow}>
                                <td className={styles.customLabel}>Email</td>
                                <td className={styles.customData}>{userDataGlobalLogin.email}</td>
                            </tr>
                            <tr className={styles.customRow}>
                                <td className={styles.customLabel}>Name</td>
                                <td className={styles.customData}>{userDataGlobalLogin.name}</td>
                            </tr>
                            <tr className={styles.customRow}>
                                <td className={styles.customLabel}>NRIC/Passport No.</td>
                                <td className={styles.customData}>{userDataGlobalLogin.nric}</td>
                            </tr>
                            <tr className={styles.customRow}>
                                <td className={styles.customLabel}>Course</td>
                                <td className={styles.customData}>{userDataGlobalLogin.course}</td>
                            </tr>
                            <tr className={styles.customRow}>
                                <td className={styles.customLabel}>Graduation Year</td>
                                <td className={styles.customData}>{userDataGlobalLogin.gradYear}</td>
                            </tr>
                            <tr className={styles.customRow}>
                                <td className={styles.customLabel}>CGPA</td>
                                <td className={styles.customData}>{userDataGlobalLogin.cgpa}</td>
                            </tr>
                            <tr className={styles.customRow}>
                                <td className={styles.customLabel}>Algorand Explorer Link</td>
                                <td className={styles.customData}>
                                    <a href={userDataGlobalLogin.transactionId} target="_blank" rel="noopener noreferrer">
                                        {userDataGlobalLogin.transactionId}
                                    </a>
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                    <Button 
                        bsPrefix="btnCustom"
                        className={styles.btnCustom}
                        type="submit"
                        variant="default"
                        onClick={handleLogout}>
                            Logout
                    </Button>
                </div>
            )}
        </div>
    );
};