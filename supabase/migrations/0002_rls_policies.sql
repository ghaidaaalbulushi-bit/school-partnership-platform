-- ============================================================================
-- Migration 0002: Row Level Security
-- Model: single authenticated admin account (created via Supabase Auth,
-- see PROJECT_HANDOFF.md §"إنشاء حساب الإدارة"). Public visitors get
-- read-only access to *published* rows only. Any authenticated user can
-- write — since this project intentionally has exactly one admin account,
-- "authenticated" is equivalent to "the admin" as long as you never create
-- a second user. If you later add staff accounts, tighten these policies
-- to check a role claim instead of just auth.role().
-- ============================================================================

-- Enable RLS everywhere
alter table site_settings enable row level security;
alter table nav_items enable row level security;
alter table admin_roles enable row level security;
alter table indicators enable row level security;
alter table sections enable row level security;
alter table section_blocks enable row level security;
alter table media_files enable row level security;
alter table evidence enable row level security;
alter table evidence_indicators enable row level security;
alter table links enable row level security;
alter table initiatives enable row level security;
alter table initiative_indicators enable row level security;
alter table initiative_media enable row level security;
alter table initiative_links enable row level security;
alter table reports enable row level security;
alter table report_indicators enable row level security;
alter table ai_analyses enable row level security;
alter table theme_settings enable row level security;
alter table audit_logs enable row level security;
alter table content_revisions enable row level security;

-- ---- site_settings: public read, admin write ----
create policy "public read site_settings" on site_settings for select using (true);
create policy "admin write site_settings" on site_settings for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---- nav_items ----
create policy "public read visible nav_items" on nav_items for select using (is_visible = true);
create policy "admin read all nav_items" on nav_items for select using (auth.role() = 'authenticated');
create policy "admin write nav_items" on nav_items for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---- admin_roles ----
create policy "public read visible admin_roles" on admin_roles for select using (is_visible = true);
create policy "admin read all admin_roles" on admin_roles for select using (auth.role() = 'authenticated');
create policy "admin write admin_roles" on admin_roles for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---- indicators ----
create policy "public read published indicators" on indicators for select using (status = 'published');
create policy "admin read all indicators" on indicators for select using (auth.role() = 'authenticated');
create policy "admin write indicators" on indicators for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---- sections ----
create policy "public read published sections" on sections for select using (status = 'published');
create policy "admin read all sections" on sections for select using (auth.role() = 'authenticated');
create policy "admin write sections" on sections for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---- section_blocks (inherits visibility from parent section's status) ----
create policy "public read blocks of published sections" on section_blocks for select
  using (exists (select 1 from sections s where s.id = section_blocks.section_id and s.status = 'published'));
create policy "admin read all section_blocks" on section_blocks for select using (auth.role() = 'authenticated');
create policy "admin write section_blocks" on section_blocks for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---- media_files: metadata readable (storage object ACLs are the real
-- gate on file bytes — see supabase/STORAGE_SETUP.md) ----
create policy "public read media_files" on media_files for select using (true);
create policy "admin write media_files" on media_files for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---- evidence ----
create policy "public read published evidence" on evidence for select using (status = 'published');
create policy "admin read all evidence" on evidence for select using (auth.role() = 'authenticated');
create policy "admin write evidence" on evidence for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public read evidence_indicators" on evidence_indicators for select using (true);
create policy "admin write evidence_indicators" on evidence_indicators for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---- links ----
create policy "public read published links" on links for select using (status = 'published');
create policy "admin read all links" on links for select using (auth.role() = 'authenticated');
create policy "admin write links" on links for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---- initiatives ----
create policy "public read published initiatives" on initiatives for select using (status = 'published');
create policy "admin read all initiatives" on initiatives for select using (auth.role() = 'authenticated');
create policy "admin write initiatives" on initiatives for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public read initiative_indicators" on initiative_indicators for select using (true);
create policy "admin write initiative_indicators" on initiative_indicators for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public read initiative_media" on initiative_media for select using (true);
create policy "admin write initiative_media" on initiative_media for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public read initiative_links" on initiative_links for select using (true);
create policy "admin write initiative_links" on initiative_links for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---- reports: published only for public; admin sees everything ----
create policy "public read published reports" on reports for select using (status = 'published');
create policy "admin read all reports" on reports for select using (auth.role() = 'authenticated');
create policy "admin write reports" on reports for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public read report_indicators of published" on report_indicators for select
  using (exists (select 1 from reports r where r.id = report_indicators.report_id and r.status = 'published'));
create policy "admin write report_indicators" on report_indicators for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---- ai_analyses: admin-only (internal classification workflow) ----
create policy "admin only ai_analyses" on ai_analyses for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---- theme_settings: public read (home page needs it), admin write ----
create policy "public read theme_settings" on theme_settings for select using (true);
create policy "admin write theme_settings" on theme_settings for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---- audit_logs & content_revisions: admin-only ----
create policy "admin only audit_logs select" on audit_logs for select using (auth.role() = 'authenticated');
create policy "admin only audit_logs insert" on audit_logs for insert with check (auth.role() = 'authenticated');

create policy "admin only content_revisions" on content_revisions for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
