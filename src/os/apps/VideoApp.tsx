import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Film, Play, Pause, ListVideo, Plus, Folder, ChevronRight } from 'lucide-react';

const DEFAULT_CATEGORIES = [
  {
    name: 'Animations',
    videos: [
      { title: 'Big Buck Bunny', url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { title: 'Elephants Dream', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
      { title: 'Tears of Steel', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
      { title: 'Sintel', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' }
    ]
  },
  {
    name: 'Nature & Scenery',
    videos: [
      { title: 'Earth from Space', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
      { title: 'Ocean Waves', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' }
    ]
  }
];

const KEYBOARD_LAYOUT = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '-'],
  ['^', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '.', '/']
];

export default function VideoApp() {
  const [view, setView] = useState<'categories' | 'list' | 'playing'>('categories');
  const [catIndex, setCatIndex] = useState(0);
  const [vidIndex, setVidIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [savedVideos, setSavedVideos] = useState<{title: string, url: string}[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [showKeyboard, setShowKeyboard] = useState(false);
  const [inputUrl, setInputUrl] = useState('https://');
  const [isCaps, setIsCaps] = useState(false);
  const [kbRow, setKbRow] = useState(0);
  const [kbCol, setKbCol] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('ionos_saved_videos');
    if (saved) {
      try { setSavedVideos(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const categories = useMemo(() => [
    ...DEFAULT_CATEGORIES,
    {
      name: 'My Saved Videos',
      videos: [...savedVideos, { title: 'Enter Custom URL...', url: 'custom' }]
    }
  ], [savedVideos]);

  const currentCategory = categories[catIndex] || categories[0];
  const currentVideos = currentCategory.videos;

  useEffect(() => {
    const handleInput = (e: CustomEvent<string>) => {
      const btn = e.detail;
      
      if (showKeyboard) {
        if (btn === 'right') setKbCol(prev => Math.min(prev + 1, KEYBOARD_LAYOUT[kbRow].length - 1));
        else if (btn === 'left') setKbCol(prev => Math.max(prev - 1, 0));
        else if (btn === 'down') {
          setKbRow(prev => Math.min(prev + 1, KEYBOARD_LAYOUT.length - 1));
          setKbCol(prev => Math.min(kbCol, KEYBOARD_LAYOUT[Math.min(kbRow + 1, KEYBOARD_LAYOUT.length - 1)].length - 1));
        }
        else if (btn === 'up') {
          setKbRow(prev => Math.max(prev - 1, 0));
          setKbCol(prev => Math.min(kbCol, KEYBOARD_LAYOUT[Math.max(kbRow - 1, 0)].length - 1));
        }
        else if (btn === 'x') {
          const key = KEYBOARD_LAYOUT[kbRow][kbCol];
          if (key === '^') setIsCaps(!isCaps);
          else setInputUrl(prev => prev + (isCaps ? key.toUpperCase() : key));
        }
        else if (btn === 'b') {
          if (inputUrl.length > 0) setInputUrl(prev => prev.slice(0, -1));
          else setShowKeyboard(false);
        }
        else if (btn === 'a') setInputUrl(prev => prev + ' ');
        else if (btn === 'menu') {
          const clip = localStorage.getItem('ionos_clipboard');
          if (clip) setInputUrl(prev => prev + clip);
        }
        else if (btn === 'start') {
          let finalUrl = inputUrl;
          if (finalUrl.includes('youtube.com/watch?v=')) {
            finalUrl = finalUrl.replace('watch?v=', 'embed/');
          } else if (finalUrl.includes('youtu.be/')) {
            finalUrl = finalUrl.replace('youtu.be/', 'youtube.com/embed/');
          }
          
          if (finalUrl.trim() !== '' && finalUrl !== 'https://') {
            const newVideo = { 
              title: finalUrl.replace('https://', '').replace('www.', '').substring(0, 25) + '...', 
              url: finalUrl 
            };
            const newSaved = [...savedVideos, newVideo];
            setSavedVideos(newSaved);
            localStorage.setItem('ionos_saved_videos', JSON.stringify(newSaved));
          }

          setCurrentUrl(finalUrl);
          setShowKeyboard(false);
          setView('playing');
          setIsPlaying(true);
        }
      } else if (view === 'categories') {
        if (btn === 'down') setCatIndex(prev => Math.min(prev + 1, categories.length - 1));
        else if (btn === 'up') setCatIndex(prev => Math.max(prev - 1, 0));
        else if (btn === 'x' || btn === 'start') {
          setVidIndex(0);
          setView('list');
        }
      } else if (view === 'list') {
        if (btn === 'down') setVidIndex(prev => Math.min(prev + 1, currentVideos.length - 1));
        else if (btn === 'up') setVidIndex(prev => Math.max(prev - 1, 0));
        else if (btn === 'b' || btn === 'left') setView('categories');
        else if (btn === 'x' || btn === 'start') {
          if (currentVideos[vidIndex].url === 'custom') {
            setShowKeyboard(true);
            setInputUrl('https://');
          } else {
            setCurrentUrl(currentVideos[vidIndex].url);
            setView('playing');
            setIsPlaying(true);
          }
        }
      } else if (view === 'playing') {
        const isIframe = currentUrl.includes('embed') || currentUrl.includes('youtube.com');
        if (btn === 'x' || btn === 'start') {
          if (!isIframe && videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
          }
        } else if (btn === 'b' || btn === 'menu') {
          if (!isIframe && videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
          }
          setIsPlaying(false);
          setView('list');
        }
      }
    };
    window.addEventListener('device-button-down', handleInput as EventListener);
    return () => window.removeEventListener('device-button-down', handleInput as EventListener);
  }, [isPlaying, view, catIndex, vidIndex, showKeyboard, kbRow, kbCol, inputUrl, isCaps, currentUrl, savedVideos, categories, currentVideos]);

  const isIframe = currentUrl.includes('embed') || currentUrl.includes('youtube.com');

  if (view === 'categories') {
    return (
      <div className="w-full h-full bg-zinc-900 flex flex-col relative">
        <div className="h-8 bg-fuchsia-600 flex items-center px-3 border-b border-fuchsia-700 shrink-0">
          <div className="flex items-center gap-1.5 text-white">
            <Film size={12} />
            <span className="text-[10px] font-bold">Media Player</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 flex flex-col">
          <div className="text-[10px] text-zinc-400 font-bold mb-2 flex items-center gap-1 shrink-0">
            <Folder size={10} /> /categories
          </div>
          <div className="flex flex-col gap-1 flex-1">
            {categories.map((cat, index) => {
              const isSelected = index === catIndex;
              return (
                <div 
                  key={cat.name} 
                  onClick={() => {
                    setCatIndex(index);
                    setVidIndex(0);
                    setView('list');
                  }}
                  className={`flex items-center justify-between px-2 py-2 rounded-md transition-colors cursor-pointer ${isSelected ? 'bg-fuchsia-900/40 text-fuchsia-100' : 'text-zinc-300 hover:bg-zinc-800'}`}
                >
                  <div className="flex items-center gap-2">
                    <Folder size={10} className={isSelected ? 'text-fuchsia-400' : 'text-zinc-500'} />
                    <span className={`text-[10px] ${isSelected ? 'font-bold' : ''}`}>{cat.name}</span>
                  </div>
                  <ChevronRight size={10} className={isSelected ? 'text-fuchsia-400' : 'text-zinc-600'} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'list') {
    return (
      <div className="w-full h-full bg-zinc-900 flex flex-col relative">
        <div className="h-8 bg-fuchsia-600 flex items-center px-3 border-b border-fuchsia-700 shrink-0">
          <div className="flex items-center gap-1.5 text-white">
            <Film size={12} />
            <span className="text-[10px] font-bold truncate max-w-[150px]">{currentCategory.name}</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 flex flex-col">
          <div className="text-[10px] text-zinc-400 font-bold mb-2 flex items-center gap-1 shrink-0">
            <ListVideo size={10} /> /{currentCategory.name.toLowerCase().replace(/\s+/g, '_')}
          </div>
          <div className="flex flex-col gap-1 flex-1">
            {currentVideos.map((vid, index) => {
              const isSelected = index === vidIndex;
              return (
                <div 
                  key={vid.title + index} 
                  onClick={() => {
                    setVidIndex(index);
                    if (vid.url === 'custom') {
                      setShowKeyboard(true);
                      setInputUrl('https://');
                    } else {
                      setCurrentUrl(vid.url);
                      setView('playing');
                      setIsPlaying(true);
                    }
                  }}
                  className={`flex items-center justify-between px-2 py-2 rounded-md transition-colors cursor-pointer ${isSelected ? 'bg-fuchsia-900/40 text-fuchsia-100' : 'text-zinc-300 hover:bg-zinc-800'}`}
                >
                  <div className="flex items-center gap-2">
                    {vid.url === 'custom' ? <Plus size={10} className={isSelected ? 'text-fuchsia-400' : 'text-zinc-500'} /> : <Film size={10} className={isSelected ? 'text-fuchsia-400' : 'text-zinc-500'} />}
                    <span className={`text-[10px] ${isSelected ? 'font-bold' : ''} truncate max-w-[140px]`}>{vid.title}</span>
                  </div>
                  {isSelected && vid.url !== 'custom' && <Play size={10} className="text-fuchsia-400" />}
                </div>
              );
            })}
          </div>
        </div>

        {showKeyboard && (
          <div className="h-auto pb-2 bg-zinc-950 border-t border-zinc-800 p-1 flex flex-col gap-1 shrink-0 absolute bottom-0 left-0 right-0 z-20">
            <div className="bg-zinc-900 p-1 mb-1 rounded text-[9px] text-fuchsia-200 truncate border border-zinc-800">
              {inputUrl}<span className="animate-pulse w-1 h-2.5 bg-fuchsia-400 inline-block ml-0.5 align-middle"></span>
            </div>
            {KEYBOARD_LAYOUT.map((row, rIdx) => (
              <div key={rIdx} className="flex justify-center gap-1">
                {row.map((key, cIdx) => (
                  <div 
                    key={cIdx} 
                    onClick={() => {
                      setKbRow(rIdx);
                      setKbCol(cIdx);
                      const keyVal = KEYBOARD_LAYOUT[rIdx][cIdx];
                      if (keyVal === '^') setIsCaps(!isCaps);
                      else setInputUrl(prev => prev + (isCaps ? keyVal.toUpperCase() : keyVal));
                    }}
                    className={`w-5 h-6 rounded flex items-center justify-center text-[10px] font-bold cursor-pointer hover:bg-fuchsia-700 hover:text-white ${
                      rIdx === kbRow && cIdx === kbCol 
                        ? 'bg-fuchsia-600 text-white' 
                        : key === '^' && isCaps
                          ? 'bg-fuchsia-900 text-fuchsia-200'
                          : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {key === '^' ? (isCaps ? 'CAPS' : 'caps') : (isCaps ? key.toUpperCase() : key)}
                  </div>
                ))}
              </div>
            ))}
            <div className="flex justify-center gap-2 mt-1 text-[8px] text-zinc-500 font-bold">
              <span className="cursor-pointer hover:text-fuchsia-400" onClick={() => {
                const key = KEYBOARD_LAYOUT[kbRow][kbCol];
                if (key === '^') setIsCaps(!isCaps);
                else setInputUrl(prev => prev + (isCaps ? key.toUpperCase() : key));
              }}>[X] Type</span>
              <span className="cursor-pointer hover:text-fuchsia-400" onClick={() => {
                if (inputUrl.length > 0) setInputUrl(prev => prev.slice(0, -1));
                else setShowKeyboard(false);
              }}>[B] Del</span>
              <span className="cursor-pointer hover:text-fuchsia-400" onClick={() => {
                const clip = localStorage.getItem('ionos_clipboard');
                if (clip) setInputUrl(prev => prev + clip);
              }}>[MENU] Paste</span>
              <span className="cursor-pointer hover:text-fuchsia-400" onClick={() => {
                let finalUrl = inputUrl;
                if (finalUrl.includes('youtube.com/watch?v=')) {
                  finalUrl = finalUrl.replace('watch?v=', 'embed/');
                } else if (finalUrl.includes('youtu.be/')) {
                  finalUrl = finalUrl.replace('youtu.be/', 'youtube.com/embed/');
                }
                
                if (finalUrl.trim() !== '' && finalUrl !== 'https://') {
                  const newVideo = { 
                    title: finalUrl.replace('https://', '').replace('www.', '').substring(0, 25) + '...', 
                    url: finalUrl 
                  };
                  const newSaved = [...savedVideos, newVideo];
                  setSavedVideos(newSaved);
                  localStorage.setItem('ionos_saved_videos', JSON.stringify(newSaved));
                }

                setCurrentUrl(finalUrl);
                setShowKeyboard(false);
                setView('playing');
                setIsPlaying(true);
              }}>[START] Play/Save</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black flex flex-col relative">
      <div className="h-8 bg-zinc-900/80 flex items-center px-3 border-b border-zinc-800 shrink-0 z-10 absolute top-0 w-full backdrop-blur-sm">
        <div className="flex items-center gap-1.5 text-white">
          <Film size={12} />
          <span className="text-[10px] font-bold">Media Player</span>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center bg-black overflow-hidden relative pt-8">
        {isIframe ? (
          <iframe 
            src={currentUrl}
            className="w-full h-auto max-h-full aspect-video border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Video Player"
          />
        ) : (
          <>
            <video 
              ref={videoRef}
              src={currentUrl}
              className="w-full h-auto max-h-full object-contain cursor-pointer"
              style={{ 
                imageRendering: 'pixelated', 
                filter: 'contrast(1.2) saturate(1.2)' 
              }}
              autoPlay
              loop
              playsInline
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onClick={() => {
                if (videoRef.current) {
                  if (isPlaying) videoRef.current.pause();
                  else videoRef.current.play();
                  setIsPlaying(!isPlaying);
                }
              }}
            />
            
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Play size={24} className="text-white ml-1" fill="currentColor" />
                </div>
              </div>
            )}
          </>
        )}
        
        <div className="absolute bottom-2 w-full px-4 flex justify-between text-[8px] text-white/70 font-mono drop-shadow-md z-10 pointer-events-none">
          <span>{!isIframe ? '[START] Play/Pause' : ''}</span>
          <span>[B] Stop</span>
        </div>
      </div>
    </div>
  );
}
