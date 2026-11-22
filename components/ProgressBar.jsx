export default function ProgressBar({
  progress = 0,
  showLabel = true,
  size = "md",
}) {
  // Ensure progress is clamped between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  // Height sizing
  const heightClass = size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2";

  // Dynamic color depending on completion
  const barColor =
    clampedProgress === 100
      ? "bg-sage-dark"
      : clampedProgress > 60
      ? "bg-sage"
      : clampedProgress > 25
      ? "bg-copper"
      : "bg-terracotta";

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs font-medium text-textColor-secondary">
          <span>Progress</span>
          <span className="font-semibold text-textColor-primary">{clampedProgress}%</span>
        </div>
      )}

      <div className={`w-full bg-cream-border rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`${barColor} ${heightClass} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
