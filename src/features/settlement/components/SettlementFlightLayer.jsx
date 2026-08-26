/**
 * Fixed-layer flying chips during settlement (win → TOTAL WIN, lose → down).
 */
export function SettlementFlightLayer({ flights = [] }) {
  if (!flights.length) return null

  return (
    <div className="settlement-flights" aria-hidden="true">
      {flights.map((flight) => {
        const dx = flight.to.x - flight.from.x
        const dy = flight.to.y - flight.from.y
        return (
          <span
            key={flight.id}
            className={`settlement-flight settlement-flight--${flight.outcome}`}
            style={{
              left: flight.from.x,
              top: flight.from.y,
              width: flight.size,
              height: flight.size,
              animationDelay: `${flight.delayMs}ms`,
              '--flight-dx': `${dx}px`,
              '--flight-dy': `${dy}px`,
              ...(flight.durationMs
                ? { '--flight-duration': `${flight.durationMs}ms` }
                : null),
            }}
          >
            {flight.src ? (
              <img src={flight.src} alt="" draggable={false} />
            ) : null}
          </span>
        )
      })}
    </div>
  )
}
