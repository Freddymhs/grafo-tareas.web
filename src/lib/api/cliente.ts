// El único fetch de la app: lo usan los hooks generados por Orval (mutator). Apunta a la API por
// NEXT_PUBLIC_API_URL y desenvuelve el sobre `{ statusCode, data, meta }` del ResponseInterceptor de la API,
// así los hooks devuelven exactamente el tipo que declara el OpenAPI.
import { API_URL } from "@/lib/constants";

interface Sobre<T> {
  readonly data: T;
}

interface ErrorApi {
  readonly statusCode: number;
  readonly error: string;
  readonly message: string;
}

export class ErrorDeApi extends Error {
  constructor(
    readonly statusCode: number,
    readonly codigo: string,
    mensaje: string,
  ) {
    super(mensaje);
    this.name = "ErrorDeApi";
  }
}

const SIN_CONTENIDO = 204;

export async function cliente<T>(url: string, opciones: RequestInit): Promise<T> {
  const respuesta = await fetch(`${API_URL}${url}`, opciones);
  if (!respuesta.ok) {
    const cuerpo = (await respuesta.json().catch(() => null)) as ErrorApi | null;
    throw new ErrorDeApi(
      respuesta.status,
      cuerpo?.error ?? "HTTP_ERROR",
      cuerpo?.message ?? `${opciones.method ?? "GET"} ${url} respondió ${respuesta.status}`,
    );
  }
  if (respuesta.status === SIN_CONTENIDO) {
    return undefined as T;
  }
  const sobre = (await respuesta.json()) as Sobre<T>;
  return sobre.data;
}
