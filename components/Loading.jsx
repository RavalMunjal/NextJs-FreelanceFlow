export default function Loading({ message = "Loading data..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center">
      <div className="relative w-12 h-12 mb-4">
        <div className="w-12 h-12 rounded-full border-4 border-sage-border border-t-forest animate-spin" />
      </div>
      <p className="text-sm font-medium text-textColor-secondary">{message}</p>
    </div>
  );
}
