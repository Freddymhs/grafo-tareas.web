import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// Las descripciones vienen de Todoist en Markdown (106 de 134, con títulos, listas y tablas en el Draft).
// react-markdown no renderiza HTML crudo: una descripción no puede inyectar nada. Sin plugin de tipografía:
// cada elemento lleva su clase acá.
const COMPONENTES: Components = {
  h1: ({ children }) => <h3 className="mt-4 mb-2 text-lg font-bold">{children}</h3>,
  h2: ({ children }) => <h4 className="mt-4 mb-2 text-base font-bold">{children}</h4>,
  h3: ({ children }) => <h5 className="mt-3 mb-1 font-semibold">{children}</h5>,
  p: ({ children }) => <p className="my-2 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-blue-600 underline">
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded bg-gray-200 px-1 py-0.5 font-mono text-xs">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="my-2 overflow-x-auto rounded bg-gray-100 p-3 text-xs">{children}</pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-4 border-gray-300 pl-3 text-gray-600">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table className="min-w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-gray-300 bg-gray-100 px-2 py-1 text-left">{children}</th>
  ),
  td: ({ children }) => <td className="border border-gray-300 px-2 py-1">{children}</td>,
};

export function Descripcion({ texto }: { texto: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-800">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTES}>
        {texto}
      </ReactMarkdown>
    </div>
  );
}
