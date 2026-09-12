import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, BarChart3, Check, ChevronDown, GraduationCap, MapPin, RefreshCw, Search, Stethoscope, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CandidateInsightsResponse, fetchCandidateInsights } from '../api/candidateProfiles';
import '../styles/admin-insights.css';

interface Props { onNavigate: (page: string) => void; }

const EMPTY: CandidateInsightsResponse = {
  totalProfiles: 0,
  filteredProfiles: 0,
  specialityCounts: {},
  qualificationCounts: {},
  stateCounts: {},
  profiles: [],
};

export function AdminCandidateInsights({ onNavigate }: Props) {
  const { token } = useAuth();
  const [data, setData] = useState<CandidateInsightsResponse>(EMPTY);
  const [filters, setFilters] = useState({ speciality: '', qualification: '', state: '', search: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      setData(await fetchCandidateInsights(filters, token));
    } catch (e: any) {
      setError(e?.message || 'Unable to load candidate insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = sessionStorage.getItem('medex.adminInsightSpeciality');
    if (stored) {
      sessionStorage.removeItem('medex.adminInsightSpeciality');
      setFilters((current) => ({ ...current, speciality: stored }));
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filters.speciality, filters.qualification, filters.state, filters.search]);

  const topSpecialities = useMemo(
    () => Object.entries(data.specialityCounts || {}).sort((a, b) => b[1] - a[1]).slice(0, 8),
    [data.specialityCounts],
  );

  const specialities = Object.keys(data.specialityCounts || {}).sort();
  const qualifications = Object.keys(data.qualificationCounts || {}).sort();
  const states = Object.keys(data.stateCounts || {}).sort();
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="insights-page">
      <div className="insights-shell">
        <button type="button" className="insights-back" onClick={() => onNavigate('dashboard/admin')}>
          <ArrowLeft size={16} /> Admin Dashboard
        </button>

        <header className="insights-header">
          <div>
            <span className="insights-eyebrow"><Stethoscope size={14} /> Candidate Intelligence</span>
            <h1>Medical Profile Segments</h1>
            <p>Filter candidate profiles by clinical speciality, qualification and geography.</p>
          </div>
          <button
            type="button"
            className={`insights-refresh${loading ? ' is-loading' : ''}`}
            onClick={() => void load()}
            disabled={loading}
          >
            <RefreshCw /> {loading ? 'Refreshing' : 'Refresh'}
          </button>
        </header>

        <section className="insights-metrics" aria-label="Candidate profile totals">
          <Metric icon={Users} label="Medical Profiles" value={data.totalProfiles} />
          <Metric icon={Search} label="Matching Filter" value={data.filteredProfiles} />
          <Metric icon={Stethoscope} label="Specialities" value={Object.keys(data.specialityCounts || {}).length} />
          <Metric icon={MapPin} label="States" value={Object.keys(data.stateCounts || {}).length} />
        </section>

        <div className="insights-body">
          <main className="insights-main">
            <section className="insights-card insights-card--filters">
              <div className="insights-filters">
                <label className="insights-field">
                  <span>Search</span>
                  <div className="insights-field__control">
                    <Search />
                    <input
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      placeholder="Name, email, city…"
                    />
                  </div>
                </label>
                <Filter
                  label="Speciality"
                  anyLabel="All specialities"
                  value={filters.speciality}
                  options={specialities}
                  onChange={(speciality) => setFilters({ ...filters, speciality })}
                />
                <Filter
                  label="Qualification"
                  anyLabel="All qualifications"
                  value={filters.qualification}
                  options={qualifications}
                  onChange={(qualification) => setFilters({ ...filters, qualification })}
                />
                <Filter
                  label="State"
                  anyLabel="All states"
                  value={filters.state}
                  options={states}
                  onChange={(state) => setFilters({ ...filters, state })}
                />
                {hasFilters && (
                  <button
                    type="button"
                    className="insights-filters__reset"
                    onClick={() => setFilters({ speciality: '', qualification: '', state: '', search: '' })}
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </section>

            {error ? (
              <div className="insights-error">{error}</div>
            ) : (
              <section className="insights-card">
                <div className="insights-card__head">
                  <div>
                    <h2><Users /> Candidate Profiles</h2>
                    <p>{data.filteredProfiles} profile{data.filteredProfiles === 1 ? '' : 's'} match the current segment.</p>
                  </div>
                </div>

                {loading ? (
                  <div className="insights-empty">Loading profiles…</div>
                ) : data.profiles.length ? (
                  <div className="insights-profiles">
                    {data.profiles.map((profile, index) => {
                      const locationText =
                        [profile.currentCity, profile.state].filter(Boolean).join(', ') || 'Location missing';
                      return (
                        <article className="insights-profile" key={profile.candidateId || profile.id || index}>
                          <div className="insights-profile__col insights-profile__candidate">
                            <h3 title={profile.name || 'Candidate'}>{profile.name || 'Candidate'}</h3>
                            <p className="insights-profile__email" title={profile.email}>{profile.email}</p>
                          </div>
                          <div className="insights-profile__col insights-profile__speciality">
                            <span className="insights-label">Speciality</span>
                            <strong title={profile.speciality || 'Not provided'}>{profile.speciality || 'Not provided'}</strong>
                            {profile.subSpeciality && <small title={profile.subSpeciality}>{profile.subSpeciality}</small>}
                          </div>
                          <div className="insights-profile__col insights-profile__qualification">
                            <span className="insights-label">Qualification</span>
                            <strong title={profile.qualification || 'Not provided'}>{profile.qualification || 'Not provided'}</strong>
                            <small
                              title={
                                profile.yearsExperience != null
                                  ? `${profile.yearsExperience} years experience`
                                  : 'Experience not provided'
                              }
                            >
                              {profile.yearsExperience != null
                                ? `${profile.yearsExperience} years experience`
                                : 'Experience not provided'}
                            </small>
                          </div>
                          <div className="insights-profile__col insights-profile__location">
                            <MapPin />
                            <span className="insights-profile__location-text" title={locationText}>
                              {locationText}
                            </span>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="insights-empty">No candidate profiles match this segment.</div>
                )}
              </section>
            )}
          </main>

          <aside className="insights-aside">
            <section className="insights-card">
              <div className="insights-card__head">
                <h2><BarChart3 /> Top Specialities</h2>
              </div>
              <div className="insights-cluster-list">
                {topSpecialities.length ? (
                  topSpecialities.map(([name, count]) => (
                    <button
                      key={name}
                      type="button"
                      className={`insights-cluster${filters.speciality === name ? ' is-active' : ''}`}
                      onClick={() =>
                        setFilters({ ...filters, speciality: filters.speciality === name ? '' : name })
                      }
                    >
                      <span>{name}</span>
                      <strong>{count}</strong>
                    </button>
                  ))
                ) : (
                  <p className="insights-empty">
                    Profiles appear here once candidates complete their medical profile.
                  </p>
                )}
              </div>
            </section>

            <section className="insights-note">
              <GraduationCap />
              <h3>Structured, permissioned data</h3>
              <p>
                Use these filters for legitimate recruiting, workforce planning and matching. Candidate
                contact details remain inside authenticated admin access.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <article className="insights-metric">
      <span className="insights-metric__icon"><Icon /></span>
      <div>
        <strong>{Number(value || 0).toLocaleString('en-IN')}</strong>
        <span>{label}</span>
      </div>
    </article>
  );
}

function Filter({
  label,
  anyLabel,
  value,
  options,
  onChange,
}: {
  label: string;
  anyLabel: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const displayText = value || anyLabel;

  return (
    <div className="insights-field" ref={dropdownRef}>
      <span>{label}</span>
      <div className="insights-dropdown">
        <button
          type="button"
          className={`insights-dropdown__trigger ${isOpen ? 'is-open' : ''}`}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={`${label} filter`}
        >
          <span className="insights-dropdown__value" title={displayText}>
            {displayText}
          </span>
          <ChevronDown className={`insights-dropdown__chevron ${isOpen ? 'is-open' : ''}`} />
        </button>

        {isOpen && (
          <ul className="insights-dropdown__menu" role="listbox">
            <li
              role="option"
              aria-selected={!value}
              className={`insights-dropdown__item ${!value ? 'is-selected' : ''}`}
              onClick={() => handleSelect('')}
            >
              <span>{anyLabel}</span>
              {!value && <Check className="insights-dropdown__check" />}
            </li>
            {options.map((option) => {
              const isSelected = value === option;
              return (
                <li
                  key={option}
                  role="option"
                  aria-selected={isSelected}
                  className={`insights-dropdown__item ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleSelect(option)}
                  title={option}
                >
                  <span>{option}</span>
                  {isSelected && <Check className="insights-dropdown__check" />}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
