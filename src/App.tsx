import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './auth/AuthProvider';
import RutaProtegida from './auth/RutaProtegida';
import Login from './pages/Login';
import PanelGeneral from './pages/PanelGeneral';
import Alertas from './pages/Alertas';
import Analisis from './pages/Analisis';
import Alumnos from './pages/Alumnos';
import Estadisticas from './pages/Estadisticas';
import Reportes from './pages/Reportes';
import Configuracion from './pages/Configuracion';
import EnConstruccion from './pages/EnConstruccion';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<RutaProtegida />}>
            <Route path="/" element={<Navigate to="/panel" replace />} />
            <Route path="/panel" element={<PanelGeneral />} />
            <Route path="/alertas" element={<Alertas />} />
            <Route path="/analisis" element={<Analisis />} />
            <Route path="/alumnos" element={<Alumnos />} />
            <Route path="/estadisticas" element={<Estadisticas />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/configuracion" element={<Configuracion />} />
            <Route path="*" element={<EnConstruccion />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}