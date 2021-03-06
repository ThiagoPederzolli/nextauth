import { createContext, ReactNode, useEffect, useState } from "react";
import { setCookie, parseCookies, destroyCookie } from 'nookies'
import Router from 'next/router'
import { api } from "../services/apiClient";

type User = {
  email: string;
  permissions: string[];
  roles: string[];
}

type SignInCredentials = {
  email: string;
  password: string;
}

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>;
  signOut: () => void;
  isAutenticated: boolean;
  user: User;
}

type AuthProviderProps = {
  children: ReactNode
}

export const AuthContext = createContext({} as AuthContextData)

let authChannel: BroadcastChannel

export function signOut() {
  destroyCookie(undefined, 'nextauth.token' )
  destroyCookie(undefined, 'nextauth.refreshToken')
  authChannel.postMessage('signOut')
  Router.push('/')
}

export function AuthProvider({children}: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAutenticated = !!user;

  useEffect(() => {
    authChannel = new BroadcastChannel('auth')
    authChannel.onmessage = (message) => {
      switch (message.data) {
        case 'signOut':
          signOut()
          break;
        // case 'signIn':
        //   Router.push('/dashboard')
        //   break;
        default:
          break;
      }
    }
  }, [])

  useEffect(() => {
    const { 'nextauth.token': token } = parseCookies()

    if (!!token) {
      api.get('/me').then(response => {
        const { email, permissions, roles } = response.data

        setUser({
          email,
          permissions,
          roles
        })
      }).catch(() =>  {
        signOut()
      })
    }
  }, [])

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post('sessions', {
        email,
        password,
      })

      const { token, refreshToken ,permissions, roles } = response.data
      
      setCookie(undefined, 'nextauth.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 1 mês
        path: '/', // usando a barra, indicamos que qualquer página da aplicação terá acesso a esse cookie.
      })
      setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 1 mês
        path: '/', // usando a barra, indicamos que qualquer página da aplicação terá acesso a esse cookie.
      })

      setUser({
        email,
        permissions,
        roles
      })

      api.defaults.headers['Authorization'] = `Bearer ${token}`

      // authChannel.postMessage('signIn')
      Router.push('/dashboard')
    } catch (error) {
      console.error(error.message)
    }
  }
  return (
    <AuthContext.Provider value={{
      signIn,
      isAutenticated,
      user,
      signOut
    }}>
    {children}
    </AuthContext.Provider>
  )
}