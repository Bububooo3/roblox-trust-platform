export default function StarRating({
  rating,
  max = 5,
}: {
  rating: number | null | undefined;
  max?: number;
}) {
  if (rating === null || rating === undefined) {
    return <span className="text-muted">No rating</span>;
  }

  const filled = Math.round(rating);
  const stars = Array.from({ length: max }, (_, index) =>
    index < filled ? "★" : "☆",
  ).join("");

  return (
    <span className="star-rating" title={`${rating.toFixed(1)} / ${max}`}>
      {stars}
    </span>
  );
}
