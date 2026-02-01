// Countries that require or commonly expect a photo
export const PHOTO_REQUIRED_COUNTRIES = ['DE', 'FR'];
export const PHOTO_OPTIONAL_COUNTRIES = ['NL'];

// Countries that typically expect date of birth
export const DOB_EXPECTED_COUNTRIES = ['DE', 'FR'];

// Country-specific formatting rules
export interface CountryFormatRules {
  includePhoto: boolean;
  includeDOB: boolean;
  maxPages: number;
  includeReferences: boolean;
  dateFormat: string;
  sectionOrder: string[];
}

export const COUNTRY_FORMAT_RULES: Record<string, CountryFormatRules> = {
  NG: {
    includePhoto: false,
    includeDOB: false,
    maxPages: 2,
    includeReferences: true,
    dateFormat: 'DD/MM/YYYY',
    sectionOrder: ['summary', 'experience', 'education', 'skills', 'references']
  },
  US: {
    includePhoto: false,
    includeDOB: false,
    maxPages: 1,
    includeReferences: false,
    dateFormat: 'MM/YYYY',
    sectionOrder: ['summary', 'experience', 'education', 'skills']
  },
  CA: {
    includePhoto: false,
    includeDOB: false,
    maxPages: 2,
    includeReferences: false,
    dateFormat: 'MM/YYYY',
    sectionOrder: ['summary', 'experience', 'education', 'skills']
  },
  GB: {
    includePhoto: false,
    includeDOB: false,
    maxPages: 2,
    includeReferences: false,
    dateFormat: 'MM/YYYY',
    sectionOrder: ['summary', 'experience', 'education', 'skills']
  },
  DE: {
    includePhoto: true,
    includeDOB: true,
    maxPages: 2,
    includeReferences: false,
    dateFormat: 'DD.MM.YYYY',
    sectionOrder: ['personal', 'summary', 'experience', 'education', 'skills']
  },
  SE: {
    includePhoto: false,
    includeDOB: false,
    maxPages: 2,
    includeReferences: false,
    dateFormat: 'YYYY-MM',
    sectionOrder: ['summary', 'experience', 'education', 'skills']
  },
  NZ: {
    includePhoto: false,
    includeDOB: false,
    maxPages: 2,
    includeReferences: true,
    dateFormat: 'MM/YYYY',
    sectionOrder: ['summary', 'experience', 'education', 'skills']
  },
  AU: {
    includePhoto: false,
    includeDOB: false,
    maxPages: 3,
    includeReferences: true,
    dateFormat: 'MM/YYYY',
    sectionOrder: ['summary', 'experience', 'education', 'skills', 'references']
  },
  FR: {
    includePhoto: true,
    includeDOB: true,
    maxPages: 2,
    includeReferences: false,
    dateFormat: 'DD/MM/YYYY',
    sectionOrder: ['personal', 'summary', 'experience', 'education', 'skills']
  },
  NL: {
    includePhoto: false,
    includeDOB: false,
    maxPages: 2,
    includeReferences: false,
    dateFormat: 'DD-MM-YYYY',
    sectionOrder: ['summary', 'experience', 'education', 'skills']
  }
};

export const getCountryFormatRules = (countryCode: string): CountryFormatRules => {
  return COUNTRY_FORMAT_RULES[countryCode] || COUNTRY_FORMAT_RULES['US'];
};
