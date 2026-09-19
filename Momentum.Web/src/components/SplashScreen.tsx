import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-slate-900 z-50 transition-opacity duration-500">
      <div className="flex flex-col items-center space-y-4">
        <div className="text-6xl font-extrabold text-indigo-600 dark:text-indigo-400 animate-bounce">
          M
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Momentum
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
