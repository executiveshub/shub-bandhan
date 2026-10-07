import React from 'react';
import { SUCCESS_STORIES } from '../data/mockData';
import { ScreenType } from '../types/matrimony';

interface StoriesScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onToast: (msg: string) => void;
}

export const StoriesScreen: React.FC<StoriesScreenProps> = ({
  onNavigate,
  onToast,
}) => {
  return (
    <div className="flex flex-col w-full max-w-xl mx-auto pb-32 pt-20 px-4">
      {/* Auspicious Header Banner */}
      <div className="bg-gradient-to-r from-[#ab3100] via-[#8e4b00] to-[#d3430c] text-white p-5 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#ffdcc3] block">
              सफल वैवाहिक कहानियां
            </span>
            <h2 className="font-bold text-[22px] mt-0.5 font-['Noto_Sans']">
              शुभ बंधन से जुड़े परिणय सूत्र 🪷
            </h2>
            <p className="text-[13px] text-[#faefe4] mt-1 leading-snug">
              सच्चे संस्कारों और प्रामाणिक परिवारों का मिलन — अवध व पूर्वांचल के वे परिवार जो आज सुखद गृहस्थ जीवन बिता रहे हैं।
            </p>
          </div>
          <span className="text-3xl">💐</span>
        </div>

        {/* Auspicious Count Strip */}
        <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-[12px]">
          <div>
            <span className="text-[#ffdcc3] block">सफल परिणय संबंध:</span>
            <strong className="text-white text-[15px] font-black">2,450+ विवाह संपन्न</strong>
          </div>
          <div className="text-right">
            <span className="text-[#ffdcc3] block">संतुष्टि दर:</span>
            <strong className="text-white text-[15px] font-black">100% पारिवारिक विश्वास</strong>
          </div>
        </div>
      </div>

      {/* Stories Feed */}
      <div className="flex flex-col gap-5 mt-5">
        {SUCCESS_STORIES.map((story) => (
          <article
            key={story.id}
            className="bg-white rounded-2xl border border-[#e3bfb4]/60 shadow-sm overflow-hidden flex flex-col"
          >
            {/* Top Garland Banner */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#ab3100] via-[#ffdcc3] to-[#8e4b00]" />

            {/* Couple Image & Match Overlay */}
            <div className="relative w-full aspect-[16/9] bg-[#f7ece1]">
              <img
                src={story.photo}
                alt={story.coupleNames}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* Guna Match Pill */}
              <div className="absolute top-3 right-3">
                <span className="px-3 py-1 rounded-full bg-[#fff8f3]/95 text-[#ab3100] text-[12px] font-bold shadow-md flex items-center gap-1 backdrop-blur-xs">
                  <span className="material-symbols-outlined text-[16px]">stars</span>
                  <span>{story.gunScore} गुण मिलान</span>
                </span>
              </div>

              {/* Couple Name and Wedding Date Overlaid at base */}
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h3 className="font-bold text-[18px] leading-tight text-white drop-shadow-xs">
                  {story.coupleNames}
                </h3>
                <p className="text-[12px] text-[#ffdcc3] drop-shadow-xs mt-0.5">
                  विवाह तिथि: {story.weddingDate} • {story.location}
                </p>
              </div>
            </div>

            {/* Story Content Details */}
            <div className="p-4 flex flex-col gap-3">
              <p className="text-[13px] text-[#1f1b14] leading-relaxed">
                "{story.storyHindi}"
              </p>

              {/* Parent Endorsement Quote */}
              <div className="p-3 rounded-xl bg-[#fdf2e6] border border-[#e3bfb4]/50 flex items-start gap-2.5">
                <span className="text-xl">❝</span>
                <div className="flex-1">
                  <p className="text-[12px] text-[#5a4139] italic leading-snug">
                    {story.parentQuote}
                  </p>
                  <span className="text-[11px] font-bold text-[#ab3100] block mt-1">
                    — {story.parentName}
                  </span>
                </div>
              </div>

              {/* BDE / BDM Referral Attribution Badge */}
              {story.bdeAssisted && (
                <div className="p-2 rounded-lg bg-[#f7ece1] text-[11px] text-[#5a4139] flex items-center justify-between border border-[#e3bfb4]/40">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-[#ab3100]">
                      badge
                    </span>
                    <span>सत्यापन एवं ऑनबोर्डिंग फील्ड अधिकारी:</span>
                  </span>
                  <span className="font-bold text-[#ab3100] font-mono">
                    {story.bdeAssisted}
                  </span>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* Share Your Story Banner */}
      <div className="mt-5 p-4 rounded-2xl bg-[#f1e7db] border border-[#e3bfb4]/70 flex flex-col gap-2.5 text-center">
        <h4 className="font-bold text-[15px] text-[#1f1b14]">
          क्या आपका विवाह भी शुभ बंधन के माध्यम से तय हुआ?
        </h4>
        <p className="text-[12px] text-[#5a4139]">
          अपनी प्रेरणादायक कहानी साझा करें और अन्य परिवारों का विश्वास मजबूत करें।
        </p>
        <button
          onClick={() => {
            onToast('कहानी सबमिशन फॉर्म: विवरण हमारे मुख्यालय टीम को भेजा गया।');
          }}
          className="w-full py-2.5 rounded-xl bg-[#ab3100] hover:bg-[#852400] text-white font-bold text-[13px] shadow-xs active:scale-98 transition-all"
        >
          अपनी परिणय कहानी साझा करें 💍
        </button>
      </div>
    </div>
  );
};
