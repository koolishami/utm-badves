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
  userDataGlobal: any;
  setUserDataGlobal: (data: any) => void;
  authenticated: any;
  setAuthenticated: (value: boolean) => void;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  user: any
  txid: string,
  setTxIDUser: (value: string) => void;
}

export const UserContext = createContext<UserContextType>(null!);

export const UserProvider: React.FC = ({ children }) => {
  const [userDataGlobal, setUserDataGlobal] = useState(null);
  const [authenticated, setAuthenticated] = useState({});
  const [user, setUser] = useState<User | null>(null);
  const [txid, setTxIDUser] = useState("");

  const signIn = (email: string, password: string) =>  {
    return signInWithEmailAndPassword(auth, email, password)
   }

  const logout = () => {
      setUserDataGlobal(null);
      return signOut(auth)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log(currentUser);
      setUser(currentUser);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const contextValue: UserContextType = {
    userDataGlobal,
    setUserDataGlobal,
    authenticated,
    setAuthenticated,
    signIn,
    logout,
    user,
    txid,
    setTxIDUser
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