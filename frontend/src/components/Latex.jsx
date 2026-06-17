import { InlineMath, BlockMath } from 'react-katex'
export default function RenderContenido({ texto }) {
  const partes = texto.split('$$')
  return (
    <>
      {partes.map((parte, i) =>
        i % 2 === 0
          ? <span key={i}>{parte}</span>
          : <BlockMath key={i} math={parte} />
      )}
    </>
  )
}