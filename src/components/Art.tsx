// Hand-drawn line art from OpenMoji (CC BY-SA 4.0, openmoji.org), self-hosted in /public/art.
export default function Art({ id, size = 96, label, className = '' }: { id?: string; size?: number; label?: string; className?: string }) {
  if (!id || !/^[0-9A-F-]{2,40}$/.test(id)) return null
  return (
    <img
      className={`art ${className}`}
      src={`/art/${id}.svg`}
      width={size}
      height={size}
      alt={label ?? ''}
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  )
}
