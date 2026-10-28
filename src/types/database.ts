// Hand-written types matching supabase/migrations/*.sql.
//
// NOTE FOR LATER: once you have a live Supabase project, you can regenerate
// this file automatically and more precisely with:
//   npx supabase gen types typescript --project-id <your-project-id> > src/types/database.ts
// That command needs network + your Supabase project — not available in the
// environment this file was authored in, so it was written by hand to match
// the migrations exactly. Regenerate it once the project is live, review the
// diff, and keep any custom helper types below.

export type Status = 'draft' | 'published';
export type FileType = 'image' | 'video' | 'pdf' | 'document' | 'other';
export type AiAnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface SiteSettings {
  id: 1;
  school_name: string;
  platform_name: string;
  principal_name: string;
  principal_title: string;
  vice_principal_name: string;
  vice_principal_title: string;
  vision_text: string;
  mission_text: string;
  hero_title: string;
  hero_subtitle: string;
  hero_tagline: string;
  hero_cta_primary_label: string;
  hero_cta_primary_href: string;
  hero_cta_secondary_label: string;
  hero_cta_secondary_href: string;
  logo_storage_path: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  footer_text: string | null;
  ai_enabled: boolean;
  file_download_enabled: boolean;
  file_print_enabled: boolean;
  presentation_mode_enabled: boolean;
  updated_at: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  sort_order: number;
  is_visible: boolean;
  opens_new_tab: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminRole {
  id: string;
  full_name: string;
  job_title: string;
  icon: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Indicator {
  id: string;
  code: string | null;
  standard_name: string;
  title: string;
  description: string;
  icon: string | null;
  color_theme: string | null;
  sort_order: number;
  status: Status;
  created_at: string;
  updated_at: string;
}

export interface SectionRow {
  id: string;
  indicator_id: string;
  parent_section_id: string | null;
  title: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  status: Status;
  created_at: string;
  updated_at: string;
}

/** A section with its children nested, for rendering the tree. */
export interface SectionTreeNode extends SectionRow {
  children: SectionTreeNode[];
}

export interface SectionBlock {
  id: string;
  section_id: string;
  block_type: 'rich_text' | 'table';
  content: { html?: string; headers?: string[]; rows?: string[][] };
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MediaFile {
  id: string;
  file_name: string;
  storage_bucket: string;
  storage_path: string;
  mime_type: string;
  file_type: FileType;
  file_size_bytes: number;
  preview_pdf_path: string | null;
  alt_text: string | null;
  caption: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface Evidence {
  id: string;
  section_id: string | null;
  media_file_id: string;
  title: string | null;
  description: string | null;
  sort_order: number;
  allow_download: boolean;
  allow_print: boolean;
  status: Status;
  created_at: string;
  updated_at: string;
  // joined
  media_file?: MediaFile;
  indicator_ids?: string[];
}

export interface LinkItem {
  id: string;
  section_id: string;
  title: string;
  description: string | null;
  url: string;
  icon: string | null;
  opens_new_tab: boolean;
  sort_order: number;
  status: Status;
  created_at: string;
  updated_at: string;
}

export interface Initiative {
  id: string;
  title: string;
  description: string | null;
  execution_date: string | null;
  location: string | null;
  target_group: string | null;
  participating_parties: string | null;
  goals: string | null;
  execution_mechanism: string | null;
  results: string | null;
  impact_measurement: string | null;
  recommendations: string | null;
  cover_icon: string | null;
  status: Status;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // joined
  indicator_ids?: string[];
  media?: MediaFile[];
  links?: { id: string; title: string; url: string }[];
}

export interface ReportRow {
  id: string;
  title: string;
  introduction: string | null;
  initiative_description: string | null;
  goals: string | null;
  target_group: string | null;
  participating_parties: string | null;
  execution_mechanism: string | null;
  results_achievements: string | null;
  impact_measurement: string | null;
  recommendations: string | null;
  source_initiative_id: string | null;
  generated_by_ai: boolean;
  ai_generation_notes: string | null;
  status: Status;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  indicator_ids?: string[];
}

export interface AiAnalysis {
  id: string;
  media_file_id: string;
  status: AiAnalysisStatus;
  extracted_text: string | null;
  used_ocr: boolean;
  document_type: string | null;
  summary: string | null;
  key_info: Record<string, unknown> | null;
  suggested_indicator_ids: string[] | null;
  suggested_section_id: string | null;
  classification_reasoning: string | null;
  possible_duplicate_of: string | null;
  duplicate_similarity_score: number | null;
  manual_override: Record<string, unknown> | null;
  approved: boolean;
  approved_by: string | null;
  approved_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface ThemeSettings {
  id: 1;
  colors: Record<string, string>;
  font_scale: 'sm' | 'md' | 'lg';
  card_style: 'rounded-soft' | 'rounded-sharp' | 'flat';
  home_sections_order: string[];
  home_sections_visibility: Record<string, boolean>;
  reduced_motion_respect: boolean;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  created_at: string;
}

// Minimal Supabase `Database` generic shape, enough for createBrowserClient /
// createServerClient typing. Expand with Insert/Update variants as the admin
// forms are built out.
export interface Database {
  public: {
    Tables: {
      site_settings: { Row: SiteSettings; Insert: Partial<SiteSettings>; Update: Partial<SiteSettings> };
      nav_items: { Row: NavItem; Insert: Partial<NavItem>; Update: Partial<NavItem> };
      admin_roles: { Row: AdminRole; Insert: Partial<AdminRole>; Update: Partial<AdminRole> };
      indicators: { Row: Indicator; Insert: Partial<Indicator>; Update: Partial<Indicator> };
      sections: { Row: SectionRow; Insert: Partial<SectionRow>; Update: Partial<SectionRow> };
      section_blocks: { Row: SectionBlock; Insert: Partial<SectionBlock>; Update: Partial<SectionBlock> };
      media_files: { Row: MediaFile; Insert: Partial<MediaFile>; Update: Partial<MediaFile> };
      evidence: { Row: Evidence; Insert: Partial<Evidence>; Update: Partial<Evidence> };
      links: { Row: LinkItem; Insert: Partial<LinkItem>; Update: Partial<LinkItem> };
      initiatives: { Row: Initiative; Insert: Partial<Initiative>; Update: Partial<Initiative> };
      reports: { Row: ReportRow; Insert: Partial<ReportRow>; Update: Partial<ReportRow> };
      ai_analyses: { Row: AiAnalysis; Insert: Partial<AiAnalysis>; Update: Partial<AiAnalysis> };
      theme_settings: { Row: ThemeSettings; Insert: Partial<ThemeSettings>; Update: Partial<ThemeSettings> };
      audit_logs: { Row: AuditLog; Insert: Partial<AuditLog>; Update: Partial<AuditLog> };
    };
  };
}
