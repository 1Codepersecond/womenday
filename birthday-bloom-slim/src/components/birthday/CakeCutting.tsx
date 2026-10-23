import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { createPortal } from "react-dom";
import { Cake as CakeIcon } from "lucide-react";
import { useConfetti } from "./Confetti";
import { useSoundManager } from "./SoundManager";
import { KineticText } from "./KineticText";
import { useBirthdayStore } from "@/features/core/store/useBirthdayStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

import { Phase, CakeOption, CAKE_OPTIONS, getCakeName } from "./CakeTypes";
import { CutSparks, MagicDust, PastryCrumbs } from "./CakeVisuals";


// Lời chúc hiện lần lượt sau khi cắt bánh - Con trai 12A5 gửi các bạn nữ nhân ngày 20/10
const QUOTES = [
    { text: "Gửi các bạn nữ lớp 12A5 💐", animation: "zoom-in" as const },
    { text: "Hôm nay là ngày của các cậu, tụi mình xin phép được... cắt bánh hộ! 🎂", animation: "float" as const },
    { text: "Cảm ơn vì đã xinh đẹp, giỏi giang và chịu đựng tụi mình suốt cả năm 😂", animation: "stagger-up" as const },
    { text: "Chúc mừng ngày Phụ nữ Việt Nam 20/10! 🌸", animation: "typewriter-burst" as const },
    { text: "Từ các chàng trai 12A5, với tất cả sự quý mến ✨", animation: "pop-out" as const },
];

const LazyCake3D = lazy(() => import("./Cake3D").then((m) => ({ default: m.Cake3D })));

