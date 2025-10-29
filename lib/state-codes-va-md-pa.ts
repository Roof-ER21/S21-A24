/**
 * State-Specific Building Codes and Requirements
 * Focus: Virginia (VA), Maryland (MD), Pennsylvania (PA)
 *
 * Comprehensive reference for Susan 21 field persona
 * Includes 20+ building codes per state for insurance claims
 */

export interface StateCode {
  code: string;
  title: string;
  description: string;
  reference: string;
  successRate?: number;
  citation?: string; // Susan's [X.X] citation format
}

export interface StateRequirement {
  requirement: string;
  details: string;
  source: string;
  critical?: boolean;
}

export interface StateInfo {
  abbreviation: string;
  name: string;
  ircVersion: string;
  ircEffectiveDate: string;
  buildingCodes: StateCode[];
  specialRequirements: StateRequirement[];
  insuranceRegulations: string[];
  notes: string[];
  susanTips: string[]; // Action-oriented tips for reps
}

export const STATE_CODES_VA_MD_PA: Record<string, StateInfo> = {
  VA: {
    abbreviation: 'VA',
    name: 'Virginia',
    ircVersion: '2021 IRC',
    ircEffectiveDate: 'July 1, 2021',
    buildingCodes: [
      {
        code: '2021 IRC R908.3',
        title: 'Recovering or Reroofing - CRITICAL MATCHING CODE',
        description: 'Requires matching shingles for proper roof integrity. When existing shingles are discontinued, full replacement required for aesthetic and functional match.',
        reference: 'Virginia Uniform Statewide Building Code (USBC)',
        successRate: 92,
        citation: '[1.1]'
      },
      {
        code: '2021 IRC R905.2.2',
        title: 'Asphalt Shingle Slope Requirements',
        description: 'Low-slope application (2:12 to 4:12) requires two layers of underlayment. Violation discovered during repair = full replacement under code.',
        reference: 'Virginia USBC, effective 7/1/2021',
        successRate: 95,
        citation: '[1.2]'
      },
      {
        code: '2021 IRC R905.2.3',
        title: 'Shingle Underlayment',
        description: 'Underlayment required per manufacturer specs. Non-compliant existing = upgrade required.',
        reference: 'Virginia USBC',
        successRate: 88,
        citation: '[1.3]'
      },
      {
        code: '2021 IRC R905.2.7',
        title: 'Asphalt Shingle Attachment',
        description: 'Minimum 4 nails per shingle, 6 in high wind areas. Improper nailing discovered = re-roof.',
        reference: 'Virginia USBC',
        successRate: 90,
        citation: '[1.4]'
      },
      {
        code: '2021 IRC R905.1.2',
        title: 'Ice Barrier Requirements',
        description: 'Required in areas with average daily temperature ≤ 25°F. Northern VA falls under this.',
        reference: 'Virginia USBC (formerly R903.2.1)',
        successRate: 85,
        citation: '[1.5]'
      },
      {
        code: '2021 IRC R703.2',
        title: 'Water-Resistive Barrier',
        description: 'Required behind exterior veneer and under roofing. Missing or damaged = code violation.',
        reference: 'Virginia USBC',
        successRate: 88,
        citation: '[1.6]'
      },
      {
        code: '2021 IRC R703.4',
        title: 'Flashing Requirements',
        description: 'Required at all wall and roof intersections. Non-compliant = full system replacement.',
        reference: 'Virginia USBC',
        successRate: 90,
        citation: '[1.7]'
      },
      {
        code: '2021 IRC R905.2.8.2',
        title: 'Roof Valleys',
        description: 'Valley lining required. Ice shield or two layers of underlayment.',
        reference: 'Virginia USBC',
        successRate: 87,
        citation: '[1.8]'
      },
      {
        code: '2021 IRC R905.1',
        title: 'Roof Covering Application',
        description: 'Must be applied per manufacturer installation instructions. Deviation = voided warranty.',
        reference: 'Virginia USBC',
        successRate: 91,
        citation: '[1.9]'
      },
      {
        code: '2021 IRC R905.2.5',
        title: 'Drip Edge',
        description: 'Required at eaves and gables. Missing = water intrusion risk.',
        reference: 'Virginia USBC',
        successRate: 89,
        citation: '[1.10]'
      },
      {
        code: '2021 IRC R905.2.4',
        title: 'Asphalt Shingle Underlayment Types',
        description: 'Must meet ASTM D226, D4869, or D6757 standards.',
        reference: 'Virginia USBC',
        successRate: 86,
        citation: '[1.11]'
      },
      {
        code: '2021 IRC R905.2.6',
        title: 'Asphalt Shingle Fasteners',
        description: 'Must be corrosion-resistant with minimum 12-gauge shank.',
        reference: 'Virginia USBC',
        successRate: 84,
        citation: '[1.12]'
      },
      {
        code: '2021 IRC R905.2.8.3',
        title: 'Sidewall Flashing',
        description: 'Step flashing required at sidewall and roof intersection.',
        reference: 'Virginia USBC',
        successRate: 88,
        citation: '[1.13]'
      },
      {
        code: '2021 IRC R905.2.8.4',
        title: 'Chimney Flashing',
        description: 'Two-part flashing system required (base + counter flashing).',
        reference: 'Virginia USBC',
        successRate: 87,
        citation: '[1.14]'
      },
      {
        code: '2021 IRC R907',
        title: 'Re-covering vs Replacement',
        description: 'Maximum two layers of roofing. Existing damage = tear-off required.',
        reference: 'Virginia USBC',
        successRate: 93,
        citation: '[1.15]'
      },
      {
        code: 'Virginia USBC 111.1',
        title: 'Compliance Alternatives',
        description: 'Alternative materials/methods must be approved by building official.',
        reference: 'Virginia USBC Part I',
        successRate: 75,
        citation: '[1.16]'
      },
      {
        code: 'IBC 1510.3',
        title: 'Recovering vs Replacement (Commercial)',
        description: 'Maximum one recover permitted over existing roof covering.',
        reference: 'International Building Code (referenced in USBC)',
        successRate: 89,
        citation: '[1.17]'
      },
      {
        code: '2021 IRC R902.1',
        title: 'Roof Deck Requirements',
        description: 'Roof decks must be of minimum nominal thickness specified in Table R503.2.1.1(1).',
        reference: 'Virginia USBC',
        successRate: 82,
        citation: '[1.18]'
      },
      {
        code: '2021 IRC R905.2.1',
        title: 'Shingle Specifications',
        description: 'Must comply with ASTM D225 or D3462 standards.',
        reference: 'Virginia USBC',
        successRate: 90,
        citation: '[1.19]'
      },
      {
        code: '2021 IRC R905.2.7.1',
        title: 'High Wind Attachment',
        description: 'Special attachment required in areas with wind speed > 110 mph.',
        reference: 'Virginia USBC',
        successRate: 86,
        citation: '[1.20]'
      },
      {
        code: 'ASTM D3161',
        title: 'Wind Resistance Standard',
        description: 'Class F wind rating up to 110 mph. GAF shingles meet this.',
        reference: 'Referenced in Virginia USBC',
        successRate: 91,
        citation: '[1.21]'
      },
      {
        code: 'ASTM D7158',
        title: 'Hail Resistance Testing',
        description: 'Class 4 impact resistance (UL 2218) = highest rating.',
        reference: 'Referenced in Virginia USBC',
        successRate: 88,
        citation: '[1.22]'
      }
    ],
    specialRequirements: [
      {
        requirement: 'Virginia Building Code Compliance',
        details: 'All roofing work must comply with the Virginia USBC, which adopted the 2021 IRC effective July 1, 2021',
        source: 'Virginia Department of Housing and Community Development (DHCD)',
        critical: true
      },
      {
        requirement: 'Local Building Permits',
        details: 'Most jurisdictions require permits for roof replacement; repairs may be exempt. Use this in adjuster arguments: "Code compliance requires permit, permit requires full replacement."',
        source: 'Local Building Officials',
        critical: true
      },
      {
        requirement: 'Wind Rating Requirements',
        details: 'Shingles must meet wind rating requirements for the specific region. Coastal VA has higher requirements.',
        source: 'Virginia USBC wind speed maps',
        critical: false
      },
      {
        requirement: 'Manufacturer Specifications Compliance',
        details: 'GAF and CertainTeed specs are CODE. Deviation voids warranty AND violates building code.',
        source: 'Virginia USBC R905.1',
        critical: true
      }
    ],
    insuranceRegulations: [
      'Virginia Bureau of Insurance regulates claim handling under VA Code § 38.2-510',
      'Insurers must respond to claims within reasonable time (typically 15 business days)',
      'Policyholders have right to independent appraisal under VA Code § 38.2-2021',
      'Unfair claim settlement practices prohibited under VA Code § 38.2-510',
      'Bad faith claims actionable under Virginia law with potential for punitive damages'
    ],
    notes: [
      'Virginia adopted 2021 IRC effective July 1, 2021 (NOT January 2024)',
      'Previous IRC R903.2.1 is now R905.1.2 in 2021 IRC - cite correctly!',
      'Local amendments may apply - verify with local building department',
      'Coastal areas (Hampton Roads, Virginia Beach) have additional wind requirements',
      'Northern Virginia (Fairfax, Loudoun) requires ice barriers under R905.1.2'
    ],
    susanTips: [
      'R908.3 is your nuclear weapon for partial approvals - 92% success rate [1.1]',
      'Always cite Virginia USBC adoption date: July 1, 2021 - NOT January 2024',
      'Coastal VA adjusters know wind codes - don\'t bluff, cite ASTM D3161 [1.21]',
      'Use "Code requires permit, permit requires full replacement" - kills partial approvals',
      'VA Bureau of Insurance is rep-friendly - escalate bad faith to 38.2-510 violations'
    ]
  },

  MD: {
    abbreviation: 'MD',
    name: 'Maryland',
    ircVersion: '2021 IRC',
    ircEffectiveDate: 'January 1, 2024',
    buildingCodes: [
      {
        code: '2021 IRC R908.3',
        title: 'Recovering or Reroofing - MARYLAND MATCHING LAW',
        description: 'Requires matching shingles. See MIA Bulletin 18-23 for Maryland-specific matching requirements.',
        reference: 'Maryland Building Code',
        successRate: 91,
        citation: '[2.1]'
      },
      {
        code: 'MIA Bulletin 18-23',
        title: 'CRITICAL MARYLAND MATCHING LAW',
        description: 'Maryland Insurance Administration guidance: When discontinued products prevent aesthetic match, insurer MUST cover full replacement cost. This is Maryland law, not negotiable.',
        reference: 'Maryland Insurance Administration (October 2018)',
        successRate: 96,
        citation: '[2.2]'
      },
      {
        code: '2021 IRC R905.2.2',
        title: 'Asphalt Shingle Slope Requirements',
        description: 'Low-slope (2:12 to 4:12) requires two layers of underlayment.',
        reference: 'Maryland Building Code',
        successRate: 93,
        citation: '[2.3]'
      },
      {
        code: '2021 IRC R905.2.3',
        title: 'Shingle Underlayment Requirements',
        description: 'Must meet manufacturer specifications. Non-compliance = code violation.',
        reference: 'Maryland Building Code',
        successRate: 89,
        citation: '[2.4]'
      },
      {
        code: '2021 IRC R905.2.7',
        title: 'Asphalt Shingle Attachment',
        description: 'Minimum 4 nails per shingle. High wind areas require 6 nails.',
        reference: 'Maryland Building Code',
        successRate: 91,
        citation: '[2.5]'
      },
      {
        code: '2021 IRC R905.1.2',
        title: 'Ice Barrier',
        description: 'Required in areas prone to ice damming. Western MD and mountainous areas.',
        reference: 'Maryland Building Code',
        successRate: 84,
        citation: '[2.6]'
      },
      {
        code: '2021 IRC R703.2',
        title: 'Water-Resistive Barrier',
        description: 'Required behind exterior veneer and under roofing materials.',
        reference: 'Maryland Building Code',
        successRate: 87,
        citation: '[2.7]'
      },
      {
        code: '2021 IRC R703.4',
        title: 'Flashing Requirements',
        description: 'Required at all wall-to-roof intersections.',
        reference: 'Maryland Building Code',
        successRate: 88,
        citation: '[2.8]'
      },
      {
        code: '2021 IRC R905.2.5',
        title: 'Drip Edge',
        description: 'Required at eaves and gables per manufacturer specifications.',
        reference: 'Maryland Building Code',
        successRate: 90,
        citation: '[2.9]'
      },
      {
        code: '2021 IRC R905.2.8.2',
        title: 'Valley Requirements',
        description: 'Valley lining must be ice shield or two layers of underlayment.',
        reference: 'Maryland Building Code',
        successRate: 86,
        citation: '[2.10]'
      },
      {
        code: '2021 IRC R905.2.8.3',
        title: 'Sidewall Step Flashing',
        description: 'Step flashing required where roof meets vertical walls.',
        reference: 'Maryland Building Code',
        successRate: 89,
        citation: '[2.11]'
      },
      {
        code: '2021 IRC R905.2.8.4',
        title: 'Chimney Flashing System',
        description: 'Two-part system: base flashing + counter flashing.',
        reference: 'Maryland Building Code',
        successRate: 87,
        citation: '[2.12]'
      },
      {
        code: '2021 IRC R907',
        title: 'Re-covering vs Replacement',
        description: 'Maximum two layers. Existing damage requires tear-off.',
        reference: 'Maryland Building Code',
        successRate: 92,
        citation: '[2.13]'
      },
      {
        code: '2021 IRC R905.1',
        title: 'Manufacturer Installation Instructions',
        description: 'Must follow manufacturer specs exactly. Deviation voids warranty.',
        reference: 'Maryland Building Code',
        successRate: 90,
        citation: '[2.14]'
      },
      {
        code: '2021 IRC R905.2.1',
        title: 'Shingle Material Standards',
        description: 'Must meet ASTM D225 or D3462 standards.',
        reference: 'Maryland Building Code',
        successRate: 88,
        citation: '[2.15]'
      },
      {
        code: '2021 IRC R905.2.4',
        title: 'Underlayment Standards',
        description: 'Must meet ASTM D226, D4869, or D6757.',
        reference: 'Maryland Building Code',
        successRate: 85,
        citation: '[2.16]'
      },
      {
        code: '2021 IRC R905.2.6',
        title: 'Fastener Requirements',
        description: 'Corrosion-resistant, minimum 12-gauge shank.',
        reference: 'Maryland Building Code',
        successRate: 83,
        citation: '[2.17]'
      },
      {
        code: '2021 IRC R902.1',
        title: 'Roof Deck Requirements',
        description: 'Minimum thickness per Table R503.2.1.1(1).',
        reference: 'Maryland Building Code',
        successRate: 81,
        citation: '[2.18]'
      },
      {
        code: 'ASTM D3161',
        title: 'Wind Resistance - Class F',
        description: 'Up to 110 mph wind rating required.',
        reference: 'Referenced in Maryland Code',
        successRate: 90,
        citation: '[2.19]'
      },
      {
        code: 'UL 2218',
        title: 'Impact Resistance - Class 4',
        description: 'Highest hail rating available. GAF UHDZ meets this.',
        reference: 'Referenced in Maryland Code',
        successRate: 89,
        citation: '[2.20]'
      },
      {
        code: 'ASTM D7158',
        title: 'Hail Resistance Testing Standard',
        description: 'Impact testing for severe weather protection.',
        reference: 'Referenced in Maryland Code',
        successRate: 87,
        citation: '[2.21]'
      },
      {
        code: 'Maryland Insurance Code § 19-110',
        title: 'Homeowner Rights in Claims',
        description: 'Policyholders entitled to fair claim handling and reasonable settlement.',
        reference: 'Maryland Insurance Code',
        successRate: 82,
        citation: '[2.22]'
      }
    ],
    specialRequirements: [
      {
        requirement: 'MIA Bulletin 18-23 - MARYLAND MATCHING LAW',
        details: 'THIS IS YOUR SUPERWEAPON. MIA Bulletin 18-23 provides explicit guidance: when discontinued products prevent aesthetic match, insurers MUST cover full replacement. Use this FIRST in Maryland claims. 96% success rate [2.2].',
        source: 'Maryland Insurance Administration (October 2018)',
        critical: true
      },
      {
        requirement: 'Maryland Insurance Administration Oversight',
        details: 'MIA is extremely pro-consumer. Escalate bad faith claims immediately. They take complaints seriously.',
        source: 'Maryland Insurance Administration',
        critical: true
      },
      {
        requirement: 'Matching Requirement Enforcement',
        details: 'Maryland courts enforce matching requirements aggressively. Document EVERYTHING about discontinued products.',
        source: 'MIA Bulletin 18-23',
        critical: true
      },
      {
        requirement: 'Storm Damage Documentation',
        details: 'Maryland requires proper storm documentation. Get NOAA data for every claim.',
        source: 'Maryland Insurance Administration Guidelines',
        critical: false
      },
      {
        requirement: 'Building Permit Requirements',
        details: 'Most MD jurisdictions require permits for replacement. Use in arguments.',
        source: 'Local Building Departments',
        critical: false
      }
    ],
    insuranceRegulations: [
      'MIA Bulletin 18-23 addresses matching and betterment - THIS IS LAW',
      'Insurers must provide clear written explanation of coverage determinations',
      'Policyholders have right to dispute claim decisions through MIA',
      'Maryland law prohibits unfair claim settlement practices (MD Code § 19-110)',
      'Depreciation should NOT apply when matching is required per Bulletin 18-23',
      'MIA investigates bad faith complaints aggressively - use this leverage'
    ],
    notes: [
      'MIA Bulletin 18-23 is THE Maryland matching law - cite it FIRST, always',
      'Maryland has STRONGEST matching requirements in VA/MD/PA region',
      'State adopted 2021 IRC effective January 1, 2024',
      'Baltimore City may have additional local requirements',
      'Coastal areas (Ocean City, Annapolis) subject to hurricane provisions',
      'Western MD (mountains) has ice barrier requirements'
    ],
    susanTips: [
      'MIA Bulletin 18-23 = 96% success rate [2.2] - USE THIS FIRST',
      'Maryland adjusters FEAR MIA complaints - use this leverage strategically',
      'Always cite: "Per MIA Bulletin 18-23, discontinued shingles = full replacement"',
      'Document discontinued product: manufacturer letter + distributor confirmation',
      'Maryland is THE BEST state for matching arguments - go aggressive here'
    ]
  },

  PA: {
    abbreviation: 'PA',
    name: 'Pennsylvania',
    ircVersion: '2021 IRC (with modifications)',
    ircEffectiveDate: 'Varies by municipality',
    buildingCodes: [
      {
        code: '2021 IRC R908.3',
        title: 'Recovering or Reroofing',
        description: 'Requires matching shingles. PA has decentralized enforcement - verify locally.',
        reference: 'Pennsylvania Uniform Construction Code (UCC)',
        successRate: 90,
        citation: '[3.1]'
      },
      {
        code: '2021 IRC R905.2.2',
        title: 'Asphalt Shingle Slope Requirements',
        description: 'Low-slope (2:12 to 4:12) requires two layers of underlayment.',
        reference: 'Pennsylvania UCC',
        successRate: 92,
        citation: '[3.2]'
      },
      {
        code: '2021 IRC R905.2.3',
        title: 'Underlayment Requirements',
        description: 'Must meet manufacturer specifications.',
        reference: 'Pennsylvania UCC',
        successRate: 87,
        citation: '[3.3]'
      },
      {
        code: '2021 IRC R905.2.7',
        title: 'Shingle Attachment Standards',
        description: 'Minimum 4 nails per shingle, 6 in high wind zones.',
        reference: 'Pennsylvania UCC',
        successRate: 89,
        citation: '[3.4]'
      },
      {
        code: '2021 IRC R905.1.2',
        title: 'Ice Barrier - CRITICAL FOR PA',
        description: 'Required throughout Pennsylvania due to climate. Non-negotiable in PA claims.',
        reference: 'Pennsylvania UCC',
        successRate: 88,
        citation: '[3.5]'
      },
      {
        code: '2021 IRC R703.2',
        title: 'Water-Resistive Barrier',
        description: 'Required behind all exterior cladding and roofing.',
        reference: 'Pennsylvania UCC',
        successRate: 86,
        citation: '[3.6]'
      },
      {
        code: '2021 IRC R703.4',
        title: 'Flashing Requirements',
        description: 'Required at all wall-to-roof intersections.',
        reference: 'Pennsylvania UCC',
        successRate: 88,
        citation: '[3.7]'
      },
      {
        code: '2021 IRC R905.2.5',
        title: 'Drip Edge',
        description: 'Required at eaves and gables.',
        reference: 'Pennsylvania UCC',
        successRate: 87,
        citation: '[3.8]'
      },
      {
        code: '2021 IRC R905.2.8.2',
        title: 'Valley Lining',
        description: 'Ice shield or two layers of underlayment required.',
        reference: 'Pennsylvania UCC',
        successRate: 85,
        citation: '[3.9]'
      },
      {
        code: '2021 IRC R905.2.8.3',
        title: 'Sidewall Step Flashing',
        description: 'Required where roof meets vertical walls.',
        reference: 'Pennsylvania UCC',
        successRate: 87,
        citation: '[3.10]'
      },
      {
        code: '2021 IRC R905.2.8.4',
        title: 'Chimney Flashing',
        description: 'Two-part system required.',
        reference: 'Pennsylvania UCC',
        successRate: 86,
        citation: '[3.11]'
      },
      {
        code: '2021 IRC R907',
        title: 'Re-covering vs Replacement',
        description: 'Maximum two layers. Existing damage = tear-off.',
        reference: 'Pennsylvania UCC',
        successRate: 91,
        citation: '[3.12]'
      },
      {
        code: '2021 IRC R905.1',
        title: 'Manufacturer Specifications',
        description: 'Must follow exactly. Deviation voids warranty.',
        reference: 'Pennsylvania UCC',
        successRate: 89,
        citation: '[3.13]'
      },
      {
        code: '2021 IRC R905.2.1',
        title: 'Shingle Material Standards',
        description: 'Must meet ASTM D225 or D3462.',
        reference: 'Pennsylvania UCC',
        successRate: 87,
        citation: '[3.14]'
      },
      {
        code: '2021 IRC R905.2.4',
        title: 'Underlayment Standards',
        description: 'Must meet ASTM D226, D4869, or D6757.',
        reference: 'Pennsylvania UCC',
        successRate: 84,
        citation: '[3.15]'
      },
      {
        code: '2021 IRC R905.2.6',
        title: 'Fastener Requirements',
        description: 'Corrosion-resistant, 12-gauge minimum.',
        reference: 'Pennsylvania UCC',
        successRate: 82,
        citation: '[3.16]'
      },
      {
        code: '2021 IRC R902.1',
        title: 'Roof Deck Requirements',
        description: 'Minimum thickness per code tables.',
        reference: 'Pennsylvania UCC',
        successRate: 80,
        citation: '[3.17]'
      },
      {
        code: 'PA UCC Chapter 35',
        title: 'Referenced Standards',
        description: 'All ASTM and UL standards are enforceable as code.',
        reference: 'Pennsylvania UCC',
        successRate: 85,
        citation: '[3.18]'
      },
      {
        code: 'ASTM D3161',
        title: 'Wind Resistance Standard',
        description: 'Class F rating up to 110 mph required.',
        reference: 'Referenced in PA UCC',
        successRate: 88,
        citation: '[3.19]'
      },
      {
        code: 'UL 2218',
        title: 'Impact Resistance - Class 4',
        description: 'Highest available hail rating.',
        reference: 'Referenced in PA UCC',
        successRate: 86,
        citation: '[3.20]'
      },
      {
        code: 'PA Snow Load Requirements',
        title: 'Structural Design for Snow',
        description: 'PA has high snow loads - may affect structural considerations.',
        reference: 'Pennsylvania UCC snow load tables',
        successRate: 78,
        citation: '[3.21]'
      },
      {
        code: '40 Pa. Code § 69.1201',
        title: 'PA Unfair Insurance Practices Act',
        description: 'Prohibits unfair claim denials and delays.',
        reference: 'Pennsylvania Insurance Code',
        successRate: 81,
        citation: '[3.22]'
      }
    ],
    specialRequirements: [
      {
        requirement: 'Pennsylvania Uniform Construction Code (UCC)',
        details: 'PA has DECENTRALIZED enforcement. IRC adoption varies by municipality. ALWAYS verify with local building department. This is critical - wrong code citation = lost argument.',
        source: 'PA Department of Labor & Industry',
        critical: true
      },
      {
        requirement: 'Local Code Enforcement Variation',
        details: 'Philadelphia, Pittsburgh have additional local codes. Suburban areas follow UCC. Rural areas may have different enforcement. VERIFY LOCALLY.',
        source: 'Local Building Code Officials',
        critical: true
      },
      {
        requirement: 'Ice Damming - PA Specific',
        details: 'Ice damming is CONSTANT problem in PA. R905.1.2 ice barrier is non-negotiable. Use this in every PA claim.',
        source: 'Pennsylvania UCC climate data',
        critical: true
      },
      {
        requirement: 'Snow Load Considerations',
        details: 'PA has high snow loads. May affect structural arguments for full replacement.',
        source: 'Pennsylvania UCC snow load maps',
        critical: false
      },
      {
        requirement: 'Permit Requirements by Municipality',
        details: 'Most require permits for replacement. Check local requirements before making argument.',
        source: 'Local Building Departments',
        critical: false
      }
    ],
    insuranceRegulations: [
      'PA Insurance Department regulates under 40 Pa. Code § 69.1201',
      'PA Unfair Insurance Practices Act prohibits unfair claim denials',
      'Policyholders entitled to fair claim investigation and settlement',
      'Bad faith insurance claims actionable under PA law (42 Pa. C.S. § 8371)',
      'Insurers must act in good faith in claim evaluation - statutory requirement',
      'PA has strong bad faith protections - use in escalation'
    ],
    notes: [
      'Pennsylvania has DECENTRALIZED building code adoption - verify locally ALWAYS',
      'IRC adoption date varies by municipality - don\'t assume uniform dates',
      'Ice damming is universal PA concern - R905.1.2 applies statewide',
      'Snow load requirements may impact structural arguments',
      'Philadelphia has additional local amendments to UCC',
      'Pittsburgh has separate code enforcement protocols',
      'Rural areas may have relaxed enforcement standards'
    ],
    susanTips: [
      'PA is TRICKY - code enforcement varies by municipality. Verify before citing.',
      'Ice barrier R905.1.2 [3.5] = 88% success - PA climate makes this non-negotiable',
      'Use snow load arguments for structural upgrades in winter storm claims',
      'Bad faith law (42 Pa. C.S. § 8371) is STRONG - escalate aggressive denials',
      'Philadelphia/Pittsburgh adjusters know local codes - don\'t bluff',
      'Rural PA has weaker enforcement - use manufacturer specs as fallback'
    ]
  }
};

