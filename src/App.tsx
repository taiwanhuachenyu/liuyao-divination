import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Result from './pages/Result'

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/result" element={<Result />} />
        {/* 未列之路径一概归于起卦页：否则错一个字母便得一整片空白，连块可点的地方都没有 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
