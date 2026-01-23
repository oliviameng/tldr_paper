
export interface WhatIsNew {
  leap: string;
  comparison: string;
}

export interface HowItWorks {
  metaphor: string;
  logic: string;
}

export interface ProductImplications {
  userExperience: string;
  metrics: string;
  infra: string;
  teamOrg: string;
}

export interface GlossaryItem {
  term: string;
  definition: string;
}

export interface Quote {
  quote: string;
  citation: string;
}

export interface PaperSummary {
  executiveTldr: string;
  whatIsNew: WhatIsNew;
  howItWorks: HowItWorks;
  evidenceAndLimits: string;
  productImplications: ProductImplications;
  realWorldApplications: string[];
  risksAndGuardrails: string;
  glossary: GlossaryItem[];
  questionsToAsk: string[];
  citationsAndPullQuotes: Quote[];
}

export interface TrendingPaper {
  title: string;
  url: string;
  highlightSummary: string;
  publishDate: string;
  whyTrending: string;
  stats: string;
}

export interface TrendingReport {
  intro: string;
  papers: TrendingPaper[];
  notes: string;
  reportDate: string;
  groundingSources?: Array<{
    title: string;
    url: string;
  }>;
}
