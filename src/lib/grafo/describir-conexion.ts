import type { ConexionResponseDto } from "@/lib/api/generado/modelos";
import { TEXTO_CONEXION } from "@/lib/constants";

export interface ConexionDescrita {
  readonly id: string;
  /** El otro extremo, visto desde el nodo que se está mirando. */
  readonly otroId: string;
  /** true si el nodo mirado es el origen ("este depende de otro"); false si lo apuntan ("otro depende de este"). */
  readonly esOrigen: boolean;
  readonly texto: string;
}

export function describirConexion(
  conexion: ConexionResponseDto,
  desdeId: string,
): ConexionDescrita {
  const esOrigen = conexion.origenId === desdeId;
  return {
    id: conexion.id,
    otroId: esOrigen ? conexion.destinoId : conexion.origenId,
    esOrigen,
    texto: TEXTO_CONEXION[conexion.tipo],
  };
}
