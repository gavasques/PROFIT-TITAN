// Utility function to get user ID from request
export function getUserId(req: any): string | null {
  // JWT auth: user is set by authenticateToken middleware
  return req.user?.userId || req.user?.sub || null;
}