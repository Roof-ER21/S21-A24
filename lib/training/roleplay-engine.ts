/**
 * Roleplay Engine for Agnes 24
 * Manages training scenarios for sales reps
 */

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type CharacterType = 'homeowner' | 'adjuster' | 'contractor' | 'skeptical-homeowner';

export interface RoleplayScenario {
  id: string;
  title: string;
  difficulty: DifficultyLevel;
  character: CharacterType;
  characterName: string;
  characterBackground: string;
  objective: string;
  successCriteria: string[];
  openingLine: string;
  responsePatterns: ResponsePattern[];
  commonMistakes: string[];
  coachingTips: string[];
  estimatedDuration: number; // minutes
}

export interface ResponsePattern {
  trigger: string; // What rep says/does
  response: string; // Character's response
  emotionalState: 'calm' | 'concerned' | 'frustrated' | 'interested' | 'defensive';
  continuesScenario: boolean;
}

export interface RoleplaySession {
  scenarioId: string;
  startTime: Date;
  endTime?: Date;
  exchanges: Exchange[];
  score?: number;
  feedback?: string;
  criteriaMetCount: number;
}

export interface Exchange {
  repMessage: string;
  characterResponse: string;
  timestamp: Date;
}

/**
 * BEGINNER SCENARIOS
 * Focus: Basic objections and simple concerns
 */
