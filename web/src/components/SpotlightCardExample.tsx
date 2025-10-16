import React from 'react';
import SpotlightCard from './SpotlightCard';

export function SpotlightCardExample() {
  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">SpotlightCard Examples</h2>
      
      {/* Basic Example */}
      <SpotlightCard className="custom-spotlight-card">
        <div className="text-white">
          <h3 className="text-xl font-semibold mb-2">Basic Spotlight Card</h3>
          <p className="text-gray-300">
            This is a basic spotlight card with default white spotlight effect.
            Move your mouse around to see the spotlight follow your cursor.
          </p>
        </div>
      </SpotlightCard>

      {/* Custom Color Example */}
      <SpotlightCard 
        className="custom-spotlight-card" 
        spotlightColor="rgba(0, 229, 255, 0.2)"
      >
        <div className="text-white">
          <h3 className="text-xl font-semibold mb-2">Cyan Spotlight</h3>
          <p className="text-gray-300">
            This card has a custom cyan spotlight color. The spotlight effect 
            creates a beautiful glow that follows your mouse movement.
          </p>
        </div>
      </SpotlightCard>

      {/* Multiple Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SpotlightCard 
          className="custom-spotlight-card" 
          spotlightColor="rgba(255, 0, 150, 0.2)"
        >
          <div className="text-white">
            <h3 className="text-lg font-semibold mb-2">Pink Spotlight</h3>
            <p className="text-gray-300 text-sm">
              Beautiful pink spotlight effect with smooth transitions.
            </p>
          </div>
        </SpotlightCard>

        <SpotlightCard 
          className="custom-spotlight-card" 
          spotlightColor="rgba(50, 255, 50, 0.2)"
        >
          <div className="text-white">
            <h3 className="text-lg font-semibold mb-2">Green Spotlight</h3>
            <p className="text-gray-300 text-sm">
              Fresh green spotlight that creates an immersive experience.
            </p>
          </div>
        </SpotlightCard>
      </div>

      {/* Interactive Content Example */}
      <SpotlightCard 
        className="custom-spotlight-card" 
        spotlightColor="rgba(255, 165, 0, 0.3)"
      >
        <div className="text-white">
          <h3 className="text-xl font-semibold mb-4">Interactive Spotlight</h3>
          <div className="space-y-3">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              Click Me
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors ml-2">
              Or Me
            </button>
          </div>
          <p className="text-gray-300 mt-4">
            The spotlight works with interactive elements too! Try clicking the buttons above.
          </p>
        </div>
      </SpotlightCard>
    </div>
  );
}

export default SpotlightCardExample;
