import React, { useState } from 'react';
import styled from 'styled-components';
import { Search, Filter, Calendar, MapPin, AlertTriangle, Users, Building, Loader, AlertCircle } from 'lucide-react';
import { searchAPI, SearchRequest, CrimeCase } from '../services/api';

const SearchContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 2rem;
  height: calc(100vh - 120px);
`;

const SearchPanel = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  height: fit-content;
  position: sticky;
  top: 2rem;
`;

const SearchTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #4299e1;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #4299e1;
  }
`;

const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #4a5568;
  cursor: pointer;
  
  input[type="checkbox"] {
    margin: 0;
  }
`;

const SearchButton = styled.button<{ $loading: boolean }>`
  width: 100%;
  background: ${props => props.$loading ? '#a0aec0' : 'linear-gradient(135deg, #4299e1, #3182ce)'};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: ${props => props.$loading ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${props => props.$loading ? '#a0aec0' : 'linear-gradient(135deg, #3182ce, #2c5aa0)'};
    transform: ${props => props.$loading ? 'none' : 'translateY(-1px)'};
  }
`;

const ResultsPanel = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ResultsHeader = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.5);
`;

const ResultsTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
`;

const ResultsCount = styled.p`
  color: #4a5568;
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
`;

const ResultsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 3px;
  }
`;

const CrimeCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
`;

const CrimeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const CrimeId = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  color: #4a5568;
  background: #f7fafc;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
`;

const CrimeType = styled.div<{ $severity: string }>`
  background: ${props => {
    switch (props.$severity) {
      case 'high': return '#fed7d7';
      case 'medium': return '#feebc8';
      default: return '#f0fff4';
    }
  }};
  color: ${props => {
    switch (props.$severity) {
      case 'high': return '#c53030';
      case 'medium': return '#dd6b20';
      default: return '#38a169';
    }
  }};
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: capitalize;
`;

const CrimeDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #4a5568;
`;

const CrimeDescription = styled.p`
  color: #2d3748;
  line-height: 1.6;
  margin: 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #4a5568;
`;

const ErrorMessage = styled.div`
  background: #fed7d7;
  color: #c53030;
  padding: 1rem;
  border-radius: 12px;
  margin: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const QuickFilters = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const QuickFilter = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.$active ? '#4299e1' : '#e2e8f0'};
  background: ${props => props.$active ? '#4299e1' : 'white'};
  color: ${props => props.$active ? 'white' : '#4a5568'};
  border-radius: 20px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #4299e1;
    background: ${props => props.$active ? '#3182ce' : '#f7fafc'};
  }
`;