const beginnerScenarios: RoleplayScenario[] = [
  {
    id: 'beginner-price-objection',
    title: 'Price Objection - "Too Expensive"',
    difficulty: 'beginner',
    character: 'homeowner',
    characterName: 'Sarah Martinez',
    characterBackground: 'First-time insurance claim, homeowner for 5 years, budget-conscious',
    objective: 'Address price concerns while explaining insurance claim benefits and quality value',
    successCriteria: [
      'Acknowledge the concern empathetically',
      'Explain insurance claim process (not out-of-pocket)',
      'Emphasize quality and warranty value',
      'Avoid being defensive about pricing',
      'Build trust through education',
    ],
    openingLine: "I got your estimate, but honestly, this seems really expensive. I wasn't expecting it to cost this much.",
    responsePatterns: [
      {
        trigger: 'insurance|claim|deductible',
        response: "Oh, I didn't realize insurance would cover most of it. But I still have to pay the deductible, right? That's still a lot of money.",
        emotionalState: 'concerned',
        continuesScenario: true,
      },
      {
        trigger: 'quality|warranty|materials',
        response: "I guess quality matters, but how do I know you're not just charging more than you need to? My neighbor got a roof done cheaper.",
        emotionalState: 'defensive',
        continuesScenario: true,
      },
      {
        trigger: 'value|investment|protection',
        response: "That makes sense. I hadn't thought about it as protecting my biggest investment. Tell me more about the warranty.",
        emotionalState: 'interested',
        continuesScenario: true,
      },
    ],
    commonMistakes: [
      'Getting defensive about price',
      'Not explaining insurance claim process clearly',
      'Failing to build value before discussing cost',
      'Not addressing the emotional concern behind the objection',
    ],
    coachingTips: [
      'Lead with empathy - acknowledge their concern is valid',
      'Educate about insurance claims - most clients don\'t understand the process',
      'Frame price as investment in home protection, not expense',
      'Use specific examples of quality differences',
    ],
    estimatedDuration: 5,
  },
  {
    id: 'beginner-timeline-concern',
    title: 'Timeline Concerns - "How Long Will This Take?"',
    difficulty: 'beginner',
    character: 'homeowner',
    characterName: 'Mike Thompson',
    characterBackground: 'Works from home, concerned about disruption, has young children',
    objective: 'Explain timeline realistically while addressing disruption concerns',
    successCriteria: [
      'Provide realistic timeline estimate',
      'Address noise and disruption concerns',
      'Explain what homeowner can expect each day',
      'Offer solutions for minimizing impact',
      'Build confidence in the process',
    ],
    openingLine: "I work from home and my kids are in virtual school. How long is this going to take, and will it be really loud?",
    responsePatterns: [
      {
        trigger: 'days|week|timeline',
        response: "A week? That seems like a long time. Will you be working every single day, or will there be breaks?",
        emotionalState: 'concerned',
        continuesScenario: true,
      },
      {
        trigger: 'noise|quiet|disruption',
        response: "I appreciate you being honest about the noise. Are there specific hours you work, or is it all day? I need to plan my work meetings.",
        emotionalState: 'interested',
        continuesScenario: true,
      },
      {
        trigger: 'kids|children|family',
        response: "That's good to know. I'm mostly worried about the kids being scared or distracted during school. Can we work around their schedule at all?",
        emotionalState: 'concerned',
        continuesScenario: true,
      },
    ],
    commonMistakes: [
      'Giving unrealistic timeline to close the deal',
      'Minimizing disruption concerns',
      'Not offering specific solutions',
      'Failing to explain the daily process',
    ],
    coachingTips: [
      'Be honest about timeline - trust is more important than a quick close',
      'Show empathy for family situation',
      'Offer specific accommodations (timing, communication, etc.)',
      'Explain what they\'ll see and hear each day',
    ],
    estimatedDuration: 5,
  },
  {
    id: 'beginner-insurance-confusion',
    title: 'Insurance Process Confusion',
    difficulty: 'beginner',
    character: 'homeowner',
    characterName: 'Linda Chen',
    characterBackground: 'Never filed insurance claim before, overwhelmed by process, needs guidance',
    objective: 'Educate about insurance claim process and guide homeowner through next steps',
    successCriteria: [
      'Explain insurance claim process clearly',
      'Break down deductible and coverage',
      'Outline specific next steps',
      'Reduce homeowner anxiety',
      'Position yourself as trusted advisor',
    ],
    openingLine: "I've never done this before and I'm completely confused. Can you explain how insurance claims work? Do I have to pay you upfront?",
    responsePatterns: [
      {
        trigger: 'deductible|pay|cost',
        response: "Okay, so I pay my deductible and insurance covers the rest? When do I pay the deductible - before or after the work?",
        emotionalState: 'interested',
        continuesScenario: true,
      },
      {
        trigger: 'adjuster|inspection|claim',
        response: "I already talked to my insurance company and they're sending an adjuster. What happens when they come out? Should I be there?",
        emotionalState: 'concerned',
        continuesScenario: true,
      },
      {
        trigger: 'guide|help|process',
        response: "This is really helpful. I was so stressed about this. So you'll help me through the whole process? What if insurance denies something?",
        emotionalState: 'calm',
        continuesScenario: true,
      },
    ],
    commonMistakes: [
      'Using too much industry jargon',
      'Rushing through explanation',
      'Not checking for understanding',
      'Overwhelming with too much information at once',
    ],
    coachingTips: [
      'Use simple, clear language - avoid jargon',
      'Break process into bite-sized steps',
      'Check for understanding frequently',
      'Position yourself as guide through the process',
      'Reduce anxiety by showing you\'ve done this many times',
    ],
    estimatedDuration: 6,
  },
  {
    id: 'beginner-material-questions',
    title: 'Material and Quality Questions',
    difficulty: 'beginner',
    character: 'homeowner',
    characterName: 'David Rodriguez',
    characterBackground: 'Research-oriented, wants to understand options, values quality',
    objective: 'Educate about materials while guiding to appropriate choice',
    successCriteria: [
      'Explain material options clearly',
      'Match recommendation to their needs',
      'Educate about quality differences',
      'Build confidence in recommendation',
      'Avoid overwhelming with too many options',
    ],
    openingLine: "I've been reading about different roofing materials online. What's the difference between all these shingles? How do I know which is best?",
    responsePatterns: [
      {
        trigger: 'warranty|guarantee|durability',
        response: "That's important to me. I want something that will last. What's the warranty difference between the options?",
        emotionalState: 'interested',
        continuesScenario: true,
      },
      {
        trigger: 'climate|weather|wind',
        response: "We do get some strong storms here. Which material holds up best in high winds? I don't want to deal with this again in a few years.",
        emotionalState: 'concerned',
        continuesScenario: true,
      },
      {
        trigger: 'recommend|suggest|best',
        response: "Based on what you're saying, which would you recommend for my situation? I trust your expertise here.",
        emotionalState: 'interested',
        continuesScenario: true,
      },
    ],
    commonMistakes: [
      'Overwhelming with too many technical details',
      'Not asking about homeowner priorities',
      'Pushing most expensive option without justification',
      'Using confusing industry terminology',
    ],
    coachingTips: [
      'Ask about priorities first (cost, longevity, appearance, etc.)',
      'Simplify options to 2-3 clear choices',
      'Use analogies to explain technical concepts',
      'Recommend based on their actual needs, not highest margin',
    ],
    estimatedDuration: 7,
  },
];

