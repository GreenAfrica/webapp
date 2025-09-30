'use client';

interface PointsOverviewProps {
  totalPoints: number;
  onRedeemClick: () => void;
  onProfileClick: () => void;
}

export function PointsOverview({ totalPoints, onRedeemClick, onProfileClick }: PointsOverviewProps) {
  return (
    <div className="impact-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-semibold text-2xl text-primary-800">
            Your Green Points
          </h2>
          <p className="text-gray-600">Keep recycling to earn more!</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold text-primary-700">{totalPoints}</p>
          <p className="text-sm text-gray-600">Total Points</p>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="flex gap-4">
        <button
          onClick={onRedeemClick}
          className="btn-primary flex-1"
        >
          Redeem Points
        </button>
        <button
          onClick={onProfileClick}
          className="btn-secondary flex-1"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}
