import React, { useEffect, useState, useMemo } from "react";
import { 
  Search, 
  RefreshCw, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  EllipsisVertical, 
  Pencil, 
  Trash2,
  X,
  BookX
} from "lucide-react";
import { getEstudiantes, predecirRiesgo, type EstudianteAPI, type MateriaReprobada } from "../../services/api";

interface MenuPosicion {
  id: number;
  x: number;
  y: number;
}

const ANCHO_MENU = 180;

const etiquetas: Record<string, { texto: string; color: string }> = {
  bajo: { texto: "BAJO", color: "#10b981" },
  medio: { texto: "MEDIO", color: "#f59e0b" },
  alto: { texto: "ALTO", color: "#ef4444" },
  "sin evaluar": { texto: "SIN EVALUAR", color: "#6b7280" },
};

const obtenerIniciales = (nombre?: string): string => {
  if (!nombre) return "ST";
  const partes = nombre.trim().split(" ");
  if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
  return (partes[0][0] + (partes[1]?.[0] || "")).toUpperCase();
};

// MODAL EMERGENTE FLOTANTE
const ModalEmergente: React.FC<{
  titulo: string;
  subtitulo?: string;
  onCerrar: () => void;
  children: React.ReactNode;
  pie?: React.ReactNode;
}> = ({ titulo, subtitulo, onCerrar, children, pie }) => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(15, 23, 42, 0.65)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: "16px",
    }}
    onClick={onCerrar}
  >
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "520px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        overflow: "hidden",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <header
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#f8fafc"
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>{titulo}</h3>
          {subtitulo && <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>{subtitulo}</p>}
        </div>
        <button
          onClick={onCerrar}
          style={{ border: "none", background: "transparent", cursor: "pointer", padding: "4px", color: "#64748b" }}
        >
          <X size={20} />
        </button>
      </header>
      <main style={{ padding: "20px", color: "#334155" }}>{children}</main>
      {pie && (
        <footer
          style={{
            padding: "12px 20px",
            backgroundColor: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
          }}
        >
          {pie}
        </footer>
      )}
    </div>
  </div>
);

