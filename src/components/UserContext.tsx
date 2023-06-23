import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  UserCredential,
  User,
} from 'firebase/auth';
import { auth } from '../utils/firebase';

export interface UserContextType {
  userDataGlobalLogin: any;
  setUserDataGlobalLogin: (data: any) => void;
  userDataGlobalVerify: any;
  setUserDataGlobalVerify: (data: any) => void;
  authenticated: any;
  setAuthenticated: (value: boolean) => void;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  user: any;
  isVerified: boolean;
  setIsVerified: (value: boolean) => void;
  qrCodeUrlVerified: string
  setqrCodeUrlVerified: (value: string) => void;
  qrCodeUrlLogin: string
  setqrCodeUrlLogin: (value: string) => void;
}

export const UserContext = createContext<UserContextType>(null!);

export const UserProvider: React.FC = ({ children }) => {
  const [userDataGlobalLogin, setUserDataGlobalLogin] = useState(null);
  const [userDataGlobalVerify, setUserDataGlobalVerify] = useState(null);
  const [authenticated, setAuthenticated] = useState({});
  const [user, setUser] = useState<User | null>(null);
  const [isVerified, setIsVerified] = useState(false);
	const [qrCodeUrlVerified, setqrCodeUrlVerified] = useState('')
	const [qrCodeUrlLogin, setqrCodeUrlLogin] = useState('')

  const signIn = (email: string, password: string) =>  {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const logout = () => {
      setUserDataGlobalLogin(null);
      return signOut(auth)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if(currentUser){
        setUser(currentUser);
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const contextValue: UserContextType = {
    userDataGlobalLogin, 
    userDataGlobalVerify, 
    setUserDataGlobalLogin,
    setUserDataGlobalVerify,
    authenticated,
    setAuthenticated,
    signIn,
    logout,
    user,
    isVerified,
    setIsVerified,
    qrCodeUrlVerified,
    setqrCodeUrlVerified,
    qrCodeUrlLogin,
    setqrCodeUrlLogin
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(UserContext);
};