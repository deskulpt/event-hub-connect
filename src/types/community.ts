export type ProposalStatus =
  | "draft"
  | "voting"
  | "threshold_met"
  | "scheduled"
  | "published"
  | "expired"
  | "rejected";

export type OrgStatus = "pending" | "verified" | "suspended" | "rejected";
export type VerificationState = "unverified" | "pending" | "verified" | "rejected";
export type ReportStatus = "open" | "triaged" | "actioned" | "dismissed";
export type PerkStatus = "draft" | "pending" | "approved" | "paused" | "expired";
export type ListingStatus = "active" | "sold" | "withdrawn" | "removed";

export interface Locality {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  country: string;
  center_lat: number | null;
  center_lng: number | null;
  radius_miles: number;
  default_language: string;
  member_count: number;
  active: boolean;
}

export interface Circle {
  id: string;
  locality_id: string | null;
  organization_id: string | null;
  owner_id: string;
  name: string;
  description: string | null;
  interest_tags: string[];
  language: string;
  photo_url: string | null;
  member_count: number;
  published: boolean;
  created_at: string;
}

export interface CircleMember {
  id: string;
  circle_id: string;
  user_id: string;
  is_organizer: boolean;
}

export interface ActivityProposal {
  id: string;
  run_id: string | null;
  locality_id: string | null;
  circle_id: string | null;
  title: string;
  summary: string | null;
  category: string | null;
  language: string;
  suggested_date: string | null;
  suggested_time: string | null;
  indoor_outdoor: string | null;
  accessibility_attributes: string[];
  estimated_cost_cents: number;
  vote_threshold: number;
  vote_count: number;
  voting_opens_on: string | null;
  voting_closes_on: string | null;
  status: ProposalStatus;
  claimed_by: string | null;
  event_id: string | null;
  rationale: string | null;
  created_at: string;
}

export interface Organization {
  id: string;
  owner_id: string;
  name: string;
  kind: string;
  description: string | null;
  locality_id: string | null;
  city: string | null;
  website: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  logo_url: string | null;
  registration_number: string | null;
  status: OrgStatus;
  created_at: string;
}

export interface PerkOffer {
  id: string;
  owner_id: string;
  organization_id: string | null;
  locality_id: string | null;
  title: string;
  description: string | null;
  category: string | null;
  discount_label: string | null;
  code: string | null;
  image_url: string | null;
  terms: string | null;
  starts_on: string | null;
  ends_on: string | null;
  max_redemptions: number | null;
  redemption_count: number;
  status: PerkStatus;
  created_at: string;
}

export interface MemorabiliaListing {
  id: string;
  owner_id: string;
  locality_id: string | null;
  title: string;
  description: string | null;
  category: string | null;
  price_cents: number;
  currency: string;
  image_url: string | null;
  status: ListingStatus;
  created_at: string;
}

export interface ContentReport {
  id: string;
  reporter_id: string;
  subject_table: string;
  subject_id: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  triage_label: string | null;
  triage_confidence: number | null;
  decision: string | null;
  created_at: string;
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  label: string | null;
  description: string | null;
}

export interface AiProviderSetting {
  id: string;
  feature: string;
  primary_provider: string;
  primary_model: string;
  fallback_provider: string | null;
  fallback_model: string | null;
  enabled: boolean;
  rate_limit_per_min: number | null;
  monthly_spend_cap_cents: number | null;
  notes: string | null;
}

export interface LocalizationSetting {
  id: string;
  language_code: string;
  label: string;
  native_label: string | null;
  enabled: boolean;
  coverage_percent: number;
  is_default: boolean;
}

export interface EventGenerationRule {
  id: string;
  locality_id: string | null;
  radius_bands: number[];
  threshold_multiplier: number;
  min_threshold: number;
  voting_window_days: number;
  slate_size: number;
  auto_publish: boolean;
  enabled: boolean;
}

export interface SponsorshipPackage {
  id: string;
  name: string;
  description: string | null;
  placements: string[];
  duration_days: number;
  price_cents: number;
  currency: string;
  active: boolean;
}

export interface ProfessionalCredential {
  id: string;
  vendor_id: string;
  owner_id: string;
  kind: string;
  title: string;
  document_url: string | null;
  issued_on: string | null;
  expires_on: string | null;
  state: VerificationState;
  reviewer_note: string | null;
  created_at: string;
}

export interface CommissionRule {
  id: string;
  category: string;
  rate_percent: number;
  floor_cents: number;
  cap_cents: number | null;
  effective_from: string;
  effective_to: string | null;
}

export interface ProposalGenerationRun {
  id: string;
  locality_id: string | null;
  period: string;
  proposals_created: number;
  status: string;
  model: string | null;
  diagnostics: Record<string, unknown>;
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  org_role: string;
  created_at: string;
}

export interface ContentModerationSetting {
  id: string;
  key: string;
  value: Record<string, unknown>;
}

export interface AccessibilityPrefs {
  textScale?: "normal" | "large" | "xlarge";
  contrast?: "normal" | "high";
  readAloud?: boolean;
  reduceMotion?: boolean;
}

export const INTEREST_OPTIONS = [
  "walking",
  "yoga",
  "bhajans",
  "music",
  "cards & board games",
  "gardening",
  "book club",
  "temple visits",
  "cooking",
  "photography",
  "volunteering",
  "day trips",
  "technology help",
  "health talks",
] as const;

export const ACCESSIBILITY_ATTRIBUTES = [
  "step-free access",
  "seating available",
  "restrooms nearby",
  "short walking distance",
  "wheelchair accessible",
  "hearing loop",
  "shade / indoors",
  "companion welcome",
] as const;