export function TablaAlumnos() {
  const [estudiantes, setEstudiantes] = useState<EstudianteAPI[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);

  // Filtros
  const [busqueda, setBusqueda] = useState<string>("");
  const [riesgoFiltro, setRiesgoFiltro] = useState<string>("todos");
  const [carreraFiltro, setCarreraFiltro] = useState<string>("todas");
  const [grupoFiltro, setGrupoFiltro] = useState<string>("todos");

  // Paginación
  const [pagina, setPagina] = useState<number>(1);
  const elementosPorPagina = 5;

  // Ventanas Emergentes (Modales & Popovers)
  const [menu, setMenu] = useState<MenuPosicion | null>(null);
  const [viendoId, setViendoId] = useState<number | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [nombreEditado, setNombreEditado] = useState("");
  const [matriculaEditada, setMatriculaEditada] = useState("");

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setErrorMsg(null);
      const data = await getEstudiantes();
      setEstudiantes(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error al consultar la API:", err);
      setErrorMsg("No se pudo conectar con FastAPI (http://127.0.0.1:8000). Revisa que Uvicorn esté ejecutándose.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (!menu) return;
    const cerrar = () => setMenu(null);
    window.addEventListener("click", cerrar);
    window.addEventListener("resize", cerrar);
    window.addEventListener("scroll", cerrar, true);
    return () => {
      window.removeEventListener("click", cerrar);
      window.removeEventListener("resize", cerrar);
      window.removeEventListener("scroll", cerrar, true);
    };
  }, [menu]);

  useEffect(() => {
    setPagina(1);
  }, [busqueda, riesgoFiltro, carreraFiltro, grupoFiltro]);

  // TARJETAS DE RESUMEN
  const metricas = useMemo(() => {
    const total = estudiantes.length;
    if (total === 0) return { alto: 0, pctAlto: 0, medio: 0, pctMedio: 0, bajo: 0, pctBajo: 0 };

    const alto = estudiantes.filter((e) => (e.riesgo || "").toLowerCase() === "alto").length;
    const medio = estudiantes.filter((e) => (e.riesgo || "").toLowerCase() === "medio").length;
    const bajo = estudiantes.filter((e) => (e.riesgo || "").toLowerCase() === "bajo").length;

    return {
      alto,
      pctAlto: ((alto / total) * 100).toFixed(1),
      medio,
      pctMedio: ((medio / total) * 100).toFixed(1),
      bajo,
      pctBajo: ((bajo / total) * 100).toFixed(1),
    };
  }, [estudiantes]);

  const carrerasDisponibles = useMemo(() => {
    return Array.from(new Set(estudiantes.map((e) => e.carrera).filter(Boolean)));
  }, [estudiantes]);

  const gruposDisponibles = useMemo(() => {
    return Array.from(new Set(estudiantes.map((e) => e.grupo).filter(Boolean)));
  }, [estudiantes]);

  // FILTRADO
  const estudiantesFiltrados = useMemo(() => {
    return estudiantes.filter((est) => {
      const nombreCompleto = est.nombre_completo || "";
      const matricula = est.matricula || "";
      const carrera = est.carrera || "";
      const grupo = est.grupo || "";
      const riesgo = (est.riesgo || "sin evaluar").toLowerCase();

      const coincideBusqueda =
        busqueda.trim() === "" ||
        nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
        matricula.toLowerCase().includes(busqueda.toLowerCase()) ||
        carrera.toLowerCase().includes(busqueda.toLowerCase());

      const coincideRiesgo = riesgoFiltro === "todos" || riesgo === riesgoFiltro.toLowerCase();
      const coincideCarrera = carreraFiltro === "todas" || carrera.toLowerCase() === carreraFiltro.toLowerCase();
      const coincideGrupo = grupoFiltro === "todos" || grupo.toLowerCase() === grupoFiltro.toLowerCase();

      return coincideBusqueda && coincideRiesgo && coincideCarrera && coincideGrupo;
    });
  }, [estudiantes, busqueda, riesgoFiltro, carreraFiltro, grupoFiltro]);

  // PAGINACIÓN
  const totalFiltrados = estudiantesFiltrados.length;
  const totalPaginas = Math.ceil(totalFiltrados / elementosPorPagina) || 1;
  const estudiantesPagina = estudiantesFiltrados.slice(
    (pagina - 1) * elementosPorPagina,
    pagina * elementosPorPagina
  );
  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);

  const handlePredecir = async (id: number) => {
    try {
      setProcesandoId(id);
      await predecirRiesgo(id);
      await cargarDatos();
    } catch (err) {
      alert("No se pudo calcular la predicción para este alumno.");
    } finally {
      setProcesandoId(null);
    }
  };

  const alumnoVer = estudiantes.find((a) => a.id_estudiante === viendoId);
  const alumnoEditar = estudiantes.find((a) => a.id_estudiante === editandoId);
  const alumnoEliminar = estudiantes.find((a) => a.id_estudiante === eliminandoId);
  const alumnoMenu = estudiantes.find((a) => a.id_estudiante === menu?.id);

  const abrirMenuAcciones = (e: React.MouseEvent<HTMLButtonElement>, id: number) => {
    e.stopPropagation();
    if (menu?.id === id) {
      setMenu(null);
      return;
    }
    const caja = e.currentTarget.getBoundingClientRect();
    setMenu({
      id,
      x: Math.max(8, caja.right - ANCHO_MENU),
      y: Math.min(caja.bottom + 4, window.innerHeight - 120),
    });
  };

  const empezarEdicion = (a: EstudianteAPI) => {
    setMenu(null);
    setNombreEditado(a.nombre_completo);
    setMatriculaEditada(a.matricula);
    setEditandoId(a.id_estudiante);
  };

  const empezarEliminacion = (a: EstudianteAPI) => {
    setMenu(null);
    setEliminandoId(a.id_estudiante);
  };

  const guardarCambios = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editandoId) return;

    setEstudiantes((prev) =>
      prev.map((est) =>
        est.id_estudiante === editandoId
          ? { ...est, nombre_completo: nombreEditado, matricula: matriculaEditada }
          : est
      )
    );
    setEditandoId(null);
  };

  const confirmarEliminacion = () => {
    if (!eliminandoId) return;
    setEstudiantes((prev) => prev.filter((est) => est.id_estudiante !== eliminandoId));
    setEliminandoId(null);
  };

  if (cargando) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Cargando información académica...</div>;
  }

  if (errorMsg) {
    return (
      <div style={{ padding: "20px", color: "#991b1b", backgroundColor: "#fee2e2", borderRadius: "8px", margin: "10px" }}>
        <strong>Error de conexión:</strong> {errorMsg}
        <br />
        <button onClick={cargarDatos} style={{ marginTop: "10px", padding: "6px 12px", cursor: "pointer", borderRadius: "4px", border: "1px solid #dc2626", background: "#fff" }}>
          Reintentar conexión
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* 1. TARJETAS DE RIESGO */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "16px", padding: "16px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AlertTriangle color="#dc2626" size={24} />
          </div>
          <div>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#dc2626" }}>Riesgo alto</span>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#991b1b", lineHeight: 1.2 }}>{metricas.alto}</div>
            <span style={{ fontSize: "12px", color: "#b91c1c" }}>{metricas.pctAlto}% del total</span>
          </div>
        </div>

        <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "16px", padding: "16px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AlertCircle color="#d97706" size={24} />
          </div>
          <div>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#d97706" }}>Riesgo medio</span>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#b45309", lineHeight: 1.2 }}>{metricas.medio}</div>
            <span style={{ fontSize: "12px", color: "#d97706" }}>{metricas.pctMedio}% del total</span>
          </div>
        </div>

        <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "16px", padding: "16px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle2 color="#16a34a" size={24} />
          </div>
          <div>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#16a34a" }}>Riesgo bajo</span>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#15803d", lineHeight: 1.2 }}>{metricas.bajo}</div>
            <span style={{ fontSize: "12px", color: "#16a34a" }}>{metricas.pctBajo}% del total</span>
          </div>
        </div>
      </div>

      {/* 2. FILTROS Y ÚNICA TABLA PRINCIPAL */}
      <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ position: "relative", flex: "1 1 240px", minWidth: "200px" }}>
            <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Buscar alumno (nombre, matrícula...)"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 40px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                outline: "none",
                fontSize: "14px",
              }}
            />
          </div>

          <select
            value={riesgoFiltro}
            onChange={(e) => setRiesgoFiltro(e.target.value)}
            style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", backgroundColor: "#fff", cursor: "pointer" }}
          >
            <option value="todos">Todos los niveles de riesgo</option>
            <option value="alto">Alto riesgo</option>
            <option value="medio">Riesgo medio</option>
            <option value="bajo">Riesgo bajo</option>
            <option value="sin evaluar">Sin evaluar</option>
          </select>

          <select
            value={carreraFiltro}
            onChange={(e) => setCarreraFiltro(e.target.value)}
            style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", backgroundColor: "#fff", cursor: "pointer" }}
          >
            <option value="todas">Todas las carreras</option>
            {carrerasDisponibles.map((car) => (
              <option key={car} value={car}>{car}</option>
            ))}
          </select>

          <select
            value={grupoFiltro}
            onChange={(e) => setGrupoFiltro(e.target.value)}
            style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", backgroundColor: "#fff", cursor: "pointer" }}
          >
            <option value="todos">Todos los grupos</option>
            {gruposDisponibles.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <button
            onClick={cargarDatos}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              backgroundColor: "#f8fafc",
              color: "#1e293b",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <RefreshCw size={16} /> Actualizar lista
          </button>

          <button
            onClick={() => alert("Formulario para agregar alumno.")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 16px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Plus size={18} /> Agregar alumno
          </button>
        </div>

        {/* TABLA PRINCIPAL */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #f1f5f9", textAlign: "left", color: "#64748b" }}>
                <th style={{ padding: "12px 10px" }}>Matrícula</th>
                <th style={{ padding: "12px 10px" }}>Alumno</th>
                <th style={{ padding: "12px 10px" }}>Carrera</th>
                <th style={{ padding: "12px 10px" }}>Grupo</th>
                <th style={{ padding: "12px 10px" }}>Promedio General</th>
                <th style={{ padding: "12px 10px" }}>Riesgo</th>
                <th style={{ padding: "12px 10px" }}>Probabilidad</th>
                <th style={{ padding: "12px 10px" }}>Evaluación IA</th>
                <th style={{ padding: "12px 10px" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {estudiantesPagina.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "24px", color: "#94a3b8" }}>
                    No se encontraron alumnos coincidentes en la base de datos.
                  </td>
                </tr>
              ) : (
                estudiantesPagina.map((a) => {
                  const riesgoClase = (a.riesgo || "sin evaluar").toLowerCase();
                  const etiqueta = etiquetas[riesgoClase] || etiquetas["sin evaluar"];
                  const promedioMostrar = typeof a.promedio === "number" ? a.promedio.toFixed(1) : "N/A";

                  return (
                    <tr key={a.id_estudiante} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 10px", color: "#64748b" }}>{a.matricula}</td>
                      <td style={{ padding: "12px 10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              backgroundColor: etiqueta.color,
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                          >
                            {obtenerIniciales(a.nombre_completo)}
                          </div>
                          <strong>{a.nombre_completo}</strong>
                        </div>
                      </td>
                      <td style={{ padding: "12px 10px" }}>{a.carrera}</td>
                      <td style={{ padding: "12px 10px" }}>{a.grupo}</td>
                      <td style={{ padding: "12px 10px", fontWeight: 600, color: "#1e293b" }}>
                        {promedioMostrar}
                      </td>
                      <td style={{ padding: "12px 10px" }}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "12px",
                            backgroundColor: etiqueta.color,
                            color: "#fff",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          {etiqueta.texto}
                        </span>
                      </td>
                      <td style={{ padding: "12px 10px" }}>{a.probabilidad ? `${a.probabilidad}%` : "0%"}</td>
                      <td style={{ padding: "12px 10px" }}>
                        <button
                          onClick={() => handlePredecir(a.id_estudiante)}
                          disabled={procesandoId === a.id_estudiante}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "1px solid #cbd5e1",
                            backgroundColor: "#fff",
                            cursor: "pointer",
                            fontSize: "13px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <RefreshCw size={14} className={procesandoId === a.id_estudiante ? "spin" : ""} />
                          {procesandoId === a.id_estudiante ? "Analizando..." : "Re-evaluar"}
                        </button>
                      </td>
                      <td style={{ padding: "12px 10px" }}>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button
                            onClick={() => setViendoId(a.id_estudiante)}
                            style={{ border: "none", background: "transparent", cursor: "pointer", padding: "4px" }}
                            title="Ver calificaciones y materias reprobadas"
                          >
                            <Eye size={18} color="#64748b" />
                          </button>
                          <button
                            onClick={(e) => abrirMenuAcciones(e, a.id_estudiante)}
                            style={{ border: "none", background: "transparent", cursor: "pointer", padding: "4px" }}
                            title="Opciones"
                          >
                            <EllipsisVertical size={18} color="#64748b" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
          <span style={{ fontSize: "14px", color: "#64748b" }}>
            Mostrando {estudiantesPagina.length} de {totalFiltrados} alumnos
          </span>

          <div style={{ display: "flex", gap: "4px" }}>
            <button
              onClick={() => setPagina((prev) => Math.max(prev - 1, 1))}
              disabled={pagina <= 1}
              style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#fff", cursor: pagina <= 1 ? "not-allowed" : "pointer" }}
            >
              <ChevronLeft size={16} />
            </button>
            {paginas.map((p) => (
              <button
                key={p}
                onClick={() => setPagina(p)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: p === pagina ? "#2563eb" : "#fff",
                  color: p === pagina ? "#fff" : "#1e293b",
                  fontWeight: p === pagina ? "bold" : "normal",
                  cursor: "pointer",
                }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPagina((prev) => Math.min(prev + 1, totalPaginas))}
              disabled={pagina >= totalPaginas}
              style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#fff", cursor: pagina >= totalPaginas ? "not-allowed" : "pointer" }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* MENÚ FLOTANTE */}
      {menu && alumnoMenu && (
        <div
          style={{
            position: "fixed",
            top: menu.y,
            left: menu.x,
            width: ANCHO_MENU,
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e2e8f0",
            zIndex: 9999,
            padding: "4px 0",
          }}
          role="menu"
        >
          <button
            onClick={() => empezarEdicion(alumnoMenu)}
            style={{ width: "100%", padding: "8px 12px", border: "none", background: "transparent", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#334155" }}
          >
            <Pencil size={15} /> Editar alumno
          </button>
          <button
            onClick={() => empezarEliminacion(alumnoMenu)}
            style={{ width: "100%", padding: "8px 12px", border: "none", background: "transparent", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#dc2626" }}
          >
            <Trash2 size={15} /> Eliminar alumno
          </button>
        </div>
      )}

      {/* MODAL EMERGENTE: DETALLE DE CALIFICACIONES Y MATERIAS REPROBADAS */}
      {alumnoVer && (
        <ModalEmergente
          titulo="Desempeño Académico del Alumno"
          subtitulo={alumnoVer.nombre_completo}
          onCerrar={() => setViendoId(null)}
        >
          {/* Ficha General */}
          <div style={{ backgroundColor: "#f8fafc", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "14px" }}>
              <div><strong>Matrícula:</strong> {alumnoVer.matricula}</div>
              <div><strong>Grupo:</strong> {alumnoVer.grupo}</div>
              <div><strong>Carrera:</strong> {alumnoVer.carrera}</div>
              <div><strong>Riesgo:</strong> {(alumnoVer.riesgo || "sin evaluar").toUpperCase()}</div>
            </div>
          </div>

          {/* Calificación General y Asistencia */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
            <div style={{ flex: 1, backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <span style={{ fontSize: "12px", color: "#1d4ed8", fontWeight: 600 }}>PROMEDIO GENERAL</span>
              <div style={{ fontSize: "22px", fontWeight: "bold", color: "#1e40af" }}>
                {typeof alumnoVer.promedio === "number" ? alumnoVer.promedio.toFixed(1) : "N/A"}
              </div>
            </div>
            <div style={{ flex: 1, backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <span style={{ fontSize: "12px", color: "#15803d", fontWeight: 600 }}>ASISTENCIA</span>
              <div style={{ fontSize: "22px", fontWeight: "bold", color: "#166534" }}>
                {typeof alumnoVer.asistencia === "number" ? `${alumnoVer.asistencia}%` : "N/A"}
              </div>
            </div>
          </div>

          {/* Lista de Materias Reprobadas */}
          <div>
            <h4 style={{ margin: "0 0 10px 0", fontSize: "15px", color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
              <BookX size={18} color="#dc2626" /> Materias Reprobadas
            </h4>
            {!alumnoVer.materias_reprobadas || alumnoVer.materias_reprobadas.length === 0 ? (
              <p style={{ margin: 0, padding: "12px", backgroundColor: "#f0fdf4", color: "#166534", borderRadius: "6px", fontSize: "13px", border: "1px solid #bbf7d0" }}>
                🟢 Este estudiante no tiene materias reprobadas actualmente.
              </p>
            ) : (
              <div style={{ border: "1px solid #fee2e2", borderRadius: "8px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#fef2f2", color: "#991b1b", textAlign: "left" }}>
                      <th style={{ padding: "8px 12px" }}>Materia</th>
                      <th style={{ padding: "8px 12px", textAlign: "right" }}>Calificación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alumnoVer.materias_reprobadas.map((mat: MateriaReprobada, idx: number) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #fee2e2" }}>
                        <td style={{ padding: "8px 12px", fontWeight: 500 }}>{mat.nombre}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right", color: "#dc2626", fontWeight: "bold" }}>
                          {mat.calificacion.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </ModalEmergente>
      )}

      {/* MODAL: EDITAR ALUMNO */}
      {alumnoEditar && (
        <ModalEmergente
          titulo="Editar alumno"
          subtitulo="Actualizar datos básicos"
          onCerrar={() => setEditandoId(null)}
          pie={
            <button
              type="submit"
              form="form-editar-emergente"
              style={{ padding: "8px 16px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "6px", fontWeight: 600, cursor: "pointer" }}
            >
              Guardar Cambios
            </button>
          }
        >
          <form id="form-editar-emergente" onSubmit={guardarCambios} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 600 }}>Nombre Completo</label>
              <input
                type="text"
                value={nombreEditado}
                onChange={(e) => setNombreEditado(e.target.value)}
                required
                style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", outline: "none" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 600 }}>Matrícula</label>
              <input
                type="text"
                value={matriculaEditada}
                onChange={(e) => setMatriculaEditada(e.target.value)}
                required
                style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", outline: "none" }}
              />
            </div>
          </form>
        </ModalEmergente>
      )}

      {/* MODAL: ELIMINAR ALUMNO */}
      {alumnoEliminar && (
        <ModalEmergente
          titulo="Eliminar Alumno"
          subtitulo="Confirmación requerida"
          onCerrar={() => setEliminandoId(null)}
          pie={
            <button
              onClick={confirmarEliminacion}
              style={{ padding: "8px 16px", backgroundColor: "#dc2626", color: "#ffffff", border: "none", borderRadius: "6px", fontWeight: 600, cursor: "pointer" }}
            >
              Sí, eliminar
            </button>
          }
        >
          <p style={{ margin: 0 }}>
            ¿Seguro que deseas eliminar a <strong>{alumnoEliminar.nombre_completo}</strong> del sistema?
          </p>
        </ModalEmergente>
      )}
    </div>
  );
}

export const TablaEstudiantesAPI = TablaAlumnos;
export default TablaAlumnos;