import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Single-page navigation keeps the old scroll position; start each page at the top instead. */
export default function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
