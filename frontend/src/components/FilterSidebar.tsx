import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import '../styles/job-listing-card-size.css';

interface FilterSidebarProps {
  onFilterChange: (filters: FilterOptions) => void;
  categories: string[];
  locations: string[];
  specialities?: string[];
  departments?: string[];
  jobTypes?: string[];
  qualifications?: string[];
  states?: string[];
  cities?: string[];
  showSector?: boolean;
}

export interface FilterOptions {
  categories: string[];
  locations: string[];
  featured: boolean;
  sector?: 'government' | 'private' | '';
  speciality?: string;
  department?: string;
  jobType?: string;
  qualification?: string;
  state?: string;
  city?: string;
}

export const emptyJobFilters = (): FilterOptions => ({
  categories: [],
  locations: [],
  featured: false,
  sector: '',
  speciality: '',
  department: '',
  jobType: '',
  qualification: '',
  state: '',
  city: '',
});

export const INDIAN_28_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const;

const STATE_NAME_BY_NORMALIZED = new Map(
  INDIAN_28_STATES.map((state) => [state.toLowerCase(), state]),
);

function getAllJobStates(_states: string[] = []) {
  // Return strictly the 28 states of India
  return [...INDIAN_28_STATES].sort((a, b) => a.localeCompare(b));
}

function getValidJobCities(cities: string[]) {
  const uniqueCities = new Map<string, string>();
  cities.forEach((city) => {
    const trimmedCity = city?.trim();
    const normalized = trimmedCity?.toLowerCase();
    if (!normalized) return;
    if (!STATE_NAME_BY_NORMALIZED.has(normalized)) uniqueCities.set(normalized, trimmedCity);
  });
  return Array.from(uniqueCities.values()).sort((a, b) => a.localeCompare(b));
}

export function FilterSidebar({
  onFilterChange,
  categories,
  locations,
  specialities = [],
  departments = [],
  jobTypes = [],
  qualifications = [],
  states = [],
  cities = [],
  showSector = true,
}: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterOptions>(emptyJobFilters());
  const validStates = getAllJobStates(states);
  const validCities = getValidJobCities(cities);

  const emit = (next: FilterOptions) => {
    setFilters(next);
    onFilterChange(next);
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter(c => c !== category);
    emit({ ...filters, categories: newCategories });
  };

  const handleLocationChange = (location: string, checked: boolean) => {
    const newLocations = checked
      ? [...filters.locations, location]
      : filters.locations.filter(l => l !== location);
    emit({ ...filters, locations: newLocations });
  };

  const citiesForState = filters.state
    ? validCities.filter((city) => {
        const match = locations.find((loc) => loc.toLowerCase().includes(city.toLowerCase()) && loc.toLowerCase().includes(filters.state!.toLowerCase()));
        return Boolean(match);
      })
    : validCities;

  return (
    <Card className="p-6 sticky top-20">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg">Filters</h3>
          <Button variant="ghost" size="sm" onClick={() => emit(emptyJobFilters())}>
            Clear All
          </Button>
        </div>

        <Separator />

        {showSector && (
          <CustomDropdown
            label="Job Type"
            value={filters.sector || ''}
            placeholder="All Jobs"
            options={[
              { value: 'government', label: 'Government' },
              { value: 'private', label: 'Private' },
            ]}
            onChange={(val) => emit({ ...filters, sector: val as FilterOptions['sector'] })}
          />
        )}

        <SelectBlock label="State" value={filters.state || ''} options={validStates} onChange={(state) => emit({ ...filters, state, city: '' })} />
        <SelectBlock label="City" value={filters.city || ''} options={citiesForState} onChange={(city) => emit({ ...filters, city })} />
        <SelectBlock label="Speciality" value={filters.speciality || ''} options={specialities} onChange={(speciality) => emit({ ...filters, speciality })} />
        <SelectBlock label="Department" value={filters.department || ''} options={departments} onChange={(department) => emit({ ...filters, department })} />
        <SelectBlock label="Job Type" value={filters.jobType || ''} options={jobTypes} onChange={(jobType) => emit({ ...filters, jobType })} />
        <SelectBlock label="Qualification" value={filters.qualification || ''} options={qualifications} onChange={(qualification) => emit({ ...filters, qualification })} />

        <Separator />

        <div>
          <Label className="mb-3 block">Job Category</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={filters.categories.includes(category)}
                  onCheckedChange={(checked) => handleCategoryChange(category, !!checked)}
                />
                <label htmlFor={category} className="text-sm cursor-pointer">{category}</label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <Label className="mb-3 block">Location</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {locations.map((location) => (
              <div key={location} className="flex items-center space-x-2">
                <Checkbox
                  id={location}
                  checked={filters.locations.includes(location)}
                  onCheckedChange={(checked) => handleLocationChange(location, !!checked)}
                />
                <label htmlFor={location} className="text-sm cursor-pointer">{location}</label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={filters.featured}
              onCheckedChange={(checked) => emit({ ...filters, featured: !!checked })}
            />
            <label htmlFor="featured" className="text-sm cursor-pointer">Featured Jobs Only</label>
          </div>
        </div>
      </div>
    </Card>
  );
}

function SelectBlock({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  if (!options.length) return null;
  const defaultLabel =
    label === 'City' ? 'All Cities' : label === 'Speciality' ? 'All Specialities' : `All ${label}s`;
  const formattedOptions = options.map((option) => ({ value: option, label: option }));

  return (
    <CustomDropdown
      label={label}
      value={value}
      placeholder={defaultLabel}
      options={formattedOptions}
      onChange={onChange}
    />
  );
}

interface DropdownOption {
  value: string;
  label: string;
}

function CustomDropdown({
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  label?: string;
  value: string;
  placeholder: string;
  options: DropdownOption[];
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

  const selectedOpt = options.find((opt) => opt.value === value);
  const displayLabel = selectedOpt ? selectedOpt.label : placeholder;

  return (
    <div className={`filter-dropdown-container ${isOpen ? 'is-open' : ''}`} ref={dropdownRef}>
      {label && <Label className="mb-2 block">{label}</Label>}
      <button
        type="button"
        className={`filter-dropdown-trigger ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="filter-dropdown-label" title={displayLabel}>
          {displayLabel}
        </span>
        <ChevronDown className="filter-dropdown-chevron" />
      </button>

      {isOpen && (
        <ul className="filter-dropdown-menu" role="listbox">
          <li
            role="option"
            aria-selected={!value}
            className={`filter-dropdown-item ${!value ? 'is-selected' : ''}`}
            onClick={() => handleSelect('')}
          >
            <span className="truncate">{placeholder}</span>
            {!value && <Check className="filter-dropdown-check" />}
          </li>
          {options.map((opt) => {
            const isSelected = value === opt.value;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                className={`filter-dropdown-item ${isSelected ? 'is-selected' : ''}`}
                onClick={() => handleSelect(opt.value)}
                title={opt.label}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="filter-dropdown-check" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}