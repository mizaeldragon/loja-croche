export function SkeletonBlock({ className = '' }) {
  return <div className={`skeleton rounded-xl ${className}`} />
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-espresso-700/[0.06] bg-white">
      <SkeletonBlock className="aspect-[4/5] w-full rounded-none" />
      <div className="space-y-3 p-5">
        <SkeletonBlock className="h-3 w-1/3" />
        <SkeletonBlock className="h-4 w-3/4" />
        <SkeletonBlock className="h-4 w-1/2" />
      </div>
    </div>
  )
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <SkeletonBlock className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}
