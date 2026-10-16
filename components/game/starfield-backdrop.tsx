const SMALL_STARS =
  'radial-gradient(1px 1px at 20px 30px, #e0f2fe, transparent), radial-gradient(1px 1px at 120px 80px, #c4b5fd, transparent), radial-gradient(1px 1px at 200px 160px, #e0f2fe, transparent), radial-gradient(1px 1px at 60px 220px, #fff, transparent), radial-gradient(1px 1px at 260px 260px, #bae6fd, transparent), radial-gradient(1px 1px at 330px 50px, #fff, transparent)'
const BIG_STARS =
  'radial-gradient(2px 2px at 80px 120px, #e9d5ff, transparent), radial-gradient(2px 2px at 300px 200px, #bae6fd, transparent), radial-gradient(1.5px 1.5px at 180px 340px, #fff, transparent)'

export function StarfieldBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <div className="absolute -left-1/4 -top-1/4 size-[70vmax] rounded-full bg-accent/15 blur-3xl" />
      <div className="absolute -bottom-1/3 -right-1/4 size-[70vmax] rounded-full bg-primary/10 blur-3xl" />
      <div
        className="absolute inset-0 animate-drift opacity-70"
        style={{ backgroundImage: SMALL_STARS, backgroundSize: '400px 400px' }}
      />
      <div
        className="absolute inset-0 animate-drift-fast opacity-80"
        style={{ backgroundImage: BIG_STARS, backgroundSize: '400px 400px' }}
      />
    </div>
  )
}
