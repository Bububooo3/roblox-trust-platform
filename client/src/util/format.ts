export function formatCents(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatAccountAge(days: number): string {
  const years = Math.floor(days / 365);
  if (years >= 1) {
    return `~${years} ${years === 1 ? "year" : "years"} (${days} days)`;
  }
  return `${days} days`;
}

export function formatRating(rating: number | null | undefined): string {
  if (rating === null || rating === undefined) return "No ratings";
  return rating.toFixed(1);
}
