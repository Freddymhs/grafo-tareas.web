import { NodoDetalle } from "./nodo-detalle";

export default async function NodoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NodoDetalle id={id} />;
}
