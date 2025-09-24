import { useAppStore } from '../state/store';
import { calculateMetrics } from '../lib/utils';
import { BarChart3, Users, FileText, TrendingUp, Activity, Download } from 'lucide-react';

export function MetricsView() {
  const { files, events } = useAppStore();
  const metrics = calculateMetrics(files, events);

  const metricCards = [
    {
      title: 'Assistant Usage Rate',
      value: `${metrics.assistantUsageRate}%`,
      description: 'Sessions using assistant features',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Rename Acceptance Rate',
      value: `${metrics.renameAcceptanceRate}%`,
      description: 'Auto-rename suggestions accepted',
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      title: 'Organize Action Rate',
      value: `${metrics.organizeActionRate}%`,
      description: 'Files organized into folders',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      title: 'Assets per Session',
      value: metrics.assetsCapturedPerSession.toString(),
      description: 'Files + summaries per session',
      icon: Activity,
      color: 'bg-orange-500',
    },
  ];

  const recentEvents = events.slice(-10).reverse();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Track usage patterns and user engagement</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon size={24} className="text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                <div className="text-sm text-gray-500">{card.title}</div>
              </div>
            </div>
            <p className="text-sm text-gray-600">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Summary Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <BarChart3 size={20} />
            <span>Summary Statistics</span>
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Total Files</span>
              <span className="font-medium text-gray-900">{metrics.totalFiles}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Saved Summaries</span>
              <span className="font-medium text-gray-900">{metrics.totalSummaries}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Sessions with Assistant</span>
              <span className="font-medium text-gray-900">{metrics.sessionsWithAssistant}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Total Sessions</span>
              <span className="font-medium text-gray-900">{metrics.totalSessions}</span>
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Activity size={20} />
            <span>Recent Events</span>
          </h2>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentEvents.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No events yet</p>
            ) : (
              recentEvents.map(event => (
                <div key={event.id} className="flex items-center space-x-3 py-2">
                  <div className="w-2 h-2 bg-documents-blue rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {event.event.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {event.data && (
                    <div className="text-xs text-gray-400">
                      {JSON.stringify(event.data).length > 20
                        ? JSON.stringify(event.data).substring(0, 20) + '...'
                        : JSON.stringify(event.data)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Event Types Breakdown */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Download size={20} />
          <span>Event Types</span>
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(
            events.reduce((acc, event) => {
              acc[event.event] = (acc[event.event] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).map(([eventType, count]) => (
            <div key={eventType} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600 capitalize">
                {eventType.replace(/_/g, ' ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
