export type AudienceSegment =
  | 'office_worker'
  | 'senior'
  | 'runner'
  | 'bodybuilding'
  | 'golf'
  | 'pain_recovery'
  | 'general_wellness'
  | 'southside_parent'
  | 'healthcare_worker';

export interface Provenance {
  record_id: string;
  source_name: string;
  record_url: string;
  source_timestamp: string;
  retrieval_timestamp: string;
  freshness_score: number;
  confidence_score: number;
}

export interface SourceRecord extends Provenance {
  record_type: string;
  source_kind: string;
  priority: 1 | 2 | 3 | 4 | 5 | 6;
  decision: 'accepted' | 'rejected' | 'conflict_rejected';
  rejection_reason: string | null;
  [key: string]: unknown;
}

export interface WeatherContext {
  status: 'verified' | 'unavailable' | 'rejected';
  record_id: string | null;
  conditions: string;
  temperature_c: number | null;
  humidity_percent: number | null;
  warnings: string[];
  rain_risk: string;
  thunderstorm_risk: string;
  heat_risk: string;
  cold_risk: string;
  source_name: string;
  source_timestamp: string;
  retrieval_timestamp: string;
  source_url: string;
  freshness_score: number;
  confidence_score: number;
  rejection_reason: string | null;
}

export interface ContextItem {
  id: string;
  title: string;
  summary: string;
  audience_segments: AudienceSegment[];
  provenance: Provenance;
  [key: string]: unknown;
}

export interface TopicCandidate {
  id: string;
  type: string;
  title: string;
  summary: string;
  score: number;
  audience_segments: AudienceSegment[];
  source_record_id: string;
  record_url: string;
}

export interface DailyContextRecord {
  schema_version: '1.0';
  date: string;
  timezone: 'Asia/Hong_Kong';
  generated_at: string;
  source_records: SourceRecord[];
  weather: WeatherContext;
  top_news: ContextItem[];
  multimedia_hits: ContextItem[];
  transport: ContextItem[];
  southside: ContextItem[];
  special_events: ContextItem[];
  holiday: ContextItem | null;
  audience_segments: AudienceSegment[];
  recommended_topics: string[];
  avoid_topics: string[];
  topic_candidates: TopicCandidate[];
  validation: {
    stale_items_rejected: Record<string, unknown>[];
    conflicts_rejected: Record<string, unknown>[];
    missing_fields: string[];
    status: 'pass' | 'partial' | 'fail';
  };
}