/**
 * INTERMEDIATE SCENARIOS
 * Focus: Complex objections, financing, competitor comparisons
 */
const intermediateScenarios: RoleplayScenario[] = [
  {
    id: 'intermediate-financing-discussion',
    title: 'Financing and Payment Options',
    difficulty: 'intermediate',
    character: 'homeowner',
    characterName: 'Jennifer Wilson',
    characterBackground: 'Approved claim but concerned about deductible, needs financing options',
    objective: 'Present financing options professionally while addressing concerns',
    successCriteria: [
      'Explain financing options clearly',
      'Address credit concerns sensitively',
      'Show multiple payment solutions',
      'Avoid high-pressure tactics',
      'Make process easy and dignified',
    ],
    openingLine: "Insurance approved the claim, but my deductible is $2,500 and I don't have that available right now. Do you offer financing?",
    responsePatterns: [
      {
        trigger: 'financing|payment plan|monthly',
        response: "What kind of financing do you offer? I'm worried about my credit - I had some issues a few years ago. Will that be a problem?",
        emotionalState: 'concerned',
        continuesScenario: true,
      },
      {
        trigger: 'credit|qualify|approval',
        response: "That's a relief. What are the typical terms? I need to make sure the monthly payment fits my budget.",
        emotionalState: 'interested',
        continuesScenario: true,
      },
      {
        trigger: 'budget|afford|payment',
        response: "I can probably handle around $150-200 a month. Is that realistic for a $2,500 deductible?",
        emotionalState: 'interested',
        continuesScenario: true,
      },
    ],
    commonMistakes: [
      'Being judgmental about financial situation',
      'Not having clear financing information ready',
      'Pressuring homeowner to decide immediately',
      'Not offering multiple solutions',
    ],
    coachingTips: [
      'Treat financial discussions with dignity and sensitivity',
      'Have multiple financing options ready',
      'Focus on making it easy and stress-free',
      'Never pressure - financing should feel like a solution, not a burden',
    ],
    estimatedDuration: 8,
  },
  {
    id: 'intermediate-competitor-comparison',
    title: 'Competitor Comparison - "I Got Another Quote"',
    difficulty: 'intermediate',
    character: 'homeowner',
    characterName: 'Robert Jackson',
    characterBackground: 'Has multiple quotes, price-focused but values quality, analytical',
    objective: 'Differentiate your service without bashing competitors',
    successCriteria: [
      'Ask questions about competitor quotes',
      'Identify differences professionally',
      'Emphasize value, not just price',
      'Avoid negative talk about competitors',
      'Build confidence in your company',
    ],
    openingLine: "I got two other quotes and they're both lower than yours - one is $1,200 less. Why should I pay more?",
    responsePatterns: [
      {
        trigger: 'compare|difference|include',
        response: "They both say they use quality materials. How do I know if they're actually different? Everyone says they use good materials.",
        emotionalState: 'defensive',
        continuesScenario: true,
      },
      {
        trigger: 'warranty|guarantee|service',
        response: "Good point about the warranty. The cheaper quote only has a 10-year warranty. Is that a big difference?",
        emotionalState: 'interested',
        continuesScenario: true,
      },
      {
        trigger: 'quality|workmanship|experience',
        response: "I do want it done right. I've heard horror stories about roof jobs gone wrong. How do I verify you guys are actually better?",
        emotionalState: 'concerned',
        continuesScenario: true,
      },
    ],
    commonMistakes: [
      'Badmouthing competitors',
      'Getting defensive about price',
      'Not asking questions about other quotes',
      'Failing to identify actual differences',
    ],
    coachingTips: [
      'Ask questions to understand what competitors quoted',
      'Identify specific differences (materials, warranty, process)',
      'Use social proof (reviews, references)',
      'Stay professional - never bash competitors',
      'Focus on value and peace of mind',
    ],
    estimatedDuration: 10,
  },
  {
    id: 'intermediate-scope-dispute',
    title: 'Scope of Work Disagreement',
    difficulty: 'intermediate',
    character: 'homeowner',
    characterName: 'Patricia Moore',
    characterBackground: 'Questions what work is necessary, concerned about upselling',
    objective: 'Justify scope of work with education and evidence',
    successCriteria: [
      'Explain necessity of each item',
      'Use visual evidence when possible',
      'Educate about code requirements',
      'Address upselling concern directly',
      'Build trust through transparency',
    ],
    openingLine: "Your estimate includes replacing the underlayment and drip edge, but my neighbor just had his roof done and they only replaced the shingles. Do I really need all this?",
    responsePatterns: [
      {
        trigger: 'code|required|law',
        response: "So it's actually required by code? My neighbor didn't mention that. What happens if we don't do it?",
        emotionalState: 'concerned',
        continuesScenario: true,
      },
      {
        trigger: 'damage|problem|issue',
        response: "I didn't realize the underlayment could be damaged too. Can you show me what you're seeing?",
        emotionalState: 'interested',
        continuesScenario: true,
      },
      {
        trigger: 'protect|warranty|coverage',
        response: "I understand wanting to protect my investment. Is this something insurance typically covers, or is this an upgrade I'd pay for?",
        emotionalState: 'interested',
        continuesScenario: true,
      },
    ],
    commonMistakes: [
      'Not explaining WHY each item is needed',
      'Getting offended by upselling concern',
      'Not using visual evidence',
      'Failing to reference code requirements',
    ],
    coachingTips: [
      'Address upselling concern head-on with transparency',
      'Explain code requirements clearly',
      'Use photos/evidence to show damage or issues',
      'Separate required items from optional upgrades',
      'Educational approach builds trust',
    ],
    estimatedDuration: 10,
  },
  {
    id: 'intermediate-timing-pressure',
    title: 'Urgent Decision Pressure',
    difficulty: 'intermediate',
    character: 'homeowner',
    characterName: 'Thomas Anderson',
    characterBackground: 'Active leak, stressed about timeline, needs work ASAP but skeptical of pressure',
    objective: 'Create urgency without high-pressure tactics',
    successCriteria: [
      'Acknowledge urgency legitimately',
      'Explain real consequences of delay',
      'Offer solutions without pressure',
      'Build trust through honesty',
      'Make decision easy, not forced',
    ],
    openingLine: "I know there's a leak and it needs to be fixed, but I feel like you're rushing me. Can I think about it for a week or two?",
    responsePatterns: [
      {
        trigger: 'damage|leak|worse',
        response: "I understand it could get worse. But how much worse? Are we talking about minor damage or major problems?",
        emotionalState: 'concerned',
        continuesScenario: true,
      },
      {
        trigger: 'temporary|tarp|patch',
        response: "Could you do a temporary fix while I think about it? I don't want more damage, but I need time to decide.",
        emotionalState: 'interested',
        continuesScenario: true,
      },
      {
        trigger: 'schedule|timeline|available',
        response: "Okay, I see your point about the weather and your schedule. What if I decide by the end of this week?",
        emotionalState: 'interested',
        continuesScenario: true,
      },
    ],
    commonMistakes: [
      'Using fake urgency or high-pressure tactics',
      'Not respecting homeowner\'s need to think',
      'Exaggerating consequences',
      'Creating false scarcity',
    ],
    coachingTips: [
      'Be honest about real timeline concerns (weather, schedule, etc.)',
      'Explain actual consequences of delay',
      'Offer temporary solutions if appropriate',
      'Respect their need to think while educating about risks',
      'Build trust by being consultative, not pushy',
    ],
    estimatedDuration: 8,
  },
  {
    id: 'intermediate-material-upgrade',
    title: 'Upgrade Discussion - Premium Materials',
    difficulty: 'intermediate',
    character: 'homeowner',
    characterName: 'Elizabeth Harper',
    characterBackground: 'Interested in upgrades but unsure of value, needs ROI justification',
    objective: 'Present upgrade options with clear value proposition',
    successCriteria: [
      'Explain upgrade benefits clearly',
      'Provide ROI perspective',
      'Discuss insurance coverage for upgrades',
      'Avoid pushing unnecessary upgrades',
      'Help homeowner make informed decision',
    ],
    openingLine: "You mentioned I could upgrade to architectural shingles. What's the real difference, and is it worth the extra cost?",
    responsePatterns: [
      {
        trigger: 'appearance|curb appeal|looks',
        response: "I do care about how it looks - this is a nice neighborhood. But is the appearance difference really that noticeable?",
        emotionalState: 'interested',
        continuesScenario: true,
      },
      {
        trigger: 'resale|value|investment',
        response: "That's a good point about resale value. How much do you think it would add to my home value? I might sell in 5-10 years.",
        emotionalState: 'interested',
        continuesScenario: true,
      },
      {
        trigger: 'insurance|coverage|claim',
        response: "Wait, would insurance cover the upgrade, or is that something I'd have to pay for separately?",
        emotionalState: 'concerned',
        continuesScenario: true,
      },
    ],
    commonMistakes: [
      'Pushing upgrades without clear benefit',
      'Not explaining insurance coverage accurately',
      'Exaggerating ROI or value increase',
      'Not asking about homeowner\'s priorities',
    ],
    coachingTips: [
      'Ask about priorities first (longevity, appearance, resale, etc.)',
      'Be honest about insurance coverage for upgrades',
      'Provide realistic ROI and value perspectives',
      'Show examples of appearance difference',
      'Help them decide, don\'t push them',
    ],
    estimatedDuration: 9,
  },
];

