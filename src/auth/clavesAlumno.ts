// Claves de acceso de los alumnos.
//
// IMPORTANTE: todavía no hay un backend de autenticación, así que la clave se guarda
// en este navegador (nunca en texto plano: se cifra con PBKDF2 y una sal propia).
// Eso significa que la clave solo existe en el equipo donde se creó.
// Cuando se conecte el backend, estas funciones se reemplazan por llamadas a la API
// y el cifrado y la verificación pasan al servidor.

const ALMACEN = 'proedu-claves-alumnos';
export const LARGO_MINIMO = 6;

const MAX_INTENTOS = 5;
const BLOQUEO_MS = 60_000;
const ITERACIONES = 150_000;

interface Registro {
  sal: string;
  hash: string;
  intentos: number;
  bloqueadoHasta: number;
}

type Almacen = Record<string, Registro>;

// Ignora guiones, espacios y mayúsculas al comparar matrículas
const limpiar = (matricula: string) =>
  matricula.replace(/[^0-9a-z]/gi, '').toLowerCase();

function leer(): Almacen {
  try {
    return JSON.parse(localStorage.getItem(ALMACEN) ?? '{}') as Almacen;
  } catch {
    return {};
  }
}

function escribir(almacen: Almacen) {
  try {
    localStorage.setItem(ALMACEN, JSON.stringify(almacen));
  } catch {
    // sin almacenamiento disponible: la clave no se podrá guardar
  }
}

const aHex = (bytes: Uint8Array) =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

async function derivar(clave: string, sal: string): Promise<string> {
  const codificador = new TextEncoder();
  const material = await crypto.subtle.importKey(
    'raw',
    codificador.encode(clave),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: codificador.encode(sal),
      iterations: ITERACIONES,
    },
    material,
    256
  );
  return aHex(new Uint8Array(bits));
}

// Compara sin cortar en la primera diferencia
function iguales(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diferencia = 0;
  for (let i = 0; i < a.length; i++) {
    diferencia |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diferencia === 0;
}

/** ¿Este alumno ya creó su clave? (si no, es su primer acceso) */
export function tieneClave(matricula: string): boolean {
  return Boolean(leer()[limpiar(matricula)]);
}

/** Guarda la clave del primer acceso. Devuelve false si no se pudo guardar. */
export async function crearClave(
  matricula: string,
  clave: string
): Promise<boolean> {
  try {
    const id = limpiar(matricula);
    const almacen = leer();
    if (almacen[id]) return false; // ya tenía una clave

    const sal = aHex(crypto.getRandomValues(new Uint8Array(16)));
    const hash = await derivar(clave, sal);
    almacen[id] = { sal, hash, intentos: 0, bloqueadoHasta: 0 };
    escribir(almacen);
    return Boolean(leer()[id]); // confirma que de verdad se guardó
  } catch {
    return false;
  }
}

export type Verificacion =
  | { ok: true }
  | { ok: false; motivo: 'incorrecta'; restantes: number }
  | { ok: false; motivo: 'bloqueada'; segundos: number }
  | { ok: false; motivo: 'sinClave' | 'error' };

/** Revisa la clave de un alumno. Tras 5 fallos seguidos se bloquea 1 minuto. */
export async function verificarClave(
  matricula: string,
  clave: string
): Promise<Verificacion> {
  const id = limpiar(matricula);
  const almacen = leer();
  const registro = almacen[id];
  if (!registro) return { ok: false, motivo: 'sinClave' };

  const ahora = Date.now();
  if (registro.bloqueadoHasta > ahora) {
    return {
      ok: false,
      motivo: 'bloqueada',
      segundos: Math.ceil((registro.bloqueadoHasta - ahora) / 1000),
    };
  }

  let hash: string;
  try {
    hash = await derivar(clave, registro.sal);
  } catch {
    return { ok: false, motivo: 'error' };
  }

  if (iguales(hash, registro.hash)) {
    almacen[id] = { ...registro, intentos: 0, bloqueadoHasta: 0 };
    escribir(almacen);
    return { ok: true };
  }

  const intentos = registro.intentos + 1;
  if (intentos >= MAX_INTENTOS) {
    almacen[id] = {
      ...registro,
      intentos: 0,
      bloqueadoHasta: ahora + BLOQUEO_MS,
    };
    escribir(almacen);
    return { ok: false, motivo: 'bloqueada', segundos: BLOQUEO_MS / 1000 };
  }

  almacen[id] = { ...registro, intentos };
  escribir(almacen);
  return { ok: false, motivo: 'incorrecta', restantes: MAX_INTENTOS - intentos };
}

/** Borra la clave de un alumno para que cree una nueva (por si la olvidó). */
export function restablecerClave(matricula: string) {
  const almacen = leer();
  delete almacen[limpiar(matricula)];
  escribir(almacen);
}