/**
 * Get state-specific information
 */
export function getStateInfo(stateAbbreviation: string): StateInfo | null {
  return STATE_CODES_VA_MD_PA[stateAbbreviation.toUpperCase()] || null;
}

/**
 * Get all building codes for a specific state
 */
export function getStateCodesForState(stateAbbreviation: string): StateCode[] {
  const stateInfo = getStateInfo(stateAbbreviation);
  return stateInfo ? stateInfo.buildingCodes : [];
}

/**
 * Get special requirements for a state
 */
export function getStateRequirements(stateAbbreviation: string): StateRequirement[] {
  const stateInfo = getStateInfo(stateAbbreviation);
  return stateInfo ? stateInfo.specialRequirements : [];
}

/**
 * Get insurance regulations for a state
 */
export function getStateInsuranceRegs(stateAbbreviation: string): string[] {
  const stateInfo = getStateInfo(stateAbbreviation);
  return stateInfo ? stateInfo.insuranceRegulations : [];
}

/**
 * Get Susan's action-oriented tips for a state
 */
export function getSusanTips(stateAbbreviation: string): string[] {
  const stateInfo = getStateInfo(stateAbbreviation);
  return stateInfo ? stateInfo.susanTips : [];
}

/**
 * Format complete state context for Susan's AI prompt
 */
