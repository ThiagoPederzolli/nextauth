import axios, { AxiosError } from 'axios'
import { parseCookies, setCookie } from 'nookies'
import { signOut } from '../context/AuthContext'
import { AuthTokenError } from './errors/AuthTokenError'

let isRefreshing = false
let failedRequestsQueue = []

// função criada para que os cookies sejam acessáveis pelo lado do servidor.
export function setUpApiClient(context = undefined) {
  let cookies = parseCookies(context)

  const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
      Authorization: `Bearer ${cookies['nextauth.token']}`
    }
  })
  
  api.interceptors.response.use(response => {
    return response
  }, (error: AxiosError) => {
    if (error.response.status === 401) {
      if (error.response.data?.code === 'token.expired') {
        // renovar o token
        cookies = parseCookies(context)
  
        const { 'nextauth.refreshToken': refreshToken } = cookies
        // esse config é basicamente toda configuração da requisição feita para o backend
        // dentro desse config irá ter todas as informações necessárias para repetir uma requisição para o backend
        // rotas, parâmetros, callbacks
        const originalConfig = error.config
  
        if (!isRefreshing) {
          // fazendo essa alteração, garantimos que caso surja uma segunda requisição pra atualizar o token, ela não seja executada
          isRefreshing = true
  
          
            api.post('/refresh', {
              refreshToken
            }).then(response => {
              const { token } = response.data
      
              setCookie(context, 'nextauth.token', token, {
                maxAge: 60 * 60 * 24 * 30, // 1 mês
                path: '/', // usando a barra, indicamos que qualquer página da aplicação terá acesso a esse cookie.
              })
              setCookie(context, 'nextauth.refreshToken', response.data.refreshToken, {
                maxAge: 60 * 60 * 24 * 30, // 1 mês
                path: '/', // usando a barra, indicamos que qualquer página da aplicação terá acesso a esse cookie.
              })
      
              api.defaults.headers['Authorization'] = `Bearer ${token}`
  
              failedRequestsQueue.forEach(request => request.onSuccess(token))
              failedRequestsQueue = []
            }).catch(err => {
              failedRequestsQueue.forEach(request => request.onFailure(err))
              failedRequestsQueue = []
  
              if (process.browser) {
                signOut()
              }
            }).finally(() => {
              isRefreshing = false
            })
          
        }
        // usamos a Promise porque o axios não permite que seu argumento seja uma função assíncrona
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            onSuccess: (token: string) => {
              originalConfig.headers['Authorization'] = `Bearer ${token}`
  
              resolve(api(originalConfig))
            },
            onFailure: (err: AxiosError ) => {
              reject(err)
            }
          })
        })
          
      } else if (process.browser) {
        // deslogar o usuário
          signOut()
        } else {
          return Promise.reject(new AuthTokenError())
        }
    }
    // sempre devemos retornar iso quando usar um interceptor, pois caso nossa lógica não trate o erro
    // garantimos que ele siga passando para outras requisições que possam tratá-lo.
    return Promise.reject(error)
  })

  return api
}