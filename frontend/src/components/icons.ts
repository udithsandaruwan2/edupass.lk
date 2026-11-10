import {
  Atom, BookOpen, Calculator, Code2, Dna, FileText, FlaskConical, Globe2, Landmark,
  Languages, RefreshCcw, School, Sigma, Target, TrendingUp, type LucideIcon,
} from 'lucide-react';

/** Category icons are stored by name in data so they can be edited by admins. */
export const CATEGORY_ICONS: Record<string, LucideIcon> = { RefreshCcw, BookOpen, FileText, Target, School, FlaskConical, Globe2 };

export const categoryIcon = (name: string): LucideIcon => CATEGORY_ICONS[name] ?? BookOpen;

const SUBJECT_ICONS: Record<string, LucideIcon> = {
  Economics: TrendingUp,
  'Business Studies': Landmark,
  Accounting: Calculator,
  'Combined Maths': Sigma,
  Mathematics: Sigma,
  Physics: Atom,
  Chemistry: FlaskConical,
  Biology: Dna,
  English: Languages,
  ICT: Code2,
};

export const subjectIcon = (subject: string): LucideIcon => SUBJECT_ICONS[subject] ?? BookOpen;
