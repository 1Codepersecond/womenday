import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBirthdayStore, type RelationshipType } from '@/features/core/store/useBirthdayStore';
import { toast } from 'sonner';
import { 
  Share2, 
  Copy, 
  Check, 
  Send, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Sparkles, 
  X, 
  Heart, 
  Globe 
} from 'lucide-react';

interface ShareCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareCelebrationModal: React.FC<ShareCelebrationModalProps> = ({ isOpen, onClose }) => {
  const { config } = useBirthdayStore();
  
  const [customName, setCustomName] = useState(config.name || '');
  const [customRel, setCustomRel] = useState<RelationshipType>(config.relationship || 'partner');
  const [customSender, setCustomSender] = useState(config.senderName || '');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'share' | 'customize'>('share');

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Build the share URL with query parameters
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}`
    : 'https://12a5-chuc-mung-20-10.vercel.app/';

  const generateShareUrl = (name: string, rel: string, sender: string) => {
    const params = new URLSearchParams();
    if (name.trim()) params.set('name', name.trim());
    if (rel) params.set('rel', rel);
    params.set('lang', 'vi');
    if (sender.trim()) params.set('sender', sender.trim());
    params.set('utm_source', 'share');
    params.set('utm_medium', 'social');
    params.set('utm_campaign', 'women_day_20_10');
    
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  const activeShareUrl = generateShareUrl(
    activeTab === 'customize' ? customName : (config.name || ''),
    activeTab === 'customize' ? customRel : (config.relationship || 'partner'),
    activeTab === 'customize' ? customSender : (config.senderName || '')
  );

  const targetName = activeTab === 'customize' ? customName : (config.name || '');
  
  const shareText = targetName
    ? `💐 Các chàng trai 12A5 gửi tặng ${targetName} một bất ngờ nhỏ nhân ngày Phụ nữ Việt Nam 20/10! 🎂🎉`
    : `💐 Các chàng trai lớp 12A5 gửi tặng các bạn nữ một bất ngờ nhỏ nhân ngày 20/10! 🎂🎉`;

  const handleCopyLink = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(activeShareUrl);
        setCopied(true);
        toast.success("Đã sao chép liên kết! ✨");
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      toast.error("Không sao chép được liên kết");
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `12A5 chúc mừng 20/10${targetName ? ` — ${targetName}` : ''}`,
          text: shareText,
          url: activeShareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const openShareWindow = (url: string) => {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
    }
  };

  const shareToWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n\n${activeShareUrl}`)}`;
    openShareWindow(url);
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(activeShareUrl)}&hashtags=20thang10,PhuNuVietNam,12A5`;
    openShareWindow(url);
  };

  const shareToTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(activeShareUrl)}&text=${encodeURIComponent(shareText)}`;
    openShareWindow(url);
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(activeShareUrl)}`;
    openShareWindow(url);
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(activeShareUrl)}`;
    openShareWindow(url);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-modal-title"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-lg rounded-3xl border border-white/20 bg-black/90 p-6 sm:p-8 text-white shadow-[0_25px_70px_rgba(0,0,0,0.8)] backdrop-blur-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="absolute top-5 right-5 rounded-full p-2 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-primary/30 to-pink-500/20 mb-3 border border-white/10">
              <Share2 className="text-primary" size={28} />
            </div>
            <h3 id="share-modal-title" className="font-display text-2xl sm:text-3xl font-black text-white">
              Chia sẻ lời chúc ✨
            </h3>
            <p className="text-white/60 text-xs sm:text-sm mt-1">
              Gửi bất ngờ này cho các bạn nữ hoặc tạo liên kết riêng tặng một người đặc biệt
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex rounded-xl bg-white/5 p-1 mb-6 border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('share')}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'share'
                  ? 'bg-primary text-black shadow-lg font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Send size={14} />
              Chia sẻ nhanh
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('customize')}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'customize'
                  ? 'bg-primary text-black shadow-lg font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Sparkles size={14} />
              Tạo riêng
            </button>
          </div>

          {/* Customize View */}
          {activeTab === 'customize' && (
            <div className="space-y-4 mb-6 text-left">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                  Tên người nhận
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="VD: Linh, Trang, Hương"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                  Mối quan hệ
                </label>
                <select
                  value={customRel}
                  onChange={(e) => setCustomRel(e.target.value as RelationshipType)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#1a0515] border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="partner">Người thương 💖</option>
                  <option value="friend">Bạn thân 🎉</option>
                  <option value="brother">Anh / Em trai 🤜🤛</option>
                  <option value="sister">Chị / Em gái 🌸</option>
                  <option value="mother">Mẹ 💐</option>
                  <option value="father">Bố 👑</option>
                  <option value="daughter">Con gái 🌟</option>
                  <option value="son">Con trai 🚀</option>
                  <option value="family">Gia đình 🏡</option>
                  <option value="mentor">Thầy / Cô 🏆</option>
                  <option value="colleague">Bạn cùng lớp 💼</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                  Tên của bạn (không bắt buộc)
                </label>
                <input
                  type="text"
                  value={customSender}
                  onChange={(e) => setCustomSender(e.target.value)}
                  placeholder="VD: Minh, Hùng"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          )}

          {/* Share Channels Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 mb-6">
            <button
              type="button"
              onClick={shareToWhatsApp}
              aria-label="Chia sẻ qua WhatsApp"
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 transition-all hover:scale-105"
            >
              <span className="text-2xl mb-1">💬</span>
              <span className="text-[11px] font-semibold">WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={shareToTwitter}
              aria-label="Chia sẻ qua X / Twitter"
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400 transition-all hover:scale-105"
            >
              <Twitter size={22} className="mb-1" />
              <span className="text-[11px] font-semibold">X / Twitter</span>
            </button>

            <button
              type="button"
              onClick={shareToTelegram}
              aria-label="Chia sẻ qua Telegram"
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 transition-all hover:scale-105"
            >
              <Send size={22} className="mb-1" />
              <span className="text-[11px] font-semibold">Telegram</span>
            </button>

            <button
              type="button"
              onClick={shareToFacebook}
              aria-label="Chia sẻ qua Facebook"
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 transition-all hover:scale-105"
            >
              <Facebook size={22} className="mb-1" />
              <span className="text-[11px] font-semibold">Facebook</span>
            </button>

            <button
              type="button"
              onClick={shareToLinkedIn}
              aria-label="Chia sẻ qua LinkedIn"
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 transition-all hover:scale-105"
            >
              <Linkedin size={22} className="mb-1" />
              <span className="text-[11px] font-semibold">LinkedIn</span>
            </button>
          </div>

          {/* Copy Link Bar */}
          <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 p-2 mb-4">
            <input
              type="text"
              readOnly
              aria-label="Đường dẫn chia sẻ"
              value={activeShareUrl}
              className="flex-1 bg-transparent px-3 text-xs text-white/80 select-all outline-none truncate font-mono"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              aria-label="Sao chép liên kết chia sẻ"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-black transition-all hover:brightness-110 active:scale-95"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Đã chép!" : "Sao chép"}
            </button>
          </div>

          {/* Native Web Share Button (if supported) */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full py-3 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Share2 size={16} />
              Chia sẻ qua ứng dụng khác
            </button>
          )}

          {/* Footer Branding */}
          <div className="mt-6 text-center text-[10px] text-white/40 tracking-wider uppercase flex items-center justify-center gap-1.5">
            <Heart size={10} className="text-primary fill-primary" />
            <span>Lớp 12A5 • Gửi trọn yêu thương</span>
            <Globe size={10} className="text-white/40" />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
