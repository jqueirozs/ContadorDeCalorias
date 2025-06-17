import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Trophy, Zap } from "lucide-react";

interface PointsAnimationProps {
  points: number;
  show: boolean;
  onComplete: () => void;
}

export function PointsAnimation({ points, show, onComplete }: PointsAnimationProps) {
  const [displayPoints, setDisplayPoints] = useState(0);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setDisplayPoints(points);
      }, 100);

      const completeTimer = setTimeout(() => {
        onComplete();
        setDisplayPoints(0);
      }, 2500);

      return () => {
        clearTimeout(timer);
        clearTimeout(completeTimer);
      };
    }
  }, [show, points, onComplete]);

  const getIcon = () => {
    if (points >= 50) return <Trophy className="w-8 h-8 text-yellow-400" />;
    if (points >= 20) return <Zap className="w-8 h-8 text-blue-400" />;
    return <Star className="w-8 h-8 text-green-400" />;
  };

  const getColor = () => {
    if (points >= 50) return "from-yellow-400 to-orange-500";
    if (points >= 20) return "from-blue-400 to-purple-500";
    return "from-green-400 to-emerald-500";
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -100 }}
          transition={{ 
            type: "spring", 
            stiffness: 500, 
            damping: 25,
            duration: 0.6
          }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
        >
          <div className={`bg-gradient-to-r ${getColor()} rounded-full p-6 shadow-2xl border-4 border-white`}>
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, 20, -20, 0] }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center text-white"
            >
              {getIcon()}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                className="text-2xl font-bold mt-2"
              >
                +{displayPoints}
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm font-medium"
              >
                pontos!
              </motion.div>
            </motion.div>
          </div>
          
          {/* Confetti effect */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              animate={{
                opacity: 0,
                scale: 0,
                x: Math.random() * 200 - 100,
                y: Math.random() * 200 - 100,
              }}
              transition={{ duration: 1.5, delay: 0.5 + i * 0.1 }}
              className={`absolute w-3 h-3 bg-gradient-to-r ${getColor()} rounded-full`}
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}