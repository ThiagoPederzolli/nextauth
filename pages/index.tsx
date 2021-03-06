import { FormEvent, useContext, useState } from "react"
import { AuthContext } from "../context/AuthContext"
import { withSSRGuest } from "../utils/withSSRGuest"

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPasssword] = useState('')

  const { signIn } = useContext(AuthContext)
  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const data = {
      email,
      password,
    }

    await signIn(data)
  }


  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPasssword(e.target.value)} />
      <button type="submit">Entrar</button>
    </form>
  )
}

export const getServerSideProps = withSSRGuest(async (context) => {  
  return {
    props: {},
  }
})
