export type ViewMode = 
  | 'home'
  | 'explore'
  | 'detail'
  | 'participate'
  | 'results'
  | 'profile'
  | 'manager'
  | 'ai-intelligence';

export type UserRole = 'citizen' | 'manager';

export type MissionStatus = 'open' | 'analysis' | 'feedback_published' | 'closed';

export interface MissionAxis {
  id: string;
  title: string;
  description: string;
  iconName: string;
  highlightStat: string;
}

export interface Mission {
  id: string;
  title: string;
  agency: string;
  agencyInitials: string;
  theme: string;
  themeColor: string;
  region: string;
  municipality?: string;
  status: MissionStatus;
  statusLabel: string;
  participantsCount: number;
  deadline: string;
  daysRemaining?: number;
  imageUrl: string;
  summary: string;
  contextDescription: string;
  whyAsking: string;
  howUsed: string;
  axes: MissionAxis[];
  currentStage: 'participation' | 'analysis' | 'decision' | 'feedback';
  featured?: boolean;
}

export interface DecisionRecord {
  id: string;
  topic: string;
  citizenProposal: string;
  votesCount: number;
  region: string;
  status: 'incorporated' | 'in_analysis' | 'not_incorporated';
  statusLabel: string;
  officialJustification: string;
  impactAgency: string;
  plannedDate: string;
}

export interface CitizenContribution {
  id: string;
  missionId: string;
  missionTitle: string;
  date: string;
  status: 'analyzing' | 'approved' | 'implemented' | 'feedback_ready';
  statusLabel: string;
  region: string;
  prioritiesRanking: string[];
  feedbackSummary?: string;
}

export interface CitizenProfile {
  name: string;
  cpfMasked: string;
  municipality: string;
  region: string;
  avatarUrl: string;
  missionsCount: number;
  contributionsCount: number;
  feedbackReceivedCount: number;
  badges: {
    id: string;
    title: string;
    description: string;
    icon: string;
    earnedDate: string;
  }[];
}

export interface RegionData {
  id: string;
  name: string;
  population: string;
  contributions: number;
  activeMissions: number;
  topTheme: string;
  coveragePercent: number;
}
