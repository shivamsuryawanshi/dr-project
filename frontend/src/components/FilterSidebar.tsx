import { useState } from 'react';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
// No category-specific types needed; categories come from backend/meta

interface FilterSidebarProps {
  onFilterChange: (filters: FilterOptions) => void;
  categories: string[];
  locations: string[];
}

export interface FilterOptions {
  categories: string[];
  locations: string[];
  featured: boolean;
}

// categories and locations are provided by parent from backend meta

export function FilterSidebar({ onFilterChange, categories, locations }: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    locations: [],
    featured: false
  });

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter(c => c !== category);
    
    const newFilters = { ...filters, categories: newCategories };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleLocationChange = (location: string, checked: boolean) => {
    const newLocations = checked
      ? [...filters.locations, location]
      : filters.locations.filter(l => l !== location);
    
    const newFilters = { ...filters, locations: newLocations };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleFeaturedChange = (checked: boolean) => {
    const newFilters = { ...filters, featured: checked };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const newFilters: FilterOptions = {
      categories: [],
      locations: [],
      featured: false
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <Card className="p-6 sticky top-20">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg">Filters</h3>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        </div>

        <Separator />

        {/* Category Filter */}
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
                <label
                  htmlFor={category}
                  className="text-sm cursor-pointer"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Location Filter */}
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
                <label
                  htmlFor={location}
                  className="text-sm cursor-pointer"
                >
                  {location}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Featured Jobs */}
        <div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={filters.featured}
              onCheckedChange={(checked) => handleFeaturedChange(!!checked)}
            />
            <label
              htmlFor="featured"
              className="text-sm cursor-pointer"
            >
              Featured Jobs Only
            </label>
          </div>
        </div>
      </div>
    </Card>
  );
}
