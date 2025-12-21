import { useEffect, useState } from 'react';
import type { Participant } from '@/types/team';
import { Card } from '@mini-apps/ui';
import Confetti from 'react-confetti';
import { Users } from 'lucide-react';

interface TeamResultProps {
  teams: Participant[][];
  showConfetti?: boolean;
}

export function TeamResult({ teams, showConfetti = false }: TeamResultProps) {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {teams.map((team, index) => {
          return (
            <Card
              key={index}
              className="p-6 border-2 border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-5 pb-4 border-b-2 border-blue-600">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-600 text-white">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    팀 {index + 1}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium">{team.length}명</p>
                </div>
              </div>

              <ul className="space-y-2">
                {team.map((member, idx) => (
                  <li
                    key={member.id}
                    className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <span className="font-bold text-blue-600 min-w-[28px] text-lg">
                      {idx + 1}.
                    </span>
                    <span className="font-medium text-gray-900">
                      {member.name}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
