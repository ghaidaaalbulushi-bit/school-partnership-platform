-- ============================================================================
-- منصة توثيق الشراكة المدرسية — مدرسة أسماء بنت النعمان (1-8)
-- Migration 0001: Core schema
-- ============================================================================
-- Run these migrations in order against your Supabase project, either via
-- the Supabase CLI (`supabase db push`) or by pasting each file, in order,
-- into the SQL editor at app.supabase.com.
-- ============================================================================

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ----------------------------------------------------------------------------
-- Helper: updated_at trigger
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ----------------------------------------------------------------------------
-- site_settings — singleton row holding school identity + global config
-- ----------------------------------------------------------------------------
create table site_settings (
  id int primary key default 1,
  school_name text not null default 'مدرسة أسماء بنت النعمان (1-8)',
  platform_name text not null default 'منصة توثيق الشراكة المدرسية',
  principal_name text not null default 'أ. وفاء الفارسية',
  principal_title text not null default 'مديرة المدرسة',
  vice_principal_name text not null default 'أ. سميرة الفلاحية',
  vice_principal_title text not null default 'مساعدة المديرة',
  vision_text text not null default 'جيل مبدع تحصيليًا متسلح بالأخلاق والقيم ومواكب للتطورات التكنولوجية.',
  mission_text text not null default 'تسعى المدرسة إلى إعداد جيل قادر على التنافس والتميز والإبداع في التحصيل والتكنولوجيا والنشاط، بالقيم والأخلاق، من خلال تأهيل كادر تعليمي يعمل بروح الفريق الواحد في بيئة تربوية تعليمية تنافسية صحية وبمشاركة مجتمعية للمساهمة في بناء وطن يفخر بإنجازات أبنائه.',
  hero_title text not null default 'مرحبًا بكم في منصة توثيق الشراكة المدرسية',
  hero_subtitle text not null default 'مدرسة أسماء بنت النعمان (1-8)',
  hero_tagline text not null default 'معًا نصنع شراكة فاعلة لمستقبل أبنائنا',
  hero_cta_primary_label text not null default 'استكشف مؤشرات الشراكة',
  hero_cta_primary_href text not null default '/indicators',
  hero_cta_secondary_label text not null default 'تصفح المبادرات',
  hero_cta_secondary_href text not null default '/initiatives',
  logo_storage_path text, -- path inside `public-assets` bucket; null = use default shipped logo
  contact_email text,
  contact_phone text,
  contact_address text,
  footer_text text,
  ai_enabled boolean not null default false, -- flips true once ANTHROPIC_API_KEY is confirmed working
  file_download_enabled boolean not null default true,
  file_print_enabled boolean not null default true,
  presentation_mode_enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);
insert into site_settings (id) values (1);

