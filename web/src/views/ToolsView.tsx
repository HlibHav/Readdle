import { ToolsSection } from '../components/ToolsSection';
import { SpotlightCardExample } from '../components/SpotlightCardExample';

export function ToolsView() {
  return (
    <div className="h-full overflow-auto bg-gray-50 no-scrollbar">
      <ToolsSection />
      <SpotlightCardExample />
    </div>
  );
}

