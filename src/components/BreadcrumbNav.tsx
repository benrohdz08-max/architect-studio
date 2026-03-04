import { useProjectStore } from '../store/useProjectStore';

export function BreadcrumbNav() {
  const { breadcrumbs, navigateBreadcrumb } = useProjectStore();

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1 px-4 py-2 bg-gray-900/60 border-b border-gray-800/50 overflow-x-auto">
      {breadcrumbs.map((item, index) => (
        <div key={item.diagramId} className="flex items-center gap-1 shrink-0">
          {index > 0 && <span className="text-gray-600 text-xs">›</span>}
          <button
            onClick={() => navigateBreadcrumb(index)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              index === breadcrumbs.length - 1
                ? 'text-indigo-400 bg-indigo-900/30 font-medium'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            {item.label}
          </button>
        </div>
      ))}
    </nav>
  );
}
