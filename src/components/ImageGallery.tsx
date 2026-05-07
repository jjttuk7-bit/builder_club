import React, { useState, useRef } from 'react';
import { Camera, Plus, Trash2, X, Download, User, Calendar, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GalleryImage, Member } from '../types';

interface ImageGalleryProps {
  images: GalleryImage[];
  members: Member[];
  onDelete: (id: string) => void;
  onCreate: (title: string, imageUrl: string, authorId: string) => void;
  isDarkMode: boolean;
}

export const ImageGallery = ({ images, members, onDelete, onCreate, isDarkMode }: ImageGalleryProps) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지 크기는 5MB를 초과할 수 없습니다.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newImageUrl) return;
    onCreate(newTitle, newImageUrl, 'u1'); // Default logic for u1 for now
    setNewTitle('');
    setNewImageUrl('');
    setIsUploadModalOpen(false);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
            <Camera className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'} tracking-tighter uppercase`}>빌더의 갤러리</h2>
            <p className="text-slate-400 font-bold text-sm">빌더 클럽의 소중한 순간들과 시각적 영감을 기록하세요.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 text-lg"
        >
          <Plus className="w-6 h-6" />
          이미지 업로드
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {images.map((image) => {
          const author = members.find(m => m.id === image.authorId);
          return (
            <motion.div 
              layoutId={image.id}
              key={image.id}
              className={`group relative overflow-hidden rounded-[2.5rem] border transition-all cursor-pointer ${
                isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-blue-800' : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/10'
              }`}
              onClick={() => setSelectedImage(image)}
            >
              <div className="aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img 
                  src={image.imageUrl} 
                  alt={image.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                <h3 className="text-white text-xl font-black mb-2 tracking-tight line-clamp-2">{image.title}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img 
                      src={author?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${image.authorId}`} 
                      className="w-6 h-6 rounded-full bg-slate-700"
                      alt="Avatar"
                    />
                    <span className="text-white/80 text-xs font-bold tracking-tight">{author?.name || 'Builder'}</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(image.id);
                    }}
                    className="p-3 bg-white/10 hover:bg-rose-500/80 backdrop-blur-md rounded-2xl transition-all hover:scale-110 active:scale-95"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
              
              {!isDarkMode && (
                <div className="p-6">
                  <h3 className="font-black text-slate-800 tracking-tight mb-2 truncate">{image.title}</h3>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    <span>{new Date(image.createdAt).toLocaleDateString()}</span>
                    <span className="text-blue-500">{author?.name || 'Builder'}</span>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {images.length === 0 && (
        <div className={`py-40 text-center rounded-[3.5rem] border-2 border-dashed ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <ImageIcon className="w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-slate-400 dark:text-slate-600 mb-2 tracking-tighter uppercase">GALLERY IS EMPTY</h3>
          <p className="text-slate-400 font-bold">첫 번째 이미지를 업로드하고 영감을 공유해 보세요.</p>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-900/60 transition-all duration-500">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`w-full max-w-xl rounded-[3rem] shadow-2xl p-10 relative ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-100'}`}
          >
            <button 
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-8 right-8 p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors group"
            >
              <X className="w-6 h-6 text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white" />
            </button>

            <h2 className={`text-3xl font-black mb-8 ${isDarkMode ? 'text-white' : 'text-slate-800'} tracking-tighter uppercase`}>이미지 업로드</h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">이미지 제목</label>
                <input 
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="이미지의 제목을 입력하세요"
                  className={`w-full px-8 py-5 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-100 text-slate-800 focus:border-blue-500'} focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-lg`}
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">이미지 파일</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`aspect-video rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all relative group ${
                    newImageUrl ? 'border-blue-500' : `${isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`
                  }`}
                >
                  {newImageUrl ? (
                    <>
                      <img src={newImageUrl} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-black text-sm uppercase tracking-widest">파일 교체</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Plus className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="text-slate-400 font-bold mb-1">이미지 파일을 선택하거나 드래그하세요</p>
                      <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Max Size: 5MB</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={!newTitle.trim() || !newImageUrl}
                className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 transition-all hover:translate-y-[-2px] active:translate-y-[0] text-lg uppercase tracking-wider"
              >
                갤러리에 저장하기
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Full View Modal */}
      <AnimatePresence>
        {selectedImage && (
          <div 
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-20 backdrop-blur-2xl bg-black/90"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-6xl h-full flex flex-col items-center justify-center gap-10"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-10 -right-10 p-4 text-white/50 hover:text-white transition-colors"
                title="닫기"
              >
                <X className="w-10 h-10" />
              </button>

              <div className="flex-1 w-full overflow-hidden rounded-[3rem] shadow-2xl relative group">
                <img 
                  src={selectedImage.imageUrl} 
                  className="w-full h-full object-contain"
                  alt={selectedImage.title}
                />
                <div className="absolute bottom-10 left-10 right-10 flex items-center justify-between">
                  <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter mb-4">{selectedImage.title}</h2>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-blue-400" />
                        <span className="text-white/80 font-bold">{members.find(m => m.id === selectedImage.authorId)?.name || 'Builder'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        <span className="text-white/80 font-bold">{new Date(selectedImage.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <a 
                    href={selectedImage.imageUrl} 
                    download={`${selectedImage.title}.png`}
                    className="p-6 bg-white/10 hover:bg-white text-white hover:text-blue-600 backdrop-blur-xl rounded-3xl transition-all shadow-xl"
                  >
                    <Download className="w-8 h-8" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
