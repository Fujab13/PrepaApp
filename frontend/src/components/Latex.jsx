import { BlockMath } from 'react-katex'

export default function RenderContenido({ texto }) {
  const partes = texto.split('$$')

  return (
    <>
      {partes.map((parte, i) =>
        i % 2 === 0 ? (
          <div
            key={i}
            style={{
              whiteSpace: 'pre-line',
              lineHeight: 1.6
            }}
          >
            {parte}
          </div>
        ) : (
          <BlockMath key={i} math={parte} />
        )
      )}
    </>
  )
}