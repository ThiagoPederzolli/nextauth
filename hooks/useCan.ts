import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { validadeUserPermissions } from "../utils/validadeUserPermissions"

type useCanParams = {
  permissions?: string[];
  roles?: string[];
}

export function useCan({ permissions, roles }: useCanParams) {
  const { user, isAutenticated } = useContext(AuthContext)

  if (!isAutenticated) {
    return false
  }

  const userHasValidPermissions = validadeUserPermissions({
    user,
    permissions,
    roles
  })

  // if (permissions?.length > 0) {
  //   const hasAllPermissions = permissions.every(permission => {
  //     return user.permissions.includes(permission)
  //   })

  //   if (!hasAllPermissions) {
  //     return false
  //   }
  // }

  // if (roles?.length > 0) {
  //   const hasAllRoles = roles.some(role => {
  //     return user.roles.includes(role)
  //   })

  //   if (!hasAllRoles) {
  //     return false
  //   }
  // }

  return userHasValidPermissions;
}