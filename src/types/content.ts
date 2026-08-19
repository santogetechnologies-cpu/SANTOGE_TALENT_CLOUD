export type ContentType =
  | 'LEARNING_CARD'
  | 'VIDEO'
  | 'QUESTION'
  | 'CODING_CHALLENGE'
  | 'LAB'
  | 'ASSIGNMENT'
  | 'PROJECT'
  | 'QUIZ'
  | 'INDUSTRY_SCENARIO'
  | 'PLACEMENT_ENGLISH'
  | 'PLACEMENT_APTITUDE'
  | 'PLACEMENT_REASONING';

export type ContentWorkflowState =
  | 'DRAFT'
  | 'REVIEW'
  | 'APPROVED'
  | 'PUBLISHED';

export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  trackName: string;
  moduleName: string;
  status: ContentWorkflowState;
  authorName: string;
  authorId: string;
  reviewedBy?: string;
  reviewedAt?: string;
  publishedAt?: string;
  version: number;
  tags: string[];
  xpPoints: number;
  estimatedMinutes: number;
  contentData: {
    description?: string;
    markdownText?: string;
    codeSnippet?: string;
    videoEmbedUrl?: string;
    quizOptions?: { text: string; isCorrect: boolean }[];
  };
  reviewNotes?: string;
  updatedAt: string;
}
