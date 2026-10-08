import { motion, useScroll, useSpring } from 'framer-motion'
import Converter from './components/Converter'
import Features from './components/Features'
import Footer from './components/Footer'
import Header from './components/Header'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import { useTheme } from './hooks/useTheme'

export default function App() {
  const { theme, toggle } = useTheme()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 })

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <motion.div
        style={{ scaleX }}
        className="from-gold fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r to-gold-light"
      />

      <Header theme={theme} onToggleTheme={toggle} />

      <main>
        <Hero />
        <Marquee />
        <Converter />
        <Features />
      </main>

      <Footer />
    </div>
  )
}
