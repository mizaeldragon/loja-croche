import { Outlet } from 'react-router-dom'
import Navbar from '../components/public/Navbar'
import Footer from '../components/public/Footer'
import WhatsAppButton from '../components/public/WhatsAppButton'
import ScrollToHash from '../components/public/ScrollToHash'
import Toaster from '../components/ui/Toaster'

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-cream-100">
      <ScrollToHash />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <Toaster />
    </div>
  )
}
