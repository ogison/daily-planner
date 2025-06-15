"use client";

interface ViewToggleProps {
  view: "schedule" | "category";
  onViewChange: (view: "schedule" | "category") => void;
}

export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
      <button
        onClick={() => onViewChange("schedule")}
        className={`px-4 py-2 rounded-md font-medium transition-colors ${
          view === "schedule"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        予定別
      </button>
      <button
        onClick={() => onViewChange("category")}
        className={`px-4 py-2 rounded-md font-medium transition-colors ${
          view === "category"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        カテゴリ別
      </button>
    </div>
  );
}