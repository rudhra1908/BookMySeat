import { useState, useEffect, useCallback } from 'react';

/**
 * SeatGrid — the signature screen. Seats read like lights on a departure
 * board: dim amber-grey when taken, a solid lime glow when free, and a
 * violet pulse when selected. Zones are grouped like gate sections.
 */
export default function SeatGrid({ apiBaseUrl, token }) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [booking, setBooking] = useState(false);
  const [justBooked, setJustBooked] = useState(false);

  const toISO = (d, t) => new Date(`${d}T${t}:00`).toISOString();

  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        date,
        startTime: toISO(date, startTime),
        endTime: toISO(date, endTime),
      });
      const res = await fetch(`${apiBaseUrl}/api/seats/availability?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load seats');
      setSeats(data.seats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, token, date, startTime, endTime]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const handleReserve = async () => {
    if (!selectedSeat) return;
    setBooking(true);
    setError('');
    try {
      const res = await fetch(`${apiBaseUrl}/api/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          seatId: selectedSeat._id,
          startTime: toISO(date, startTime),
          endTime: toISO(date, endTime),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Booking failed');
      setJustBooked(true);
      setTimeout(() => setJustBooked(false), 1400);
      setSelectedSeat(null);
      fetchAvailability();
    } catch (err) {
      setError(err.message);
    } finally {
      setBooking(false);
    }
  };

  const seatsByZone = seats.reduce((acc, seat) => {
    (acc[seat.zone] = acc[seat.zone] || []).push(seat);
    return acc;
  }, {});

  const availableCount = seats.filter((s) => s.available).length;

  return (
    <div className="min-h-screen bg-ink bg-noise">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Header strip, styled like a departure board summary line */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
          <div>
            <p className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase mb-1">Live Availability</p>
            <h2 className="font-display text-2xl text-parchment">Find a seat</h2>
          </div>
          {!loading && (
            <div className="font-mono text-sm">
              <span className="text-lime">{availableCount}</span>
              <span className="text-dim"> / {seats.length} open</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-end bg-surface border border-line rounded-xl p-4">
          <Field label="Date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-surface2 border border-line rounded-lg px-3 py-2 text-sm text-parchment font-mono focus:outline-none focus:border-lime"
            />
          </Field>
          <Field label="Start">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="bg-surface2 border border-line rounded-lg px-3 py-2 text-sm text-parchment font-mono focus:outline-none focus:border-lime"
            />
          </Field>
          <Field label="End">
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="bg-surface2 border border-line rounded-lg px-3 py-2 text-sm text-parchment font-mono focus:outline-none focus:border-lime"
            />
          </Field>

          {/* Legend */}
          <div className="ml-auto flex gap-4 font-mono text-[11px] text-dim">
            <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-sm bg-lime shadow-glow inline-block" /> open</span>
            <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-sm bg-surface2 border border-line inline-block" /> taken</span>
            <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-sm bg-violet shadow-glow-violet inline-block" /> selected</span>
          </div>
        </div>

        {error && (
          <div className="text-sm text-magenta bg-magenta/10 border border-magenta/30 rounded-lg px-4 py-2.5 font-mono">
            ⚠ {error}
          </div>
        )}

        {loading ? (
          <p className="font-mono text-sm text-dim animate-pulse">scanning the room…</p>
        ) : (
          <div className="space-y-7">
            {Object.entries(seatsByZone).map(([zone, zoneSeats]) => (
              <div key={zone}>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-display text-xs tracking-wide text-violet uppercase">{zone}</h3>
                  <span className="flex-1 h-px bg-line" />
                  <span className="font-mono text-[10px] text-dim">
                    {zoneSeats.filter((s) => s.available).length}/{zoneSeats.length}
                  </span>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
                  {zoneSeats.map((seat) => {
                    const isSelected = selectedSeat?._id === seat._id;
                    return (
                      <button
                        key={seat._id}
                        disabled={!seat.available}
                        onClick={() => setSelectedSeat(seat)}
                        title={seat.hasPowerOutlet ? `${seat.seatNumber} · has outlet` : seat.seatNumber}
                        className={[
                          'relative font-mono text-[11px] font-medium rounded-md py-3 border transition-all duration-150',
                          !seat.available
                            ? 'bg-surface2 text-dim/50 border-line cursor-not-allowed'
                            : isSelected
                            ? 'bg-violet text-ink border-violet shadow-glow-violet scale-105'
                            : 'bg-surface text-lime border-lime/40 shadow-glow hover:scale-105 hover:border-lime cursor-pointer',
                        ].join(' ')}
                      >
                        {seat.seatNumber}
                        {seat.hasPowerOutlet && seat.available && !isSelected && (
                          <span className="absolute top-0.5 right-0.5 text-[8px] text-amber">⚡</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking confirm bar — sticky ticket-style panel */}
      {selectedSeat && (
        <div className="fixed bottom-0 left-0 right-0 z-20">
          <div className="max-w-5xl mx-auto px-6 pb-6">
            <div className="bg-surface border border-violet/50 shadow-glow-violet rounded-2xl p-5 flex items-center justify-between gap-4 scanlines">
              <div>
                <p className="font-mono text-[10px] tracking-[0.25em] text-violet uppercase mb-1">Confirm reservation</p>
                <p className="text-parchment text-sm">
                  Seat <span className="font-display text-violet">{selectedSeat.seatNumber}</span>
                  <span className="text-dim"> · {selectedSeat.zone} · {startTime}–{endTime} · {date}</span>
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setSelectedSeat(null)}
                  className="px-4 py-2 text-sm font-mono rounded-lg border border-line text-dim hover:text-parchment transition-colors"
                >
                  cancel
                </button>
                <button
                  onClick={handleReserve}
                  disabled={booking}
                  className="px-5 py-2 text-sm font-display rounded-lg bg-lime text-ink hover:shadow-glow transition-shadow disabled:opacity-50"
                >
                  {booking ? 'BOOKING…' : 'CONFIRM'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stamp animation on successful booking */}
      {justBooked && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="font-display text-6xl text-lime border-4 border-lime rounded-2xl px-10 py-6 rotate-[-12deg] animate-stamp bg-ink/80">
            RESERVED
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block font-mono text-[10px] tracking-widest text-dim uppercase mb-1.5">{label}</label>
      {children}
    </div>
  );
}
