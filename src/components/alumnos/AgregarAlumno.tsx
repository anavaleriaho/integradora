import { useState } from 'react';
import type { FormEvent } from 'react';
import { UserPlus, TriangleAlert } from 'lucide-react';
import Modal from './Modal';
import { CARRERAS } from '../../data/carreras';

export interface NuevoAlumno {
  nombre: string;
  matricula: string;
  carrera: string;
  semestre: number;
}

interface Props {
  // Devuelve un mensaje de error (por ejemplo, matrícula repetida) o null si todo salió bien
  onAgregar: (datos: NuevoAlumno) => string | null;
  onCerrar: () => void;
}

const carreras: string[] = Object.values(CARRERAS);
const cuatrimestres = Array.from({ length: 12 }, (_, i) => i + 1);

export default function AgregarAlumno({ onAgregar, onCerrar }: Props) {
  const [nombre, setNombre] = useState('');
  const [matricula, setMatricula] = useState('');
  const [carrera, setCarrera] = useState('');
  const [semestre, setSemestre] = useState('');
  const [error, setError] = useState('');

  const completo =
    nombre.trim() !== '' &&
    matricula.trim() !== '' &&
    carrera !== '' &&
    semestre !== '';

  const guardar = (e: FormEvent) => {
    e.preventDefault();
    if (!completo) {
      setError('Completa todos los campos.');
      return;
    }

    const resultado = onAgregar({
      nombre: nombre.trim().replace(/\s+/g, ' '),
      matricula: matricula.trim(),
      carrera,
      semestre: Number(semestre),
    });

    if (resultado) {
      setError(resultado);
      return;
    }
    onCerrar();
  };

  return (
    <Modal
      titulo="Agregar alumno"
      subtitulo="Captura los datos básicos del nuevo alumno."
      icono={<UserPlus size={22} />}
      tono="azul"
      onCerrar={onCerrar}
      pie={
        <button
          type="submit"
          form="formulario-agregar-alumno"
          className="al-btn-prim"
          disabled={!completo}
        >
          Agregar alumno
        </button>
      }
    >
      <form id="formulario-agregar-alumno" onSubmit={guardar}>
        <label className="al-modal-campo">
          <span>Nombre completo</span>
          <input
            type="text"
            value={nombre}
            placeholder="Ejemplo: Ana Valeria Herrera Ontiveros"
            onChange={(e) => {
              setNombre(e.target.value);
              setError('');
            }}
            autoFocus
          />
        </label>

        <div className="al-modal-fila">
          <label className="al-modal-campo">
            <span>Matrícula</span>
            <input
              type="text"
              value={matricula}
              placeholder="Ejemplo: 2025-00123"
              onChange={(e) => {
                setMatricula(e.target.value);
                setError('');
              }}
            />
          </label>

          <label className="al-modal-campo">
            <span>Cuatrimestre</span>
            <select
              value={semestre}
              onChange={(e) => {
                setSemestre(e.target.value);
                setError('');
              }}
            >
              <option value="">Selecciona</option>
              {cuatrimestres.map((c) => (
                <option key={c} value={c}>
                  {c}° cuatrimestre
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="al-modal-campo">
          <span>Carrera</span>
          <select
            value={carrera}
            onChange={(e) => {
              setCarrera(e.target.value);
              setError('');
            }}
          >
            <option value="">Selecciona una carrera</option>
            {carreras.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        {error && (
          <div className="al-modal-error" role="alert">
            <TriangleAlert size={16} />
            {error}
          </div>
        )}
      </form>
    </Modal>
  );
}