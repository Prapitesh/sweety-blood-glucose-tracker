import { useCallback, useEffect, useState } from 'react';
import {
  Activity, CalendarDays, ChevronLeft, ChevronRight, Droplet, HeartPulse,
  LogOut, Plus, Trash2, Pencil, TrendingUp
} from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import api, { getErrorMessage } from '../services/api';
import ReadingForm from '../components/ReadingForm';

const today = () => {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
};
const nice = (value) => new Date(value + 'T00:00:00').toLocaleDateString('en-IN', {
  day: 'numeric', month: 'short', year: 'numeric'
});
const slotNames = {
  morning: 'Morning (fasting)',
  after_breakfast: 'After breakfast',
  after_lunch: 'After lunch',
  after_dinner: 'After dinner'
};

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [report, setReport] = useState(null);
  const [date, setDate] = useState(today());
  const [modal, setModal] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);

  const load = useCallback(async () => {
    setBusy(true);
    setError('');
    try {
      const response = await api.get('/readings/reports', { params: { date } });
      setReport(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }, [date]);

  useEffect(() => { load(); }, [load]);

  const stats = report?.reports?.daily;
  const daily = report?.dailyReadings || [];
  const chart = report?.monthlyTrend || [];
  const previousMonth = report?.reports?.previousMonth;
  const monthToDate = report?.reports?.monthToDate;

  const shift = (amount) => {
    const next = new Date(date + 'T00:00:00');
    next.setDate(next.getDate() + amount);
    const value = [next.getFullYear(), String(next.getMonth() + 1).padStart(2, '0'), String(next.getDate()).padStart(2, '0')].join('-');
    if (value <= today()) setDate(value);
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this reading?')) return;
    try {
      await api.delete('/readings/' + id);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand"><HeartPulse /><b>Sweety</b></div>
        <p className="nav-label">WORKSPACE</p>
        <div className="nav-active"><Activity size={18} /> Overview</div>
        <div className="side-user">
          <span>{user?.name?.[0]?.toUpperCase() || 'U'}</span>
          <div><b>{user?.name || 'Personal account'}</b><small>Personal account</small></div>
          <button className="icon-btn" title="Sign out" aria-label="Sign out" onClick={signOut}><LogOut size={17} /></button>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <span className="eyebrow">YOUR PERSONAL HEALTH LOG</span>
            <h1>Your overview</h1>
            <p className="muted">Hello, {user?.name?.split(' ')[0] || 'there'}. Every check-in helps you see the bigger picture.</p>
          </div>
          <button className="primary add" onClick={() => setModal({})}><Plus size={18} /> Add reading</button>
        </header>

        {error && <p className="error banner" role="alert">{error}<button aria-label="Dismiss error" onClick={() => setError('')}>x</button></p>}

        <section className="section">
          <div className="section-title">
            <div><span className="eyebrow">AT A GLANCE</span><h2>Daily snapshot</h2></div>
            <div className="date-picker">
              <button onClick={() => shift(-1)} aria-label="Previous day"><ChevronLeft /></button>
              <b>{nice(date)}</b>
              <button onClick={() => shift(1)} disabled={date === today()} aria-label="Next day"><ChevronRight /></button>
            </div>
          </div>
          <div className="stats">
            <article className="stat purple"><span>Highest reading</span><strong>{stats?.highest ?? 'N/A'} <small>{stats?.highest ? 'mg/dL' : ''}</small></strong><TrendingUp /></article>
            <article className="stat blue"><span>Lowest reading</span><strong>{stats?.lowest ?? 'N/A'} <small>{stats?.lowest ? 'mg/dL' : ''}</small></strong><Droplet /></article>
            <article className="stat peach"><span>Average reading</span><strong>{stats?.average ?? 'N/A'} <small>{stats?.average !== null && stats?.average !== undefined ? 'mg/dL' : ''}</small></strong><Activity /></article>
            <article className="stat mint"><span>Readings logged</span><strong>{stats?.count ?? 0} <small>entries</small></strong><CalendarDays /></article>
          </div>
        </section>

        <div className="columns">
          <section className="panel">
            <div className="panel-title">
              <div><span className="eyebrow">YOUR TRENDS</span><h2>{new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</h2></div>
              <span className="legend">Daily average</span>
            </div>
            {chart.length ? (
              <div className="chart chart-bars" role="img" aria-label="Daily average glucose readings for the selected month">
                {chart.map((item) => {
                  const day = Number(item.date.slice(8, 10));
                  return (
                    <div className="chart-bar-wrap" key={item.date} title={'Day ' + day + ': ' + item.average.toFixed(1) + ' mg/dL'}>
                      <div className="chart-bar" style={{ height: Math.max(10, Math.min(100, item.average / 2)) + '%' }} />
                      <small>{day}</small>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty"><TrendingUp /><b>No trend data yet</b><p>Add readings to see your month at a glance.</p></div>
            )}
          </section>

          <section className="panel">
            <div className="panel-title">
              <div><span className="eyebrow">DAILY LOG</span><h2>Readings</h2></div>
              <span className="pill">{daily.length}/4</span>
            </div>
            {busy ? <div className="empty"><b>Loading readings...</b></div> : daily.length ? daily.map((reading) => (
              <div className="reading" key={reading.id}>
                <i />
                <div className="reading-info"><b>{slotNames[reading.slot]}</b><small>{nice(reading.date)}</small></div>
                <strong>{reading.value} <small>mg/dL</small></strong>
                <button className="icon-btn" aria-label={'Edit ' + slotNames[reading.slot]} onClick={() => setModal(reading)}><Pencil size={15} /></button>
                <button className="icon-btn" aria-label={'Delete ' + slotNames[reading.slot]} onClick={() => remove(reading.id)}><Trash2 size={15} /></button>
              </div>
            )) : (
              <div className="empty"><Droplet /><b>Nothing logged for this day</b><p>Your next check-in will show up here.</p></div>
            )}
            <button className="link-button" onClick={() => setModal({})}>Add entry <Plus size={15} /></button>
          </section>
        </div>

        <section className="section history">
          <div className="section-title"><div><span className="eyebrow">MONTHLY REPORTS</span><h2>Monthly summary</h2></div></div>
          <div className="history-card">
            <CalendarDays />
            <div><small>Month-to-date</small><b>{monthToDate?.count ?? 0} readings recorded</b><small>{monthToDate ? nice(monthToDate.start) + ' to ' + nice(monthToDate.end) : 'Current month'}</small></div>
            <div><small>Average</small><b>{monthToDate?.average ?? 'N/A'} mg/dL</b></div>
            <div><small>Range</small><b>{monthToDate?.count ? monthToDate.lowest + '-' + monthToDate.highest : 'N/A'} mg/dL</b></div>
          </div>
          <div className="history-card">
            <CalendarDays />
            <div><small>Previous month</small><b>{previousMonth?.count ?? 0} readings recorded</b><small>{previousMonth ? nice(previousMonth.start) + ' to ' + nice(previousMonth.end) : 'Previous month'}</small></div>
            <div><small>Average</small><b>{previousMonth?.average ?? 'N/A'} mg/dL</b></div>
            <div><small>Range</small><b>{previousMonth?.count ? previousMonth.lowest + '-' + previousMonth.highest : 'N/A'} mg/dL</b></div>
          </div>
        </section>
        <footer>Made for your everyday wellbeing <HeartPulse size={14} /> - Keep showing up for yourself.</footer>
      </main>

      {modal && (
        <ReadingForm
          reading={modal.id ? modal : null}
          onClose={() => setModal(null)}
          onSaved={async () => { setModal(null); await load(); }}
        />
      )}
    </div>
  );
}
