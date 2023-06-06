import React, { useEffect, useState } from 'react';
import { Contract } from "../utils/registry";
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { Form, Button, InputGroup, Table } from "react-bootstrap";
import styles from "../Pages.module.css"
import { toast } from "react-toastify";
import { UserAuth } from '../components/UserContext';

export const Login: React.FC<{ senderAddress: string, contract: Contract, getContract: Function, fetchBalance: Function}> = ({ senderAddress, contract, getContract, fetchBalance,  }) => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [email, setEmail] = useState<string>('');

    const [userData, setUserData] = useState<any>(null);
    const [validated, setValidated] = useState(false);

    const { setUserDataGlobal, setAuthenticated, signIn, logout, userDataGlobal } = UserAuth();

    const handleFetchEmail = async () => {
        try {
            const db = getFirestore();
            const usersCollectionRef = collection(db, 'users/graduates/SECR');
            const querySnapshot = await getDocs(query(usersCollectionRef, where('username', '==', username)));

            if (querySnapshot.empty) {
                console.log('No user found with the given username');
                setEmail('');
            } else {
                // Assuming username is unique, retrieve the email from the first matching document
                const userData = querySnapshot.docs[0].data();
                const { email } = userData;
                setEmail(email);
                console.log(email);
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
                console.log(email, password);
                await signIn(email, password);
    
                // User authentication succeeded, fetch user data from Firestore
                const db = getFirestore();
                const usersCollectionRef = collection(db, 'users/graduates/SECR');
                const querySnapshot  = await getDocs(usersCollectionRef);

                if (!querySnapshot.empty) {
                    querySnapshot.forEach((doc) => {
                      const docData = doc.data();
                      if (docData.email === email) {
                        setUserData(docData);
                        console.log(docData);
                        setUserDataGlobal(docData);
                        setAuthenticated(true);
                      }
                    });
                } else {
                console.log('User data not found');
                }
            } catch (error) {
                toast.error("Authentication failed.")
                console.log('Authentication failed:', error);
            }
        }
    };

    useEffect(() => {
        if (userDataGlobal) {
          setUserData(userDataGlobal);
        }
      }, [userDataGlobal]);

    return (
        <div className={styles.formContainer}>
            {!userData && (
                <><h1 className="fw-bold">Login</h1><Form noValidate validated={validated} onSubmit={handleSignIn}>
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
                    >Sign In
                    </Button>
                </Form></>
            )}
                
            {userData && (
                <div>
                    <h1>Welcome, {userData.username}!</h1>
					<Table bordered responsive className={styles.customTable}>
                        <tbody>
                            <tr className={styles.customRow}>
                                <td className={styles.customLabel}>Email</td>
                                <td className={styles.customData}>{userData.email}</td>
                            </tr>
                            <tr className={styles.customRow}>
                                <td className={styles.customLabel}>Name</td>
                                <td className={styles.customData}>{userData.name}</td>
                            </tr>
                            <tr className={styles.customRow}>
                                <td className={styles.customLabel}>Matrix Num</td>
                                <td className={styles.customData}>{userData.matrixNum}</td>
                            </tr>
                            <tr className={styles.customRow}>
                                <td className={styles.customLabel}>Course</td>
                                <td className={styles.customData}>{userData.course}</td>
                            </tr>
                            <tr className={styles.customRow}>
                                <td className={styles.customLabel}>Graduation Year</td>
                                <td className={styles.customData}>{userData.gradyear}</td>
                            </tr>
                            <tr className={styles.customRow}>
                                <td className={styles.customLabel}>CGPA</td>
                                <td className={styles.customData}>{userData.cgpa}</td>
                            </tr>
                            <tr className={styles.customRow}>
                                <td className={styles.customLabel}>Algorand Explorer Link</td>
                                <td className={styles.customData}>email@example.com</td>
                            </tr>
                        </tbody>
                    </Table>
                </div>
            )}
        </div>
    );
};