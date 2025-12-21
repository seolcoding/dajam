interface ChosungDisplayProps {
  chosung: string;
}

export function ChosungDisplay({ chosung }: ChosungDisplayProps) {
  const letters = chosung.split('');

  return (
    <div className="relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 flex justify-center items-center opacity-10 pointer-events-none">
        <div className="text-[200px] font-black text-purple-600">?</div>
      </div>

      <div className="relative flex justify-center items-center gap-4 md:gap-6 my-12 flex-wrap">
        {letters.map((letter, index) => (
          <div
            key={index}
            className="relative group"
            style={{
              animation: `pop-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${index * 0.1}s both`,
            }}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />

            {/* Main card */}
            <div className="relative w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32">
              {/* Inner shadow for depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-3xl shadow-2xl transform group-hover:scale-105 transition-transform" />

              {/* Highlight effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl" />

              {/* Letter */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl md:text-7xl lg:text-8xl font-black text-white drop-shadow-2xl animate-float"
                      style={{
                        animationDelay: `${index * 0.2}s`,
                        textShadow: '0 4px 12px rgba(0,0,0,0.3), 0 0 40px rgba(255,255,255,0.2)'
                      }}>
                  {letter}
                </span>
              </div>

              {/* Border accent */}
              <div className="absolute inset-0 rounded-3xl border-2 border-white/30" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
