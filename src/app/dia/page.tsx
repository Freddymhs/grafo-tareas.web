import { ElDia } from "./el-dia";

export default function DiaPage() {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">El día</h1>
      <p className="mb-4 text-sm text-gray-500">
        El parte para la daily (terminé · en curso · detenido), lo que está en curso de más y los
        cierres que faltan. Lo calcula la API; acá solo se muestra.
      </p>
      <ElDia />
    </div>
  );
}