create trigger trg_site_settings_updated
before update on site_settings
for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- nav_items — editable main navigation menu
-- ----------------------------------------------------------------------------
create table nav_items (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  opens_new_tab boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_nav_items_updated before update on nav_items for each row execute function set_updated_at();

insert into nav_items (label, href, sort_order) values
  ('الرئيسية', '/', 1),
  ('عن الشراكة', '/about', 2),
  ('المؤشرات والمعايير', '/indicators', 3),
  ('المبادرات والفعاليات', '/initiatives', 4),
  ('الشواهد والأدلة', '/evidence', 5),
  ('تواصل معنا', '/contact', 6);

-- ----------------------------------------------------------------------------
-- admin_roles — text cards for school administration section (no photos)
-- ----------------------------------------------------------------------------
create table admin_roles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  job_title text not null,
  icon text default 'UserRound', -- lucide-react icon name
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_admin_roles_updated before update on admin_roles for each row execute function set_updated_at();

insert into admin_roles (full_name, job_title, icon, sort_order) values
  ('أ. وفاء الفارسية', 'مديرة المدرسة', 'UserRound', 1),
  ('أ. سميرة الفلاحية', 'مساعدة المديرة', 'UserRound', 2);

-- ----------------------------------------------------------------------------
-- indicators — the three top-level standards/indicators
-- ----------------------------------------------------------------------------
create table indicators (
  id uuid primary key default gen_random_uuid(),
  code text, -- e.g. '5.4.1' — nullable; do not invent one if unknown
  standard_name text not null, -- المعيار
  title text not null, -- short card title
  description text not null,
  icon text default 'Users',
  color_theme text default 'sky', -- maps to a palette family for the card
  sort_order int not null default 0,
  status text not null default 'published' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_indicators_updated before update on indicators for each row execute function set_updated_at();

insert into indicators (code, standard_name, title, description, icon, color_theme, sort_order) values
(
  '5.4.1',
  'الشراكة مع أولياء الأمور',
  'الشراكة مع أولياء الأمور',
  'تعزز قيادة المدرسة بصورة فاعلة بيئة مدرسية مرحبة بأولياء الأمور، وتتيح لهم فرصًا متنوعة للمشاركة في الحياة المدرسية ودعم تعلم أبنائهم، كما يتضح من تفعيل مبادرة "مرسى الرفاد"، وتنفيذ برامج الشراكة المجتمعية، وتفعيل مجلس أولياء الأمور، وتوظيف قنوات التواصل، والسجلات، والاستمارات؛ مما أسهم بصورة ملفتة في تعزيز التواصل والتعاون بين المدرسة والأسرة.',
  'Users',
  'sky',
  1
),
(
  '5.4.2',
  'تمكين أولياء الأمور من دعم تعلم أبنائهم',
  'تمكين أولياء الأمور من دعم تعلم أبنائهم',
  'تفعّل قيادة المدرسة قنوات متنوعة وفاعلة لتزويد أولياء الأمور بالمعلومات المتعلقة بتعلم أبنائهم وتقدمهم الدراسي، كما يتضح من خلال الملتقيات، والمنصات التعليمية، وقنوات المتابعة، والمبادرات؛ مما أسهم بصورة فاعلة في تعزيز إطلاع أولياء الأمور على مستويات أبنائهم ودعم متابعتهم لتعلمهم وتقدمهم الدراسي.',
  'GraduationCap',
  'mint',
  2
),
(
  null,
  'الشراكة مع مؤسسات المجتمع',
  'الشراكة مع مؤسسات المجتمع',
  'تفعّل قيادة المدرسة قنوات التواصل مع مؤسسات المجتمع بصورة جيدة من خلال الخطط والبرامج والفعاليات والمبادرات، وتوظيف الاستمارات والسجلات في تنظيم الشراكات المجتمعية ومتابعتها بشكل فاعل، مما يسهم في الارتقاء بالحياة المدرسية ودعم نواتج التعلم.',
  'Building2',
  'peach',
  3
);

-- ----------------------------------------------------------------------------
-- sections — recursive tree of sections/sub-sections under an indicator
-- (supports arbitrary nesting: section -> sub-section -> sub-sub-section...)
-- ----------------------------------------------------------------------------
create table sections (
  id uuid primary key default gen_random_uuid(),
  indicator_id uuid not null references indicators(id) on delete cascade,
  parent_section_id uuid references sections(id) on delete cascade,
  title text not null,
  description text,
  icon text default 'FolderOpen',
  sort_order int not null default 0,
  status text not null default 'published' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_sections_indicator on sections(indicator_id);
create index idx_sections_parent on sections(parent_section_id);
create trigger trg_sections_updated before update on sections for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- section_blocks — flexible content blocks within a section (rich text,
-- tables). Images/videos/files/links are separate tables (below) so they can
-- also be queried/managed independently (galleries, "all files" admin view).
-- ----------------------------------------------------------------------------
create table section_blocks (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references sections(id) on delete cascade,
  block_type text not null check (block_type in ('rich_text','table')),
  content jsonb not null default '{}'::jsonb, -- rich_text: {html}; table: {headers:[], rows:[[]]}
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_section_blocks_section on section_blocks(section_id);
create trigger trg_section_blocks_updated before update on section_blocks for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- media_files — all uploaded files (images/video/pdf/docx/other), the single
-- source of truth for anything in Supabase Storage.
-- ----------------------------------------------------------------------------
create table media_files (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  storage_bucket text not null default 'media',
  storage_path text not null, -- path within bucket
  mime_type text not null,
  file_type text not null check (file_type in ('image','video','pdf','document','other')),
  file_size_bytes bigint not null,
  preview_pdf_path text, -- for .docx: generated PDF preview path, if created
  alt_text text,
  caption text,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index idx_media_files_type on media_files(file_type);

-- ----------------------------------------------------------------------------
-- evidence — a "shaheed"/evidence item attached to a section, wrapping one
-- media_file. Kept distinct from media_files so the same uploaded file can
-- appear as evidence in multiple sections/indicators without re-uploading.
-- ----------------------------------------------------------------------------
create table evidence (
  id uuid primary key default gen_random_uuid(),
  section_id uuid references sections(id) on delete cascade,
  media_file_id uuid not null references media_files(id) on delete cascade,
  title text,
  description text,
  sort_order int not null default 0,
  allow_download boolean not null default true,
  allow_print boolean not null default true,
  status text not null default 'published' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_evidence_section on evidence(section_id);
create trigger trg_evidence_updated before update on evidence for each row execute function set_updated_at();

-- Many-to-many: one evidence item can support more than one indicator
create table evidence_indicators (
  evidence_id uuid not null references evidence(id) on delete cascade,
  indicator_id uuid not null references indicators(id) on delete cascade,
  primary key (evidence_id, indicator_id)
);

-- ----------------------------------------------------------------------------
-- links — URL links attached to a section
-- ----------------------------------------------------------------------------
create table links (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references sections(id) on delete cascade,
  title text not null,
  description text,
  url text not null,
  icon text default 'Link',
  opens_new_tab boolean not null default true,
  sort_order int not null default 0,
  status text not null default 'published' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint links_safe_protocol check (url ~* '^(https?)://')
);
create index idx_links_section on links(section_id);
create trigger trg_links_updated before update on links for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- initiatives — initiatives / events / visits / meetings
-- ----------------------------------------------------------------------------
create table initiatives (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  execution_date date,
  location text,
  target_group text,
  participating_parties text,
  goals text,
  execution_mechanism text,
  results text,
  impact_measurement text,
  recommendations text,
  cover_icon text default 'Sparkles',
  status text not null default 'published' check (status in ('draft','published')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_initiatives_updated before update on initiatives for each row execute function set_updated_at();

create table initiative_indicators (
  initiative_id uuid not null references initiatives(id) on delete cascade,
  indicator_id uuid not null references indicators(id) on delete cascade,
  primary key (initiative_id, indicator_id)
);

create table initiative_media (
  initiative_id uuid not null references initiatives(id) on delete cascade,
  media_file_id uuid not null references media_files(id) on delete cascade,
  sort_order int not null default 0,
  primary key (initiative_id, media_file_id)
);

create table initiative_links (
  id uuid primary key default gen_random_uuid(),
  initiative_id uuid not null references initiatives(id) on delete cascade,
  title text not null,
  url text not null,
  sort_order int not null default 0,
  constraint initiative_links_safe_protocol check (url ~* '^(https?)://')
);

-- ----------------------------------------------------------------------------
-- reports — AI-assisted or manually written documentation reports
-- ----------------------------------------------------------------------------
create table reports (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  introduction text,
  initiative_description text,
  goals text,
  target_group text,
  participating_parties text,
  execution_mechanism text,
  results_achievements text,
  impact_measurement text,
  recommendations text,
  source_initiative_id uuid references initiatives(id) on delete set null,
  generated_by_ai boolean not null default false,
  ai_generation_notes text, -- what info was missing / assumptions avoided
  status text not null default 'draft' check (status in ('draft','published')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_reports_updated before update on reports for each row execute function set_updated_at();

create table report_indicators (
  report_id uuid not null references reports(id) on delete cascade,
  indicator_id uuid not null references indicators(id) on delete cascade,
  primary key (report_id, indicator_id)
);

-- ----------------------------------------------------------------------------
-- ai_analyses — results of AI document classification for uploaded PDFs
-- ----------------------------------------------------------------------------
create table ai_analyses (
  id uuid primary key default gen_random_uuid(),
  media_file_id uuid not null references media_files(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','processing','completed','failed')),
  extracted_text text,
  used_ocr boolean not null default false,
  document_type text, -- AI-guessed type, e.g. "محضر اجتماع"
  summary text,
  key_info jsonb, -- structured extracted facts
  suggested_indicator_ids uuid[], -- can suggest more than one
  suggested_section_id uuid references sections(id) on delete set null,
  classification_reasoning text,
  possible_duplicate_of uuid references media_files(id) on delete set null,
  duplicate_similarity_score numeric,
  manual_override jsonb, -- admin's corrected classification, if any
  approved boolean not null default false,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_ai_analyses_media on ai_analyses(media_file_id);
create trigger trg_ai_analyses_updated before update on ai_analyses for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- theme_settings — singleton row for the no-code design editor
-- ----------------------------------------------------------------------------
create table theme_settings (
  id int primary key default 1,
  colors jsonb not null default '{
    "sky500": "#0ea5e9", "navy700": "#16304d", "cream50": "#fdfbf5",
    "mint500": "#22c55e", "gold500": "#f59e0b", "peach300": "#ffb997", "rose300": "#fda4b8"
  }'::jsonb,
  font_scale text not null default 'md' check (font_scale in ('sm','md','lg')),
  card_style text not null default 'rounded-soft' check (card_style in ('rounded-soft','rounded-sharp','flat')),
  home_sections_order text[] not null default array['hero','vision_mission','administration','indicators','initiatives_preview','cta'],
  home_sections_visibility jsonb not null default '{
    "hero": true, "vision_mission": true, "administration": true,
    "indicators": true, "initiatives_preview": true, "cta": true
  }'::jsonb,
  reduced_motion_respect boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);
insert into theme_settings (id) values (1);
create trigger trg_theme_settings_updated before update on theme_settings for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- audit_logs — change history for admin actions
-- ----------------------------------------------------------------------------
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  actor_email text,
  action text not null, -- 'create' | 'update' | 'delete' | 'publish' | 'unpublish' | 'login' | 'logout'
  entity_type text not null, -- table name, e.g. 'indicators'
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);
create index idx_audit_logs_entity on audit_logs(entity_type, entity_id);
create index idx_audit_logs_created on audit_logs(created_at desc);

-- ----------------------------------------------------------------------------
-- content_revisions — generic version history for text-bearing records,
-- enabling "restore previous version" from the admin panel.
-- ----------------------------------------------------------------------------
create table content_revisions (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  snapshot jsonb not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index idx_content_revisions_entity on content_revisions(entity_type, entity_id, created_at desc);
