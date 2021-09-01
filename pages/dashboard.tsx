import { useContext, useEffect } from "react"
import { Can } from "../components/Can"
import { AuthContext } from "../context/AuthContext"
// import { setUpApiClient } from "../services/api"
import { api } from "../services/apiClient"
import { withSSRAuth } from "../utils/withSSRAuth"

export default function Dashboard() {
  const { user } = useContext(AuthContext)

  useEffect(() => {
    api.get('/me').then(response => {
      console.log(response)
    }).catch(error => {
      console.error(error.message)
    })
}, [])
  return (
    <>
      <h1>Dashboard: {user?.email}</h1>
      <Can permissions={['metrics.list']}>
        <div>Métricas</div>
      </Can>
    </>
  )
}

export const getServerSideProps = withSSRAuth(async (context) => {
  // const apiClient = setUpApiClient(context)
  // const response = await apiClient.get('/me')
  // console.log(response)
  
  return {
    props: {},
  }
})