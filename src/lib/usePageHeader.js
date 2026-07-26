import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'

export default function usePageHeader(title, subtitle) {
  const ctx = useOutletContext()
  useEffect(() => {
    ctx?.setHeader({ title, subtitle })
  }, [title, subtitle])
}
