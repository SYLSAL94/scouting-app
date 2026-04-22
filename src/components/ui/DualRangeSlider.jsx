import React from 'react';

const DualRangeSlider = ({ label, min, max, currentMin, currentMax, onChange, step = 1, unit = "" }) => {
  const handleMinChange = (e) => {
    const value = Math.min(Number(e.target.value), currentMax - step);
    onChange(value, currentMax);
  };

  const handleMaxChange = (e) => {
    const value = Math.max(Number(e.target.value), currentMin + step);
    onChange(currentMin, value);
  };

  const minPos = ((currentMin - min) / (max - min)) * 100;
  const maxPos = ((currentMax - min) / (max - min)) * 100;

  return (
    <div className="filter-group">
      <div className="flex justify-between items-center mb-4">
        <label className="filter-label !mb-0">{label}</label>
        <div className="bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-lg">
          <span className="text-[10px] font-mono text-sky-400 font-bold">
            {currentMin}{unit} — {currentMax}{unit}
          </span>
        </div>
      </div>

      <div className="relative h-6 flex items-center px-1">
        {/* Track Background */}
        <div className="absolute w-full h-1 bg-white/5 rounded-full" />
        
        {/* Selected Range Highlight */}
        <div 
          className="absolute h-1 bg-gradient-to-right from-sky-500 to-violet-500 rounded-full"
          style={{ 
            left: `${minPos}%`, 
            right: `${100 - maxPos}%`,
            background: 'linear-gradient(90deg, #38bdf8, #818cf8)'
          }}
        />

        {/* Real Range Inputs */}
        <input 
          type="range" min={min} max={max} step={step} value={currentMin} 
          onChange={handleMinChange}
          className="range-input-custom absolute w-full appearance-none bg-transparent cursor-pointer"
          style={{ WebkitAppearance: 'none', zIndex: currentMin > max / 2 ? 5 : 4 }}
        />
        <input 
          type="range" min={min} max={max} step={step} value={currentMax} 
          onChange={handleMaxChange}
          className="range-input-custom absolute w-full appearance-none bg-transparent cursor-pointer"
          style={{ WebkitAppearance: 'none', zIndex: 4 }}
        />
      </div>
      
      <div className="flex justify-between mt-1 px-1">
        <span className="text-[9px] text-white/20 font-bold">{min}{unit}</span>
        <span className="text-[9px] text-white/20 font-bold">{max}{unit}</span>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .range-input-custom {
          pointer-events: none;
        }
        .range-input-custom::-webkit-slider-thumb {
          pointer-events: auto;
          -webkit-appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: white;
          border: 3px solid #38bdf8;
          cursor: pointer;
          margin-top: -7px;
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.4);
          position: relative;
          z-index: 10;
        }
        input[type=range]:last-of-type::-webkit-slider-thumb {
          border-color: #818cf8;
          box-shadow: 0 0 10px rgba(129, 140, 248, 0.4);
        }
      `}} />
    </div>
  );
};

export default DualRangeSlider;
