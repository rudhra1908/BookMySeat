import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../../src/api';

const STATUS_DOT = {
  booked: 'bg-amber',
  'checked-in': 'bg-violet',
  completed: 'bg-dim',
  cancelled: 'bg-dim/50',
  expired: 'bg-magenta',
  'no-show': 'bg-magenta',
};

function formatRange(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const dateStr = s.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const timeFmt = (d) => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return { dateStr, timeStr: `${timeFmt(s)}–${timeFmt(e)}` };
}

function minutesUntil(date) {
  return Math.round((new Date(date) - new Date()) / 60000);
}

export default function ReservationHistory() {
  const { token } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actioningId, setActioningId] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchReservations = useCallback(async () => {
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/reservations/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load reservations');
      setReservations(data.reservations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReservations();
    const interval = setInterval(fetchReservations, 30000);
    return () => clearInterval(interval);
  }, [fetchReservations]);

  const runAction = async (id, path, method = 'PATCH') => {
    setActioningId(id);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/reservations/${id}${path}`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Action failed');
      await fetchReservations();
    } catch (err) {
      setError(err.message);
    } finally {
      setActioningId(null);
    }
  };

  const now = new Date();
  const filtered = reservations.filter((r) => {
    if (filter === 'upcoming') return new Date(r.endTime) >= now;
    if (filter === 'past') return new Date(r.endTime) < now;
    return true;
  });

  return (
    <div className="min-h-screen bg-ink bg-noise">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between border-b border-line pb-5">
          <div>
            <p className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase mb-1">Your Stub Book</p>
            <h2 className="font-display text-2xl text-parchment">Reservations</h2>
          </div>
          <div className="flex gap-1 font-mono text-xs bg-surface border border-line rounded-lg p-1">
            {['all', 'upcoming', 'past'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md capitalize transition-colors ${
                  filter === f ? 'bg-lime text-ink' : 'text-dim hover:text-parchment'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="text-sm text-magenta bg-magenta/10 border border-magenta/30 rounded-lg px-4 py-2.5 font-mono">
            ⚠ {error}
          </div>
        )}

        {loading ? (
          <p className="font-mono text-sm text-dim animate-pulse">pulling your file…</p>
        ) : filtered.length === 0 ? (
          <p className="font-mono text-sm text-dim py-16 text-center">— no stubs here —</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((r) => {
              const { dateStr, timeStr } = formatRange(r.startTime, r.endTime);
              const canCheckIn = r.status === 'booked' && minutesUntil(r.checkInDeadline) > 0;
              const urgent = canCheckIn && minutesUntil(r.checkInDeadline) <= 5;
              const canCancel = ['booked', 'checked-in'].includes(r.status);

              return (
                <div
                  key={r._id}
                  className="flex bg-surface border border-line rounded-xl overflow-hidden shadow-lg"
                >
                  {/* Stub main body */}
                  <div className="flex-1 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[r.status] || 'bg-dim'}`} />
                      <span className="font-mono text-[10px] tracking-widest text-dim uppercase">{r.status}</span>
                    </div>
                    <p className="font-display text-xl text-parchment">{r.seat.seatNumber}</p>
                    <p className="font-mono text-xs text-dim mt-0.5">{r.seat.zone}</p>
                    <div className="flex items-center gap-3 mt-3 font-mono text-xs text-parchment/80">
                      <span>{dateStr}</span>
                      <span className="text-line">|</span>
                      <span>{timeStr}</span>
                    </div>
                    {canCheckIn && (
                      <p className={`font-mono text-[11px] mt-2 ${urgent ? 'text-magenta' : 'text-amber'}`}>
                        {urgent ? '⚠ ' : ''}check in within {minutesUntil(r.checkInDeadline)} min
                      </p>
                    )}
                  </div>

                  {/* Perforated tear line */}
                  <div className="w-px bg-line relative">
                    <div className="absolute inset-0 ticket-perforation" />
                  </div>

                  {/* Stub action strip */}
                  <div className="w-32 flex flex-col items-center justify-center gap-2 p-3 bg-surface2">
                    {canCheckIn && (
                      <button
                        onClick={() => runAction(r._id, '/check-in')}
                        disabled={actioningId === r._id}
                        className="w-full text-xs font-display py-2 rounded-lg bg-lime text-ink hover:shadow-glow transition-shadow disabled:opacity-50"
                      >
                        {actioningId === r._id ? '…' : 'CHECK IN'}
                      </button>
                    )}
                    {canCancel && (
                      <button
                        onClick={() => runAction(r._id, '', 'DELETE')}
                        disabled={actioningId === r._id}
                        className="w-full text-xs font-mono py-2 rounded-lg border border-line text-dim hover:text-magenta hover:border-magenta/50 transition-colors disabled:opacity-50"
                      >
                        cancel
                      </button>
                    )}
                    {!canCheckIn && !canCancel && (
                      <span className="font-mono text-[10px] text-dim/60 uppercase tracking-widest">
                        closed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
