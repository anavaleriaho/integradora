import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import PanelGeneral from './pages/PanelGeneral';
import Alertas from './pages/Alertas';
import Analisis from './pages/Analisis';
import Alumnos from './pages/Alumnos';
import Estadisticas from './pages/Estadisticas';
import EnConstruccion from './pages/EnConstruccion';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar />
        <main className="contenido">
          <Routes>
            <Route path="/" element={<Navigate to="/panel" replace />} />
            <Route path="/panel" element={<PanelGeneral />} />
            <Route path="/alertas" element={<Alertas />} />
            <Route path="/analisis" element={<Analisis />} />
            <Route path="/alumnos" element={<Alumnos />} />
            <Route path="/estadisticas" element={<Estadisticas />} />
            <Route path="*" element={<EnConstruccion />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}