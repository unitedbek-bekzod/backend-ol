export type SubjectType = 'user' | 'admin';

export interface JwtPayload {
  sub: string;
  subjectType: SubjectType;
  role?: string;
}

export interface AuthenticatedRequest {
  user: JwtPayload;
}
