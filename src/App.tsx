import { Routes, Route } from 'react-router-dom'
import { useDivinationStore } from './store/useDivinationStore'
import Home from './pages/Home'
import Result from './pages/Result'

const FONT_CLASS: Record<string, string> = {
  song: 'font-song',
  kai: 'font-kai',
  li: 'font-li',
  hei: 'font-hei',
}

function App() {
  const { font } = useDivinationStore()
  
  return (
    <div className={`min-h-screen ${FONT_CLASS[font] || 'font-kai'}`}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </div>
  )
}

export default App
