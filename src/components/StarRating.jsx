export default function StarRating({ rating, reviews }) {
  if (!rating) return null
  return (
    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= Math.round(rating) ? '#FFB800' : '#333'}>
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
      <span style={{ color: '#888', fontSize: '12px', marginLeft: '4px' }}>{rating} ({reviews || 0} reviews)</span>
    </div>
  )
}
