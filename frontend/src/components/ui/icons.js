/**
 * Centralized Icon System for English Learning App
 * All icons imported from lucide-react for consistency
 */

import {
  // Navigation & Global
  LayoutDashboard,
  GraduationCap,
  Mic,
  Timer,
  BookOpenText,
  BookOpen,
  Tag,
  Bookmark,
  Star,
  List,
  SearchX,
  Repeat,

  // Speaking Lab - Sentence Categories
  Sun,
  Apple,
  HandHeart,
  MessageCircle,
  Briefcase,

  // Actions & Controls
  Play,
  Pause,
  Square,
  RotateCw,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Eye,
  EyeOff,

  // Content & Learning
  Quote,
  Highlighter,
  Languages,
  Volume2,
  Headphones,
  Sparkles,
  Brain,
  ListChecks,

  // Progress & Stats
  Flame,
  Trophy,
  Target,
  TrendingUp,
  Clock,
  Zap,
  BarChart3,

  // Misc
  AlertCircle,
  Info,
  X,
  Circle,
  Dot,
  Trash2,
  Lightbulb,
} from 'lucide-react';

/**
 * Centralized icon mapping
 * Usage: import { AppIcons } from '@/components/ui/icons'
 */
export const AppIcons = {
  // ===== NAVIGATION & GLOBAL =====
  dashboard: LayoutDashboard,
  lessons: GraduationCap,
  speakingLab: Mic,
  progress: Timer,
  book: BookOpenText,
  bookOpen: BookOpen,
  tag: Tag,
  bookmark: Bookmark,
  star: Star,
  list: List,
  searchX: SearchX,
  repeat: Repeat,

  // ===== SPEAKING LAB - SENTENCE TYPES =====
  sun: Sun,
  healthy: Apple,
  polite: HandHeart,
  chat: MessageCircle,
  work: Briefcase,

  // ===== ACTIONS & CONTROLS =====
  play: Play,
  pause: Pause,
  stop: Square,
  retry: RotateCw,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  check: CheckCircle2,
  eye: Eye,
  eyeOff: EyeOff,

  // ===== CONTENT & LEARNING =====
  quote: Quote,
  highlighter: Highlighter,
  languages: Languages,
  volume: Volume2,
  volume2: Volume2,
  headphones: Headphones,
  sparkles: Sparkles,
  brain: Brain,
  listChecks: ListChecks,

  // ===== PROGRESS & STATS =====
  flame: Flame,
  trophy: Trophy,
  target: Target,
  trending: TrendingUp,
  clock: Clock,
  zap: Zap,
  barChart: BarChart3,

  // ===== MISC =====
  mic: Mic,
  alert: AlertCircle,
  info: Info,
  close: X,
  x: X,
  checkCircle: CheckCircle2,
  circle: Circle,
  dot: Dot,
  trash2: Trash2,
  lightbulb: Lightbulb,
};

/**
 * Icon component props type
 */
export const IconSizes = {
  xs: 14,
  sm: 16,
  base: 18,
  lg: 20,
  xl: 24,
  '2xl': 32,
};