/**
 * ADVANCED SCENARIOS
 * Focus: Difficult situations, partial denials, adjuster negotiations
 */
const advancedScenarios: RoleplayScenario[] = [
  {
    id: 'advanced-partial-denial',
    title: 'Partial Claim Denial - Homeowner Upset',
    difficulty: 'advanced',
    character: 'homeowner',
    characterName: 'Marcus Williams',
    characterBackground: 'Insurance denied part of claim, angry and frustrated, feeling cheated',
    objective: 'De-escalate emotions while explaining options and next steps',
    successCriteria: [
      'Acknowledge frustration empathetically',
      'Explain denial reasons clearly',
      'Present supplemental claim process',
      'Offer solutions and next steps',
      'Maintain professionalism under pressure',
      'Rebuild confidence in process',
    ],
    openingLine: "Insurance is only covering half of what you estimated! This is ridiculous - they're cheating me! What am I supposed to do now?",
    responsePatterns: [
      {
        trigger: 'understand|frustrating|unfair',
        response: "Damn right it's frustrating! I pay my premiums every month and now they're trying to lowball me. Can they even do this?",
        emotionalState: 'frustrated',
        continuesScenario: true,
      },
      {
        trigger: 'supplement|reinspection|appeal',
        response: "So you're saying we can fight this? What's the success rate? I don't want to waste time if it's not going to work.",
        emotionalState: 'interested',
        continuesScenario: true,
      },
      {
        trigger: 'experience|handled|similar',
        response: "How long does the supplement process take? I can't leave my roof damaged indefinitely. What if they deny it again?",
        emotionalState: 'concerned',
        continuesScenario: true,
      },
    ],
    commonMistakes: [
      'Not acknowledging emotional state',
      'Being defensive or corporate',
      'Overpromising supplement success',
      'Not having clear next steps',
      'Failing to explain denial reasons',
    ],
    coachingTips: [
      'Lead with empathy - validate their frustration first',
      'Explain why denials happen (not homeowner\'s fault)',
      'Present supplement process confidently but realistically',
      'Show your experience handling this',
      'Give clear action steps',
      'Be their advocate, not insurance company\'s defender',
    ],
    estimatedDuration: 12,
  },
  {
    id: 'advanced-adjuster-negotiation',
    title: 'Adjuster Disagreement - Storm Damage',
    difficulty: 'advanced',
    character: 'adjuster',
    characterName: 'James Patterson',
    characterBackground: 'Experienced adjuster, skeptical of storm damage claim, looking for reasons to deny',
    objective: 'Advocate for homeowner while maintaining professional relationship',
    successCriteria: [
      'Present evidence professionally',
      'Reference code and standards',
      'Avoid confrontational approach',
      'Document everything clearly',
      'Know when to escalate',
      'Maintain relationship for future claims',
    ],
    openingLine: "I've reviewed your estimate and I'm not seeing evidence of storm damage here. This looks like normal wear and tear to me.",
    responsePatterns: [
      {
        trigger: 'damage|evidence|photos',
        response: "I see the photos, but hail damage and normal granule loss can look similar. How can you definitively say this was from the storm?",
        emotionalState: 'defensive',
        continuesScenario: true,
      },
      {
        trigger: 'test|measurement|standard',
        response: "Alright, I respect that you're following protocols. But I still need to see more conclusive evidence. What else do you have?",
        emotionalState: 'interested',
        continuesScenario: true,
      },
      {
        trigger: 'code|requirement|IRC',
        response: "Fair point about code requirements. Let me review those sections again. What about the scope on the north slope - that seems excessive.",
        emotionalState: 'interested',
        continuesScenario: true,
      },
    ],
    commonMistakes: [
      'Getting confrontational or argumentative',
      'Not having documentation ready',
      'Not knowing code requirements',
      'Burning bridges with adjuster',
      'Not documenting disagreements',
    ],
    coachingTips: [
      'Stay professional and collaborative',
      'Lead with facts and documentation',
      'Reference specific code sections',
      'Use industry standards (HAAG, etc.)',
      'Know when to request reinspection or supervisor',
      'Maintain relationship - you\'ll work together again',
    ],
    estimatedDuration: 15,
  },
  {
    id: 'advanced-budget-constraints',
    title: 'Severe Budget Constraints - Essential vs. Optional',
    difficulty: 'advanced',
    character: 'homeowner',
    characterName: 'Carol Stevens',
    characterBackground: 'Fixed income, truly cannot afford deductible, needs help prioritizing',
    objective: 'Help homeowner make difficult decisions with empathy and expertise',
    successCriteria: [
      'Separate essential from optional work',
      'Present phased approach options',
      'Explore all financial options',
      'Maintain dignity and respect',
      'Provide solutions, not judgment',
      'Ensure safety is prioritized',
    ],
    openingLine: "I'm on a fixed income and I honestly can't afford the deductible right now. Is there any way to do just the bare minimum? What absolutely has to be done?",
    responsePatterns: [
      {
        trigger: 'essential|required|minimum',
        response: "Thank you for being understanding. So if we just do the essential work, how long will that last? I can't afford to do this again in a year.",
        emotionalState: 'concerned',
        continuesScenario: true,
      },
      {
        trigger: 'financing|payment|help',
        response: "I tried for financing but my credit isn't good enough. Are there any other options? Programs or assistance?",
        emotionalState: 'concerned',
        continuesScenario: true,
      },
      {
        trigger: 'phase|later|priority',
        response: "That makes sense - fix what's critical now and plan for the rest later. What happens if I can't afford the rest for a while?",
        emotionalState: 'interested',
        continuesScenario: true,
      },
    ],
    commonMistakes: [
      'Being judgmental about financial situation',
      'Pushing them beyond their means',
      'Not offering creative solutions',
      'Failing to prioritize properly',
      'Making them feel bad about constraints',
    ],
    coachingTips: [
      'Treat with utmost dignity and respect',
      'Truly separate needs from wants',
      'Explore ALL options (payment plans, programs, phasing)',
      'Be creative in finding solutions',
      'Ensure safety is never compromised',
      'Follow up and support them through process',
    ],
    estimatedDuration: 12,
  },
  {
    id: 'advanced-multiple-objections',
    title: 'Multiple Stacked Objections',
    difficulty: 'advanced',
    character: 'skeptical-homeowner',
    characterName: 'Richard Foster',
    characterBackground: 'Highly skeptical, had bad experience before, throws multiple objections',
    objective: 'Address objections systematically while building trust',
    successCriteria: [
      'Stay calm under pressure',
      'Address each objection individually',
      'Find root concern behind objections',
      'Build credibility through responses',
      'Turn skepticism into trust',
    ],
    openingLine: "Look, I've dealt with contractors before and got burned. Your price is high, your timeline seems optimistic, and I don't know if I can trust your company. Why should I work with you?",
    responsePatterns: [
      {
        trigger: 'experience|burned|trust',
        response: "That's what the last guy said too, and he disappeared halfway through the job. How do I know you're different?",
        emotionalState: 'defensive',
        continuesScenario: true,
      },
      {
        trigger: 'guarantee|warranty|protection',
        response: "Warranties are only good if the company is still around to honor them. How long have you been in business? References?",
        emotionalState: 'interested',
        continuesScenario: true,
      },
      {
        trigger: 'price|value|quality',
        response: "Everyone says they offer quality, but the last contractor used cheap materials and charged premium prices. How do I verify anything you're saying?",
        emotionalState: 'defensive',
        continuesScenario: true,
      },
    ],
    commonMistakes: [
      'Getting defensive or frustrated',
      'Trying to address everything at once',
      'Not identifying root concern (broken trust)',
      'Taking objections personally',
      'Not providing verifiable proof',
    ],
    coachingTips: [
      'Acknowledge their past experience with empathy',
      'Find the root concern (usually trust)',
      'Address objections one at a time',
      'Provide verifiable evidence (references, reviews, etc.)',
      'Show, don\'t just tell',
      'Build trust through transparency and patience',
    ],
    estimatedDuration: 15,
  },
  {
    id: 'advanced-code-violation-discovery',
    title: 'Existing Code Violations Found',
    difficulty: 'advanced',
    character: 'homeowner',
    characterName: 'Angela Martinez',
    characterBackground: 'Previous roof done unpermitted, violations discovered, worried about costs',
    objective: 'Explain code violations and solutions without alarming homeowner',
    successCriteria: [
      'Explain violations clearly and calmly',
      'Present solutions and costs',
      'Discuss permit and insurance implications',
      'Offer phased or bundled approach',
      'Maintain homeowner confidence',
    ],
    openingLine: "You're telling me the previous roof wasn't done to code? What does that mean for me? Am I in trouble? How much is this going to cost?",
    responsePatterns: [
      {
        trigger: 'permit|legal|violation',
        response: "Oh my god, I bought this house two years ago. I had no idea. Can I get in legal trouble for this? What about selling later?",
        emotionalState: 'concerned',
        continuesScenario: true,
      },
      {
        trigger: 'fix|correct|bring up to code',
        response: "How much more are we talking to fix these violations? This is already more than I budgeted for.",
        emotionalState: 'frustrated',
        continuesScenario: true,
      },
      {
        trigger: 'insurance|claim|coverage',
        response: "Will insurance cover bringing it up to code, or is that on me? This seems unfair - I didn't cause this problem.",
        emotionalState: 'defensive',
        continuesScenario: true,
      },
    ],
    commonMistakes: [
      'Alarming homeowner unnecessarily',
      'Not explaining violations clearly',
      'Failing to provide cost breakdown',
      'Not addressing insurance implications',
      'Making homeowner feel at fault',
    ],
    coachingTips: [
      'Stay calm and reassuring',
      'Explain this is common with older/unpermitted work',
      'Clearly separate violation fixes from roof replacement',
      'Discuss insurance coverage realistically',
      'Show this is an opportunity to do it right',
      'Provide solutions, not just problems',
    ],
    estimatedDuration: 14,
  },
];

