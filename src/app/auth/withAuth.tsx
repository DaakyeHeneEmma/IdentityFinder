import { useAuth } from "./AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const withAuth = (WrappedComponent:any) => {
  const ComponentWithAuth = (props:any) => {
    const { user }:any = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!user) {
        router.replace("/")
      }
    }, [user, router])

    if (!user) {
      return null 
    }

    return <WrappedComponent {...props} />
  }

  ComponentWithAuth.displayName = `withAuth(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`

  return ComponentWithAuth
}

export default withAuth