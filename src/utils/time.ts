const toDate = (value?: string | Date): Date | undefined => {
  if (!value) return undefined;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

export const calculateDurationMinutes = (
  start?: string | Date,
  end?: string | Date,
): number | undefined => {
  const startDate = toDate(start);
  const endDate = toDate(end);
  if (!startDate || !endDate) return undefined;

  const diffMs = endDate.getTime() - startDate.getTime();
  if (!Number.isFinite(diffMs) || diffMs <= 0) return 0;

  return Math.round(diffMs / 60000);
};

export const formatDuration = (minutes?: number | null): string => {
  if (minutes === null || minutes === undefined) return "—";
  if (!Number.isFinite(minutes) || minutes <= 0) return "0m";

  const totalMinutes = Math.round(minutes);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (hours && mins) return `${hours}h ${mins}m`;
  if (hours) return `${hours}h`;
  return `${mins}m`;
};

export const calculateRemainingSeconds = (
  start?: string | Date,
  end?: string | Date,
  reference: Date = new Date(),
): number | undefined => {
  const startDate = toDate(start);
  const endDate = toDate(end);
  if (!endDate) return undefined;

  const refMs = reference.getTime();
  const endMs = endDate.getTime();

  if (!Number.isFinite(endMs)) return undefined;

  if (startDate) {
    const startMs = startDate.getTime();
    if (Number.isFinite(startMs) && startMs > refMs) {
      // Contest not yet started – show full duration if available
      const duration = endMs - startMs;
      return duration > 0 ? Math.round(duration / 1000) : 0;
    }
  }

  const remaining = endMs - refMs;
  if (remaining <= 0) return 0;
  return Math.round(remaining / 1000);
};
