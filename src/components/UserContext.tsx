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
  user: any;
  isVerified: boolean;
  setIsVerified: (value: boolean) => void;
}

export const UserContext = createContext<UserContextType>(null!);

export const UserProvider: React.FC = ({ children }) => {
  const [userDataGlobal, setUserDataGlobal] = useState(null);
  const [authenticated, setAuthenticated] = useState({});
  const [user, setUser] = useState<User | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  const signIn = (email: string, password: string) =>  {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const logout = () => {
      setUserDataGlobal(null);
      return signOut(auth)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
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
    isVerified,
    setIsVerified,
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