import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchJobOptions, fetchJobsMeta } from "../api/jobs";
import "./SearchBar.css";

interface SearchBarProps {
  initialQuery?: string;
  initialLocation?: string;
  onSearch?: (query: string, location: string) => void;
  showLabels?: boolean;
  compact?: boolean;
}

// Icons as components for better performance
const SearchIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const LocationIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const SearchBar: React.FC<SearchBarProps> = ({
  initialQuery = "",
  initialLocation = "",
  onSearch,
  showLabels = true,
  compact = false,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State
  const [jobQuery, setJobQuery] = useState(
    initialQuery || searchParams.get("search") || "",
  );
  const [locationQuery, setLocationQuery] = useState(
    initialLocation || searchParams.get("location") || "",
  );
  const [jobSuggestions, setJobSuggestions] = useState<string[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showJobDropdown, setShowJobDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [activeJobIndex, setActiveJobIndex] = useState(-1);
  const [activeLocationIndex, setActiveLocationIndex] = useState(-1);

  // Cached options from database
  const [cachedJobOptions, setCachedJobOptions] = useState<string[]>([]);
  const [cachedLocations, setCachedLocations] = useState<string[]>([]);
  const [optionsLoaded, setOptionsLoaded] = useState(false);

  // Refs
  const jobInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const jobDropdownRef = useRef<HTMLUListElement>(null);
  const locationDropdownRef = useRef<HTMLUListElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Load options from database on mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [jobOptions, meta] = await Promise.all([
          fetchJobOptions(),
          fetchJobsMeta(),
        ]);

        // Combine titles and companies for job suggestions
        const allJobOptions = [
          ...(jobOptions.titles || []),
          ...(jobOptions.companies || []),
        ];
        // Remove duplicates and sort
        const uniqueJobOptions = [...new Set(allJobOptions)].sort((a, b) =>
          a.toLowerCase().localeCompare(b.toLowerCase()),
        );
        setCachedJobOptions(uniqueJobOptions);
        setCachedLocations(meta.locations || []);
        setOptionsLoaded(true);
      } catch (error) {
        console.error("Error loading search options:", error);
        setOptionsLoaded(true);
      }
    };
    loadOptions();
  }, []);

  // Filter job suggestions locally from cached options
  const fetchJobSuggestions = useCallback(
    (query: string) => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      if (query.length < 2) {
        setJobSuggestions([]);
        setIsLoadingJobs(false);
        return;
      }

      setIsLoadingJobs(true);
      debounceTimerRef.current = setTimeout(() => {
        const lowerQuery = query.toLowerCase();
        const filtered = cachedJobOptions
          .filter((option) => option.toLowerCase().includes(lowerQuery))
          .slice(0, 8);
        setJobSuggestions(filtered);
        setIsLoadingJobs(false);
      }, 100);
    },
    [cachedJobOptions],
  );

  // Filter location suggestions locally from cached locations
  const fetchLocationSuggestions = useCallback(
    (query: string) => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      if (query.length < 2) {
        setLocationSuggestions([]);
        setIsLoadingLocations(false);
        return;
      }

      setIsLoadingLocations(true);
      debounceTimerRef.current = setTimeout(() => {
        const lowerQuery = query.toLowerCase();
        const filtered = cachedLocations
          .filter((loc) => loc.toLowerCase().includes(lowerQuery))
          .slice(0, 8);
        setLocationSuggestions(filtered);
        setIsLoadingLocations(false);
      }, 100);
    },
    [cachedLocations],
  );

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  // Handlers
  const handleJobChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setJobQuery(value);
      setShowJobDropdown(true);
      setActiveJobIndex(-1);
      fetchJobSuggestions(value);
    },
    [fetchJobSuggestions],
  );

  const handleLocationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocationQuery(value);
      setShowLocationDropdown(true);
      setActiveLocationIndex(-1);
      fetchLocationSuggestions(value);
    },
    [fetchLocationSuggestions],
  );

  const selectJobSuggestion = useCallback((suggestion: string) => {
    setJobQuery(suggestion);
    setShowJobDropdown(false);
    setJobSuggestions([]);
    locationInputRef.current?.focus();
  }, []);

  const selectLocationSuggestion = useCallback((suggestion: string) => {
    setLocationQuery(suggestion);
    setShowLocationDropdown(false);
    setLocationSuggestions([]);
  }, []);

  const handleSearch = useCallback(() => {
    setShowJobDropdown(false);
    setShowLocationDropdown(false);

    if (onSearch) {
      onSearch(jobQuery.trim(), locationQuery.trim());
    } else {
      const params = new URLSearchParams();
      if (jobQuery.trim()) params.set("search", jobQuery.trim());
      if (locationQuery.trim()) params.set("location", locationQuery.trim());
      navigate(`/jobs?${params.toString()}`);
    }
  }, [jobQuery, locationQuery, onSearch, navigate]);

  // Keyboard navigation
  const handleJobKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showJobDropdown || jobSuggestions.length === 0) {
        if (e.key === "Enter") {
          e.preventDefault();
          handleSearch();
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveJobIndex((prev) =>
            Math.min(prev + 1, jobSuggestions.length - 1),
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveJobIndex((prev) => Math.max(prev - 1, -1));
          break;
        case "Enter":
          e.preventDefault();
          if (activeJobIndex >= 0 && activeJobIndex < jobSuggestions.length) {
            selectJobSuggestion(jobSuggestions[activeJobIndex]);
          } else {
            handleSearch();
          }
          break;
        case "Escape":
          setShowJobDropdown(false);
          break;
        case "Tab":
          setShowJobDropdown(false);
          break;
      }
    },
    [
      showJobDropdown,
      jobSuggestions,
      activeJobIndex,
      selectJobSuggestion,
      handleSearch,
    ],
  );

  const handleLocationKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showLocationDropdown || locationSuggestions.length === 0) {
        if (e.key === "Enter") {
          e.preventDefault();
          handleSearch();
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveLocationIndex((prev) =>
            Math.min(prev + 1, locationSuggestions.length - 1),
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveLocationIndex((prev) => Math.max(prev - 1, -1));
          break;
        case "Enter":
          e.preventDefault();
          if (
            activeLocationIndex >= 0 &&
            activeLocationIndex < locationSuggestions.length
          ) {
            selectLocationSuggestion(locationSuggestions[activeLocationIndex]);
          } else {
            handleSearch();
          }
          break;
        case "Escape":
          setShowLocationDropdown(false);
          break;
        case "Tab":
          setShowLocationDropdown(false);
          break;
      }
    },
    [
      showLocationDropdown,
      locationSuggestions,
      activeLocationIndex,
      selectLocationSuggestion,
      handleSearch,
    ],
  );

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      if (
        jobDropdownRef.current &&
        !jobDropdownRef.current.contains(target) &&
        !jobInputRef.current?.contains(target)
      ) {
        setShowJobDropdown(false);
      }
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(target) &&
        !locationInputRef.current?.contains(target)
      ) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Highlight matching text - memoized for performance
  const highlightMatch = useMemo(
    () => (text: string, query: string) => {
      if (!query || query.length < 2) return <span>{text}</span>;

      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(${escapedQuery})`, "gi");
      const parts = text.split(regex);

      return (
        <>
          {parts.map((part, i) =>
            regex.test(part) ? (
              <mark key={i}>{part}</mark>
            ) : (
              <span key={i}>{part}</span>
            ),
          )}
        </>
      );
    },
    [],
  );

  const containerClass = useMemo(
    () => `search-bar ${compact ? "search-bar--compact" : ""}`.trim(),
    [compact],
  );

  return (
    <div className={containerClass}>
      <div className="search-bar__container">
        {/* Job Search Field */}
        <div className="search-bar__field search-bar__field--job">
          <div className="search-bar__field-inner">
            <div className="search-bar__icon">
              <SearchIcon />
            </div>
            <div className="search-bar__input-group">
              {showLabels && <span className="search-bar__label">WHAT</span>}
              <input
                ref={jobInputRef}
                type="text"
                className="search-bar__input"
                placeholder="Job title, specialization, or company"
                value={jobQuery}
                onChange={handleJobChange}
                onKeyDown={handleJobKeyDown}
                onFocus={() => jobQuery.length >= 2 && setShowJobDropdown(true)}
                autoComplete="off"
                aria-label="Search job title"
                aria-expanded={showJobDropdown}
                aria-autocomplete="list"
              />
            </div>
            {isLoadingJobs && (
              <div className="search-bar__spinner" aria-hidden="true" />
            )}
          </div>

          {/* Job Suggestions Dropdown */}
          {showJobDropdown && jobSuggestions.length > 0 && (
            <ul
              ref={jobDropdownRef}
              className="search-bar__dropdown"
              role="listbox"
            >
              {jobSuggestions.map((suggestion, idx) => (
                <li
                  key={suggestion + idx}
                  className={`search-bar__dropdown-item ${idx === activeJobIndex ? "search-bar__dropdown-item--active" : ""}`}
                  onClick={() => selectJobSuggestion(suggestion)}
                  onMouseEnter={() => setActiveJobIndex(idx)}
                  role="option"
                  aria-selected={idx === activeJobIndex}
                >
                  <BriefcaseIcon />
                  <span>{highlightMatch(suggestion, jobQuery)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="search-bar__divider" aria-hidden="true" />

        {/* Location Search Field */}
        <div className="search-bar__field search-bar__field--location">
          <div className="search-bar__field-inner">
            <div className="search-bar__icon">
              <LocationIcon />
            </div>
            <div className="search-bar__input-group">
              {showLabels && <span className="search-bar__label">WHERE</span>}
              <input
                ref={locationInputRef}
                type="text"
                className="search-bar__input"
                placeholder="City or state"
                value={locationQuery}
                onChange={handleLocationChange}
                onKeyDown={handleLocationKeyDown}
                onFocus={() =>
                  locationQuery.length >= 2 && setShowLocationDropdown(true)
                }
                autoComplete="off"
                aria-label="Search location"
                aria-expanded={showLocationDropdown}
                aria-autocomplete="list"
              />
            </div>
            {isLoadingLocations && (
              <div className="search-bar__spinner" aria-hidden="true" />
            )}
          </div>

          {/* Location Suggestions Dropdown */}
          {showLocationDropdown && locationSuggestions.length > 0 && (
            <ul
              ref={locationDropdownRef}
              className="search-bar__dropdown"
              role="listbox"
            >
              {locationSuggestions.map((suggestion, idx) => (
                <li
                  key={suggestion + idx}
                  className={`search-bar__dropdown-item ${idx === activeLocationIndex ? "search-bar__dropdown-item--active" : ""}`}
                  onClick={() => selectLocationSuggestion(suggestion)}
                  onMouseEnter={() => setActiveLocationIndex(idx)}
                  role="option"
                  aria-selected={idx === activeLocationIndex}
                >
                  <LocationIcon size={16} />
                  <span>{highlightMatch(suggestion, locationQuery)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Search Button */}
        <button
          className="search-bar__button"
          onClick={handleSearch}
          type="button"
          aria-label="Search jobs"
        >
          <SearchIcon />
          {!compact && <span>Search</span>}
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