/**
 * All scenarios combined
 */
export const allRoleplayScenarios: RoleplayScenario[] = [
  ...beginnerScenarios,
  ...intermediateScenarios,
  ...advancedScenarios,
];

/**
 * Get scenarios by difficulty
 */
export function getScenariosByDifficulty(difficulty: DifficultyLevel): RoleplayScenario[] {
  return allRoleplayScenarios.filter((s) => s.difficulty === difficulty);
}

/**
 * Get scenario by ID
 */
export function getScenarioById(id: string): RoleplayScenario | undefined {
  return allRoleplayScenarios.find((s) => s.id === id);
}

/**
 * Get scenarios by character type
 */
export function getScenariosByCharacter(character: CharacterType): RoleplayScenario[] {
  return allRoleplayScenarios.filter((s) => s.character === character);
}

/**
 * Get recommended next scenario based on performance
 */
export function getRecommendedScenario(
  completedScenarios: string[],
  averageScore: number
): RoleplayScenario | null {
  // If beginner (score < 60 or few completed), suggest beginner scenarios
  if (averageScore < 60 || completedScenarios.length < 3) {
    const beginnerNotCompleted = beginnerScenarios.filter(
      (s) => !completedScenarios.includes(s.id)
    );
    return beginnerNotCompleted[0] || null;
  }

  // If intermediate (score 60-80), suggest intermediate scenarios
  if (averageScore >= 60 && averageScore < 80) {
    const intermediateNotCompleted = intermediateScenarios.filter(
      (s) => !completedScenarios.includes(s.id)
    );
    return intermediateNotCompleted[0] || null;
  }

  // If advanced (score >= 80), suggest advanced scenarios
  const advancedNotCompleted = advancedScenarios.filter(
    (s) => !completedScenarios.includes(s.id)
  );
  return advancedNotCompleted[0] || null;
}