const SearchInterface: React.FC = () => {
  const [searchParams, setSearchParams] = useState<SearchRequest>({
    time_period: '',
    geographic_focus: 'Global',
    crime_types: [],
    severity_level: 'high',
    max_results: 10
  });
  
  const [results, setResults] = useState<CrimeCase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const crimeTypes = [
    'murder', 'fraud', 'terrorism', 'organized_crime', 
    'cyber_crime', 'human_trafficking', 'drug_trafficking'
  ];

  const quickFilters = [
    { label: 'Last Month', value: 'last month' },
    { label: 'Last 3 Months', value: 'last 3 months' },
    { label: '2024', value: '2024' },
    { label: 'July 2024', value: 'July 2024' }
  ];

  const handleInputChange = (field: keyof SearchRequest, value: any) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCrimeTypeChange = (crimeType: string, checked: boolean) => {
    setSearchParams(prev => ({
      ...prev,
      crime_types: checked 
        ? [...prev.crime_types, crimeType]
        : prev.crime_types.filter(type => type !== crimeType)
    }));
  };

  const handleQuickFilter = (value: string) => {
    setSearchParams(prev => ({
      ...prev,
      time_period: value
    }));
  };

  const handleSearch = async () => {
    if (!searchParams.time_period.trim()) {
      setError('Please specify a time period');
      return;
    }

    if (searchParams.crime_types.length === 0) {
      setError('Please select at least one crime type');
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const searchResults = await searchAPI.searchCrimes(searchParams);
      setResults(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during search');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <SearchContainer>
      <SearchPanel>
        <SearchTitle>
          <Filter size={24} />
          Search Filters
        </SearchTitle>

        <FormGroup>
          <Label>Quick Time Filters</Label>
          <QuickFilters>
            {quickFilters.map(filter => (
              <QuickFilter
                key={filter.value}
                $active={searchParams.time_period === filter.value}
                onClick={() => handleQuickFilter(filter.value)}
              >
                {filter.label}
              </QuickFilter>
            ))}
          </QuickFilters>
        </FormGroup>

        <FormGroup>
          <Label>
            <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Time Period
          </Label>
          <Input
            type="text"
            value={searchParams.time_period}
            onChange={(e) => handleInputChange('time_period', e.target.value)}
            placeholder="e.g., July 2024, 2024-01-01 to 2024-12-31"
          />
        </FormGroup>

        <FormGroup>
          <Label>
            <MapPin size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Geographic Focus
          </Label>
          <Select
            value={searchParams.geographic_focus}
            onChange={(e) => handleInputChange('geographic_focus', e.target.value)}
          >
            <option value="Global">Global</option>
            <option value="UAE">UAE</option>
            <option value="Dubai">Dubai</option>
            <option value="Middle East">Middle East</option>
            <option value="Asia">Asia</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>
            <AlertTriangle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Crime Types
          </Label>
          <CheckboxGroup>
            {crimeTypes.map(type => (
              <CheckboxItem key={type}>
                <input
                  type="checkbox"
                  checked={searchParams.crime_types.includes(type)}
                  onChange={(e) => handleCrimeTypeChange(type, e.target.checked)}
                />
                {type.replace('_', ' ')}
              </CheckboxItem>
            ))}
          </CheckboxGroup>
        </FormGroup>

        <FormGroup>
          <Label>Severity Level</Label>
          <Select
            value={searchParams.severity_level}
            onChange={(e) => handleInputChange('severity_level', e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Max Results</Label>
          <Select
            value={searchParams.max_results}
            onChange={(e) => handleInputChange('max_results', parseInt(e.target.value))}
          >
            <option value={5}>5 results</option>
            <option value={10}>10 results</option>
            <option value={20}>20 results</option>
            <option value={50}>50 results</option>
          </Select>
        </FormGroup>

        <SearchButton onClick={handleSearch} $loading={isLoading}>
          {isLoading ? (
            <>
              <Loader size={20} className="animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search size={20} />
              Search Crimes
            </>
          )}
        </SearchButton>
      </SearchPanel>

      <ResultsPanel>
        <ResultsHeader>
          <ResultsTitle>Search Results</ResultsTitle>
          {hasSearched && (
            <ResultsCount>
              {isLoading ? 'Searching...' : `Found ${results.length} crime case${results.length !== 1 ? 's' : ''}`}
            </ResultsCount>
          )}
        </ResultsHeader>

        <ResultsList>
          {error && (
            <ErrorMessage>
              <AlertCircle size={20} />
              {error}
            </ErrorMessage>
          )}

          {!hasSearched && !isLoading && (
            <EmptyState>
              <Search size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <h3>Ready to Search</h3>
              <p>Configure your search filters and click "Search Crimes" to find relevant cases.</p>
            </EmptyState>
          )}

          {hasSearched && !isLoading && results.length === 0 && !error && (
            <EmptyState>
              <Search size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <h3>No Results Found</h3>
              <p>Try adjusting your search criteria or expanding the time period.</p>
            </EmptyState>
          )}

          {results.map((crime) => (
            <CrimeCard key={crime.crime_id}>
              <CrimeHeader>
                <CrimeId>{crime.crime_id}</CrimeId>
                <CrimeType $severity={crime.case_details.severity_level}>
                  {crime.crime_type.replace('_', ' ')}
                </CrimeType>
              </CrimeHeader>

              <CrimeDetails>
                <DetailItem>
                  <MapPin size={16} />
                  {crime.city ? `${crime.city}, ${crime.country}` : crime.country}
                </DetailItem>
                <DetailItem>
                  <Calendar size={16} />
                  {formatDate(crime.date_occurred)}
                </DetailItem>
                <DetailItem>
                  <Users size={16} />
                  {crime.case_details.victims_count || 'Unknown'} victims
                </DetailItem>
                <DetailItem>
                  <Building size={16} />
                  {crime.agencies_involved.length} agencies
                </DetailItem>
              </CrimeDetails>

              <CrimeDescription>
                {crime.case_details.brief_description}
              </CrimeDescription>
            </CrimeCard>
          ))}
        </ResultsList>
      </ResultsPanel>
    </SearchContainer>
  );
};

export default SearchInterface;