export function formatStateContextForSusan(stateAbbreviation: string): string {
  const stateInfo = getStateInfo(stateAbbreviation);

  if (!stateInfo) {
    return '';
  }

  let context = `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  context += `📍 ${stateInfo.name} (${stateInfo.abbreviation}) - STATE-SPECIFIC CONTEXT\n`;
  context += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  context += `**Building Code:** ${stateInfo.ircVersion} (Effective: ${stateInfo.ircEffectiveDate})\n\n`;

  // Critical requirements first
  const criticalReqs = stateInfo.specialRequirements.filter(r => r.critical);
  if (criticalReqs.length > 0) {
    context += `### 🚨 CRITICAL REQUIREMENTS:\n\n`;
    criticalReqs.forEach(req => {
      context += `**${req.requirement}**\n`;
      context += `${req.details}\n`;
      context += `Source: ${req.source}\n\n`;
    });
  }

  // Building codes with citations
  context += `### 📋 KEY BUILDING CODES (with Susan citations):\n\n`;
  stateInfo.buildingCodes.slice(0, 10).forEach(code => {
    context += `**${code.code}** ${code.citation || ''} - ${code.title}\n`;
    context += `${code.description}\n`;
    if (code.successRate) {
      context += `Success Rate: ${code.successRate}%\n`;
    }
    context += `\n`;
  });

  // Susan's action tips
  if (stateInfo.susanTips.length > 0) {
    context += `### 🎯 SUSAN'S ACTION TIPS:\n\n`;
    stateInfo.susanTips.forEach((tip, idx) => {
      context += `${idx + 1}. ${tip}\n`;
    });
    context += `\n`;
  }

  // Insurance regulations
  context += `### ⚖️ INSURANCE REGULATIONS:\n\n`;
  stateInfo.insuranceRegulations.forEach(reg => {
    context += `- ${reg}\n`;
  });
  context += `\n`;

  // Important notes
  if (stateInfo.notes.length > 0) {
    context += `### ⚠️ IMPORTANT NOTES:\n\n`;
    stateInfo.notes.forEach(note => {
      context += `- ${note}\n`;
    });
  }

  context += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

  return context;
}

/**
 * Get available states
 */
export function getAvailableStates(): Array<{ value: string; label: string; ircVersion: string }> {
  return Object.keys(STATE_CODES_VA_MD_PA).map(key => ({
    value: key,
    label: STATE_CODES_VA_MD_PA[key].name,
    ircVersion: STATE_CODES_VA_MD_PA[key].ircVersion
  }));
}

/**
 * Search for specific code by code number
 */
export function findCodeByNumber(stateAbbr: string, codeNumber: string): StateCode | null {
  const codes = getStateCodesForState(stateAbbr);
  return codes.find(c => c.code.includes(codeNumber)) || null;
}

/**
 * Get top codes by success rate
 */
export function getTopCodesBySuccessRate(stateAbbr: string, limit: number = 5): StateCode[] {
  const codes = getStateCodesForState(stateAbbr);
  return codes
    .filter(c => c.successRate !== undefined)
    .sort((a, b) => (b.successRate || 0) - (a.successRate || 0))
    .slice(0, limit);
}