/**
 * Calculate scenario score based on criteria met
 */
export function calculateScenarioScore(
  scenario: RoleplayScenario,
  criteriaMet: number
): number {
  const totalCriteria = scenario.successCriteria.length;
  return Math.round((criteriaMet / totalCriteria) * 100);
}

/**
 * Generate feedback based on score
 */
export function generateScoreFeedback(score: number): string {
  if (score >= 90) return 'Excellent! You mastered this scenario.';
  if (score >= 75) return 'Great job! Strong performance with room for minor improvements.';
  if (score >= 60) return 'Good work! Solid foundation with some areas to develop.';
  if (score >= 40) return 'Decent effort! Focus on the key criteria for improvement.';
  return 'Keep practicing! Review the coaching tips and try again.';
}

/**
 * Get difficulty emoji
 */
export function getDifficultyEmoji(difficulty: DifficultyLevel): string {
  const emojis = {
    beginner: '🟢',
    intermediate: '🟡',
    advanced: '🔴',
  };
  return emojis[difficulty];
}

/**
 * Get character emoji
 */
export function getCharacterEmoji(character: CharacterType): string {
  const emojis = {
    homeowner: '🏠',
    adjuster: '📋',
    contractor: '🔨',
    'skeptical-homeowner': '🤨',
  };
  return emojis[character];
}