const CakeCard = ({ cake, onSelect }: {
    cake: CakeOption;
    onSelect: () => void;
}) => {
    const isMobile = useIsMobile();
    const displayName = getCakeName(cake, false, false, false);
    return (
        <motion.button 
            whileHover={!isMobile ? { scale: 1.05, y: -10, rotateZ: 2 } : undefined} 
            whileTap={{ scale: 0.95 }} 
            onClick={onSelect} 
            className="group relative flex flex-col items-center gap-3 p-3 border border-white/10 backdrop-blur-2xl transition-all duration-500 overflow-hidden w-44 sm:w-48" 
            style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))",
                borderRadius: 'var(--card-radius, 2rem)',
                boxShadow: "0 20px 50px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.05)"
            }}
        >
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-2">
                <img src={cake.image} alt={displayName} className={`w-full h-full object-cover transition-transform duration-700 ${!isMobile ? "group-hover:scale-110" : ""}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-3 right-3 text-3xl drop-shadow-2xl">
                    {cake.emoji}
                </div>
            </div>

            <div className="px-2 pb-3 text-center">
                <span className="font-display text-sm font-black tracking-widest uppercase text-white/70 group-hover:text-primary transition-colors">
                    {displayName}
                </span>
                <div className="flex gap-2 justify-center mt-3 mb-4">
                    {cake.layers.map((l, idx) => (
                        <div key={idx} className="w-3 h-3 rounded-full border border-white/20 shadow-lg" style={{ backgroundColor: l }} />
                    ))}
                </div>
                <div 
                    className="inline-flex items-center justify-center whitespace-normal px-3 py-1.5 leading-tight rounded-full text-xs font-bold text-white shadow-lg transition-transform hover:scale-105"
                    style={{ background: cake.accent }}
                >
                    Cắt bánh thôi!
                </div>
            </div>
            
            <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/50 transition-colors pointer-events-none" style={{ borderRadius: 'var(--card-radius, 2rem)' }} />
        </motion.button>
    );
};

export const CakeCutting = () => {
    const isMobile = useIsMobile();
    const prefersReducedMotion = useReducedMotion();
    const storeReducedMotion = useBirthdayStore(state => state.config.reducedMotion);
    const reducedMotion = Boolean(storeReducedMotion || prefersReducedMotion || isMobile);
    const [phase, setPhase] = useState<Phase>("select");
    const [selectedCake, setSelectedCake] = useState<CakeOption | null>(null);
    const [quoteIndex, setQuoteIndex] = useState(-1);
    const [countdownVal, setCountdownVal] = useState<number | string>("");

    const { fireCinematicCelebration } = useConfetti();
    const { playBoom, playReveal, playPop, playWhoosh } = useSoundManager();
    const { name, age, favoriteColor } = useBirthdayStore(state => state.config);
    const primaryColor = favoriteColor || '#FF6B6B';

    const quotes = QUOTES;

    const handleSelectCake = useCallback((cake: CakeOption) => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
        setSelectedCake(cake);
        playPop();
        setPhase("baking"); // Start baking sequence
    }, [playPop]);

    // Handle baking loading screen (snappy 1.0s transition)
    useEffect(() => {
        if (phase === "baking") {
            const t = setTimeout(() => {
                setPhase("blow-intro");
            }, 1000);
            return () => clearTimeout(t);
        }
    }, [phase]);

    const handleCut = useCallback(() => {
        if (phase !== "knife-enter") return;
        setPhase("cutting");
        playWhoosh();
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([80, 50, 160]);

        setTimeout(() => {
            playBoom();
            fireCinematicCelebration();
            setPhase("burst");
            playReveal();
            setTimeout(() => {
                setPhase("quotes");
                setQuoteIndex(0);
            }, 1400);
        }, 1100);
    }, [phase, playWhoosh, playBoom, fireCinematicCelebration, playReveal]);

    const handleBlow = useCallback(() => {
        if (phase !== "blow-intro") return;
        
        const runSequence = async () => {
            // 1. Blow sequence - candle flame extinguishes with realistic rising smoke wisp
            setPhase("blowing");
            if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100]);
            playWhoosh();
            
            // 2. Wish sent
            await new Promise(r => setTimeout(r, 1200));
            setPhase("wish");
            
            // 3. Crisp, exciting countdown
            await new Promise(r => setTimeout(r, 2200));
            setPhase("countdown");
            setCountdownVal(3);
            playPop();
            
            await new Promise(r => setTimeout(r, 800));
            setCountdownVal(2);
            playPop();
            
            await new Promise(r => setTimeout(r, 800));
            setCountdownVal(1);
            playPop();
            
            // 4. True 3D Knife Enters & Hovers over cake
            await new Promise(r => setTimeout(r, 800));
            playReveal();
            setPhase("knife-enter");
        };
        
        runSequence();
    }, [phase, playWhoosh, playPop, playReveal]);

    // Auto-cut fallback if user doesn't press button after knife enters
    useEffect(() => {
        if (phase === "knife-enter") {
            const autoTimer = setTimeout(() => {
                handleCut();
            }, 5500);
            return () => clearTimeout(autoTimer);
        }
    }, [phase, handleCut]);

    // Lock scroll and pause background ambient layers when 3D cake experience is active
    useEffect(() => {
        if (phase !== "select") {
            document.body.style.overflow = 'hidden';
            document.body.classList.add('cake-modal-active');
        } else {
            document.body.style.overflow = 'unset';
            document.body.classList.remove('cake-modal-active');
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.body.classList.remove('cake-modal-active');
        };
    }, [phase]);

    // Auto-advance quotes
    useEffect(() => {
        if (phase !== "quotes" || quoteIndex < 0 || quoteIndex >= quotes.length) return;
        const t = setTimeout(() => {
            if (quoteIndex < quotes.length - 1) setQuoteIndex((i) => i + 1);
        }, 4000);
        return () => clearTimeout(t);
    }, [phase, quoteIndex, quotes.length]);

    // Accessible Escape key handler to exit cake experience
    useEffect(() => {
        if (phase === "select") return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setPhase("select");
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [phase]);

    const cake = selectedCake || CAKE_OPTIONS[0];
    const dustCount = isMobile ? 16 : 40;
    const sparkCount = isMobile ? 16 : 30;

    return (
        <>
            {createPortal(
                <AnimatePresence>
                    {phase !== "select" && (
                        <motion.div 
                            role="dialog"
                            aria-modal="true"
                            aria-label="Trải nghiệm cắt bánh 3D"
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            className={`fixed inset-0 z-[100] flex flex-col items-center justify-start md:justify-center ${isMobile ? "" : "backdrop-blur-md"} overflow-y-auto overscroll-none py-10 md:py-8`} 
                            style={{
                                background: "radial-gradient(circle at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.95) 100%)"
                            }}
                        >
                            <button
                                type="button"
                                aria-label="Đóng trải nghiệm cắt bánh"
                                onClick={() => setPhase("select")}
                                className="fixed top-6 right-6 z-[110] w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center text-xl transition-all shadow-xl backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                ✕
                            </button>
                            <MagicDust count={dustCount} />
                            
                            <AnimatePresence mode="wait">
                                {phase === "baking" && (
                                    <motion.div 
                                        key="baking"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.1 }}
                                        transition={{ duration: 0.5 }}
                                        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md"
                                    >
                                        <div className="relative flex flex-col items-center gap-6">
                                            <div className="relative">
                                                <div
                                                    className="absolute -inset-6 rounded-full animate-pulse pointer-events-none"
                                                    style={{
                                                        background: "radial-gradient(circle, rgba(var(--color-primary-rgb, 255,42,109), 0.35) 0%, transparent 70%)",
                                                    }}
                                                />
                                                <CakeIcon className="w-16 h-16 text-primary animate-bounce relative z-10" />
                                            </div>
                                            <div className="flex flex-col items-center gap-2">
                                                <h2 className="text-3xl md:text-4xl font-display font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-white uppercase">
                                                    Đang nướng bánh...
                                                </h2>
                                                <div className="flex gap-1 mt-2">
                                                    {[1, 2, 3].map((i) => (
                                                        <motion.div
                                                            key={i}
                                                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                                                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                                            className="w-2 h-2 rounded-full bg-primary"
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            
                            <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[100dvh] py-2">
                                <div
                                    className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/15 backdrop-blur-md text-xs font-bold tracking-widest uppercase text-white/90 shadow-lg mb-1"
                                    style={{
                                        background: `linear-gradient(135deg, ${primaryColor}33, rgba(255,255,255,0.06))`,
                                        boxShadow: `0 0 24px ${primaryColor}33`
                                    }}
                                >
                                    <span>{cake.emoji}</span>
                                    <span>{getCakeName(cake, false, false, false)}</span>
                                    {name && (
                                        <>
                                            <span className="text-white/30">•</span>
                                            <span style={{ color: primaryColor }}>{name}</span>
                                        </>
                                    )}
                                    {age > 0 && (
                                        <span
                                            className="px-2 py-0.5 rounded-full text-[10px] font-black text-white"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            {age} ✨
                                        </span>
                                    )}
                                </div>
                                <div className="relative w-full h-[58vh] min-h-[460px] flex justify-center items-center mt-1 overflow-visible">
                                    <Suspense fallback={null}>
                                        <LazyCake3D cake={cake} phase={phase} primaryColor={primaryColor} />
                                    </Suspense>
                                    
                                    {/* Overlays on top of the Cake */}
                                    
                                    {/* Sparks, Crumbs and Burst */}
                                    <AnimatePresence>
                                        {phase === "cutting" && (
                                            <>
                                                <CutSparks count={sparkCount} color={cake.accent} />
                                                <PastryCrumbs count={isMobile ? 18 : 32} color={cake.config.crumbColor || cake.accent} />
                                            </>
                                        )}
                                        {phase === "burst" && <MagicDust count={60} />}
                                    </AnimatePresence>
                                    
                                    {/* Wish Overlay Glow */}
                                    {phase === "wish" && (
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute inset-0 rounded-full pointer-events-none"
                                            style={{
                                                background: "radial-gradient(circle, rgba(255,255,255,0.14) 0%, transparent 70%)",
                                            }}
                                        />
                                    )}
                                    
                                    {/* Countdown Overlay */}
                                    {phase === "countdown" && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 rounded-[2.5rem] pointer-events-none">
                                            <motion.span initial={{ opacity: 0, y: -10 }} animate={{ opacity: 0.5, y: 0 }} className="text-white/40 text-xs md:text-sm tracking-[0.3em] uppercase mb-4 font-bold">
                                                Chuẩn bị cắt bánh
                                            </motion.span>
                                            <AnimatePresence mode="wait">
                                                <motion.div 
                                                    role="status"
                                                    aria-live="polite"
                                                    key={countdownVal} 
                                                    initial={{ scale: 0.3, opacity: 0 }} 
                                                    animate={{
                                                        scale: [0.3, 1.4, 1],
                                                        opacity: 1,
                                                        textShadow: `0 0 40px ${primaryColor}, 0 0 80px ${primaryColor}`
                                                    }} 
                                                    exit={{ scale: 1.8, opacity: 0 }} 
                                                    transition={{ duration: 0.7, ease: "easeOut" }} 
                                                    className="font-display text-8xl md:text-[10rem] font-black text-white"
                                                >
                                                    {countdownVal}
                                                </motion.div>
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>

                                {/* Text Content Below the Cake */}
                                <div className="w-full flex flex-col items-center mt-2 min-h-[140px]">
                                    {/* Blow Sequence Text */}
                                    {(phase === "blow-intro" || phase === "blowing") && (
                                        <motion.div initial={{ scale: 0.8, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="flex flex-col items-center gap-6">
                                            <h2 className="font-display text-3xl sm:text-4xl text-white font-black text-center tracking-tighter animate-glow-pulse">
                                                Ước một điều và thổi nến nào! 🕯️
                                            </h2>
                                            {phase === "blow-intro" && (
                                                <motion.button 
                                                    whileHover={!reducedMotion ? { scale: 1.1 } : undefined} 
                                                    whileTap={{ scale: 0.9 }} 
                                                    onClick={handleBlow} 
                                                    className="group relative px-12 py-5 rounded-full text-xl font-black text-white overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.2)]" 
                                                    style={{ background: "linear-gradient(90deg, #ff0080, #7928ca)" }}
                                                >
                                                    <span className="relative z-10">Thổi nến ngay</span>
                                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                                </motion.button>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* Wish Sent Text */}
                                    {phase === "wish" && (
                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                                            <h2 className="font-display text-4xl sm:text-6xl font-black bg-gradient-to-r from-yellow-200 via-white to-yellow-200 bg-clip-text text-transparent drop-shadow-2xl">
                                                Điều ước đã bay lên các vì sao ✨
                                            </h2>
                                            <p className="text-white/60 text-xl mt-4 font-light italic">Chờ một chút, dao sắp vào rồi...</p>
                                        </motion.div>
                                    )}

                                    {/* Interactive Slice Cake Action */}
                                    {phase === "knife-enter" && (
                                        <motion.div
                                            initial={{ scale: 0.85, opacity: 0, y: 15 }}
                                            animate={{ scale: 1, opacity: 1, y: 0 }}
                                            transition={{ duration: 0.35 }}
                                            className="flex flex-col items-center gap-3"
                                        >
                                            <motion.button
                                                whileHover={!reducedMotion ? { scale: 1.08, y: -2 } : undefined}
                                                whileTap={{ scale: 0.94 }}
                                                onClick={handleCut}
                                                className="group relative px-10 py-4.5 rounded-full text-lg sm:text-xl font-black text-white overflow-hidden shadow-[0_10px_35px_rgba(255,255,255,0.25)] border border-white/20 backdrop-blur-md transition-all"
                                                style={{
                                                    background: `linear-gradient(135deg, ${cake.accent}, #ff0080)`,
                                                }}
                                            >
                                                <span className="relative z-10 flex items-center gap-2">
                                                    <span>Cắt bánh nào ✨</span>
                                                    <span>🎂</span>
                                                </span>
                                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-400" />
                                            </motion.button>
                                            <p className="text-white/60 text-xs sm:text-sm tracking-widest uppercase font-medium animate-pulse">
                                                Chạm để cắt bánh
                                            </p>
                                        </motion.div>
                                    )}
                                    
                                    {/* Quotes Sequence Text */}
                                    {phase === "quotes" && (
                                        <div className="text-center w-full max-w-2xl">
                                            <AnimatePresence mode="wait">
                                                {quoteIndex >= 0 && (
                                                    <motion.div key={quoteIndex} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.8 }} className="flex items-center justify-center">
                                                        <p className={`text-3xl sm:text-4xl md:text-6xl font-display font-black leading-tight ${
                                                            quoteIndex === quotes.length - 1 
                                                                ? "bg-gradient-to-r from-primary via-white to-primary bg-clip-text text-transparent animate-gradient-shift drop-shadow-[0_0_30px_var(--color-primary)]" 
                                                                : "text-white"
                                                        } `}>
                                                            <KineticText text={quotes[quoteIndex].text} animation={quotes[quoteIndex].animation} delay={100} />
                                                        </p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>

                                {/* End Button */}
                                {phase === "quotes" && quoteIndex >= quotes.length - 1 && (
                                    <motion.button 
                                        initial={{ opacity: 0, y: 20 }} 
                                        animate={{ opacity: 1, y: 0 }} 
                                        onClick={() => setPhase("select")} 
                                        className="mt-16 px-10 py-4 rounded-full text-sm font-black uppercase tracking-[0.3em] text-white/40 hover:text-white border border-white/10 hover:bg-white/5 transition-all duration-500"
                                    >
                                        ✕ Kết thúc
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            <div id="cake-section" className="relative z-20 py-4">
                <div className="max-w-6xl mx-auto text-center">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }} 
                        whileInView={{ opacity: 1, y: 0 }} 
                        className="font-display text-4xl sm:text-6xl md:text-8xl font-black mb-6 bg-gradient-to-b from-white to-white/20 bg-clip-text text-transparent"
                    >
                        Chọn bánh tặng các bạn nữ 💐
                    </motion.h2>
                    <p className="text-white/40 text-lg sm:text-xl mb-12 sm:mb-20 max-w-2xl mx-auto font-light tracking-widest uppercase">
                        Quà 20/10 từ các chàng trai 12A5
                    </p>

                    <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
                        {CAKE_OPTIONS.map((c) => (
                            <CakeCard key={c.id} cake={c} onSelect={() => handleSelectCake(c)} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};
