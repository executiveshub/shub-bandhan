import React from 'react';
import { ScreenType } from '../types/matrimony';

interface BottomNavProps {
  currentScreen: ScreenType;
  shortlistCount: number;
  chatsCount: number;
  onNavigate: (screen: ScreenType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  chatsCount,
  onNavigate,
}) => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 pb-safe bg-[#fff8f3]/95 backdrop-blur-xl border-t border-[#e3bfb4]/40 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]"
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="max-w-xl mx-auto flex justify-around items-center h-18 px-1">
        {/* Dashboard */}
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center justify-center min-w-[58px] min-h-[48px] py-1 transition-all active:scale-95 ${
            currentScreen === 'dashboard'
              ? 'text-[#ab3100] font-bold'
              : 'text-[#5a4139] hover:text-[#1f1b14]'
          }`}
          aria-label="Dashboard"
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ fontVariationSettings: currentScreen === 'dashboard' ? "'FILL' 1" : "'FILL' 0" }}
          >
            dashboard
          </span>
          <span className="text-[11px] mt-0.5 font-medium">Dashboard</span>
        </button>

        {/* Match Feed */}
        <button
          onClick={() => onNavigate('feed')}
          className={`flex flex-col items-center justify-center min-w-[58px] min-h-[48px] py-1 transition-all active:scale-95 ${
            currentScreen === 'feed'
              ? 'text-[#ab3100] font-bold'
              : 'text-[#5a4139] hover:text-[#1f1b14]'
          }`}
          aria-label="Matches"
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ fontVariationSettings: currentScreen === 'feed' ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
          <span className="text-[11px] mt-0.5 font-medium">Matches</span>
        </button>

        {/* Conversations / Chats */}
        <button
          onClick={() => onNavigate('chats')}
          className={`flex flex-col items-center justify-center min-w-[58px] min-h-[48px] py-1 transition-all active:scale-95 relative ${
            currentScreen === 'chats'
              ? 'text-[#ab3100] font-bold'
              : 'text-[#5a4139] hover:text-[#1f1b14]'
          }`}
          aria-label="Messages"
        >
          <div className="relative flex items-center justify-center">
            <span
              className="material-symbols-outlined text-[24px]"
              style={{ fontVariationSettings: currentScreen === 'chats' ? "'FILL' 1" : "'FILL' 0" }}
            >
              chat
            </span>
            {chatsCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-[#ab3100] text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center shadow-xs">
                {chatsCount}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-0.5 font-medium">Messages</span>
        </button>

        {/* Success Stories */}
        <button
          onClick={() => onNavigate('stories')}
          className={`flex flex-col items-center justify-center min-w-[58px] min-h-[48px] py-1 transition-all active:scale-95 ${
            currentScreen === 'stories'
              ? 'text-[#ab3100] font-bold'
              : 'text-[#5a4139] hover:text-[#1f1b14]'
          }`}
          aria-label="Stories"
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ fontVariationSettings: currentScreen === 'stories' ? "'FILL' 1" : "'FILL' 0" }}
          >
            auto_stories
          </span>
          <span className="text-[11px] mt-0.5 font-medium">Stories</span>
        </button>

        {/* Family Profile */}
        <button
          onClick={() => onNavigate('profile')}
          className={`flex flex-col items-center justify-center min-w-[58px] min-h-[48px] py-1 transition-all active:scale-95 ${
            currentScreen === 'profile'
              ? 'text-[#ab3100] font-bold'
              : 'text-[#5a4139] hover:text-[#1f1b14]'
          }`}
          aria-label="Profile"
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ fontVariationSettings: currentScreen === 'profile' ? "'FILL' 1" : "'FILL' 0" }}
          >
            family_restroom
          </span>
          <span className="text-[11px] mt-0.5 font-medium">Profile</span>
        </button>
      </div>
    </nav>
  );
};
