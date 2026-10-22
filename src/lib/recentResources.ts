export interface RecentResourceEntry {
  id: string;
  title: string;
  category: string;
  courseCode: string;
  viewedAt: string;
}

const recentResourcesKey = (userId: string) =>
  `recently-viewed-resources:${userId}`;

export const getRecentResources = (userId: string): RecentResourceEntry[] => {
  try {
    const stored = localStorage.getItem(recentResourcesKey(userId));
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as RecentResourceEntry[]) : [];
  } catch {
    return [];
  }
};

export const recordRecentResource = (
  userId: string,
  resource: Omit<RecentResourceEntry, "viewedAt">,
) => {
  const recent = getRecentResources(userId).filter(
    (entry) => entry.id !== resource.id,
  );
  recent.unshift({ ...resource, viewedAt: new Date().toISOString() });

  try {
    localStorage.setItem(
      recentResourcesKey(userId),
      JSON.stringify(recent.slice(0, 10)),
    );
  } catch {
    // Recent-view tracking is best-effort when browser storage is unavailable.
  }
};
