/** Tipe data yang dikembalikan API Laravel (/api/v1). Selaras dengan App\Http\Resources. */

export type Role = "MABA" | "MENTOR" | "PANITIA" | "ADMIN";

export interface Faculty {
  id: number;
  code: string;
  name: string;
  name_en?: string;
  description?: string;
  study_programs?: StudyProgram[];
  study_programs_count?: number;
}

export interface StudyProgram {
  id: number;
  code: string;
  name: string;
  degree: "S1" | "D3" | "S2";
  faculty_id: number;
  accreditation?: string | null;
}

export interface Group {
  id: number;
  code: string;
  name: string;
  batch: number | null;
  faculty?: Pick<Faculty, "id" | "code" | "name"> | null;
  mentor?: Pick<User, "id" | "name" | "phone"> | null;
  members_count?: number;
  points?: number;
}

export interface User {
  id: number;
  nim: string | null;
  name: string;
  email: string;
  role: Role;
  gender: "L" | "P" | null;
  phone?: string | null;
  batch: number | null;
  points: number;
  accessibility_needs?: string | null;
  faculty?: Pick<Faculty, "id" | "code" | "name"> | null;
  study_program?: Pick<StudyProgram, "id" | "name" | "degree"> | null;
  group?: Group | null;
}

export type SessionType = "PRE" | "UNIVERSITAS" | "FAKULTAS" | "PRODI";
export type SessionMode = "ONLINE" | "OFFLINE";

export interface PkkmbSession {
  id: number;
  title: string;
  description: string | null;
  type: SessionType;
  mode: SessionMode;
  batch: number | null;
  faculty?: Pick<Faculty, "id" | "code" | "name"> | null;
  day_number: number;
  starts_at: string;
  ends_at: string;
  location: string | null;
  attendance_open: boolean;
  points: number;
  attended?: boolean;
}

export interface Announcement {
  id: number;
  title: string;
  body: string;
  category: string;
  audience: "ALL" | "MABA" | "MENTOR" | "GROUP" | "FACULTY";
  is_pinned: boolean;
  published_at: string;
  author?: { name: string } | null;
}

export interface Faq { id: number; question: string; answer: string; category: string }
export interface Organization { id: number; name: string; category: string; description: string; instagram: string | null }
export interface GalleryItem { id: number; title: string; image_url: string; caption: string | null; taken_at: string | null }
export interface CampusPlace { id: number; name: string; category: string; description: string; latitude: number; longitude: number }

export interface Assignment {
  id: number;
  title: string;
  description: string;
  type: "FILE" | "LINK" | "TEXT";
  due_at: string;
  max_score: number;
  points: number;
  is_required: boolean;
  submission?: Submission | null;
}

export interface Submission {
  id: number;
  assignment_id: number;
  status: "SUBMITTED" | "GRADED" | "REVISION";
  score: number | null;
  feedback: string | null;
  file_url: string | null;
  url: string | null;
  text: string | null;
  submitted_at: string;
  graded_at: string | null;
  user?: Pick<User, "id" | "name" | "nim">;
  assignment?: Pick<Assignment, "id" | "title" | "max_score">;
}

export interface Material {
  id: number;
  title: string;
  description: string | null;
  type: "PDF" | "VIDEO" | "LINK";
  url: string | null;
  file_url: string | null;
  quiz?: { id: number; title: string; pass_score: number; points: number; best_score: number | null } | null;
}

export interface QuizQuestion { id: number; question: string; options: string[] }

export interface Badge { id: number; code: string; name: string; description: string; icon: string; points: number; awarded_at?: string | null }
export interface Mission { id: number; title: string; description: string; points: number; completed: boolean }

export interface Ticket {
  id: number;
  code: string;
  category: "BANTUAN" | "PENGADUAN" | "KEKERASAN";
  subject: string;
  body: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  is_anonymous: boolean;
  created_at: string;
  replies?: { id: number; body: string; is_staff: boolean; created_at: string }[];
}

export interface PublicSettings {
  theme_title: string;
  theme_tagline: string;
  year: number;
  event_start: string;
  event_end: string;
  teaser_video_url: string | null;
  hotline_whatsapp: string;
  hotline_email: string;
  instagram: string;
  virtual_tour_url: string | null;
}

export interface PublicStats { maba: number; faculties: number; study_programs: number; groups: number; organizations: number }

export interface Paginated<T> { data: T[]; meta?: { current_page: number; last_page: number; total: number } }
