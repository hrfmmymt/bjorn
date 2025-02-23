import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        navigate('/')
      }
    })
  }, [navigate])

  return <div>認証中...</div>
}
