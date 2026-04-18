import { createClient } from '@/lib/supabase/server'
import { getUserByAuthId } from '@/lib/queries/users.queries'
import { redirect } from 'next/navigation'

export async function getUser() {
  const supabase = await createClient()
  
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    return null
  }

  // Get database user
  const user = await getUserByAuthId(authUser.id)
  
  return user
}

export async function requireUser() {
  const user = await getUser()
  
  if (!user) {
    redirect('/sign-in')
  }
  
  return user
}