import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSoundManager } from "@/components/birthday/SoundManager";
import { useConfetti } from "@/components/birthday/Confetti";
import { Trophy, Star, Heart, Flame, Sparkles, CheckCircle2, XCircle } from "lucide-react";
interface Question {
    q: string;
    options: string[];
    correct: number;
    reason: string;
}

// Quiz 20/10 - Con trai 12A5 tặng các bạn nữ
const QUESTIONS: Question[] = [
    {
        q: "Ngày 20/10 hằng năm là ngày gì?",
        options: ["Ngày Nhà giáo Việt Nam", "Ngày Phụ nữ Việt Nam", "Ngày Quốc tế Thiếu nhi", "Ngày Valentine"],
        correct: 1,
        reason: "Chuẩn rồi! 20/10 là Ngày Phụ nữ Việt Nam - ngày để tụi mình nói lời cảm ơn các cậu 💐"
    },
    {
        q: "Ai là những người xinh đẹp, giỏi giang nhất lớp 12A5?",
        options: ["Các bạn nam", "Thầy chủ nhiệm", "Các bạn nữ 12A5", "Con ma-nơ-canh góc lớp"],
        correct: 2,
        reason: "Không cần bàn cãi! Các bạn nữ 12A5 là số một, cả lớp đều công nhận 🌸"
    },
    {
        q: "Nhiệm vụ quan trọng nhất của con trai 12A5 hôm nay là gì?",
        options: ["Ngủ gật trong giờ", "Mượn vở các bạn nữ chép bài", "Chúc mừng và nghe lời các bạn nữ 😆", "Trốn tiết cuối"],
        correct: 2,
        reason: "Hôm nay các cậu là nữ hoàng, tụi mình xin vâng lời tuyệt đối!"
    },
    {
        q: "Điều gì làm lớp 12A5 sáng bừng lên mỗi ngày?",
        options: ["Bóng đèn huỳnh quang", "Ánh nắng ngoài cửa sổ", "Nụ cười của các bạn nữ", "Màn hình máy chiếu"],
        correct: 2,
        reason: "Đúng thế! Nụ cười của các cậu làm cả lớp vui hơn hẳn ✨"
    },
    {
        q: "Nếu các bạn nữ 12A5 là siêu anh hùng, tên của họ sẽ là gì?",
        options: ["Captain Ngủ Gật", "Người Hay Quên Bài", "Siêu Nhân Nữ 12A5 💪", "Iron Cà Phê"],
        correct: 2,
        reason: "Hôm nay, các cậu chính là những siêu anh hùng của lớp mình!"
    }
];

export const BirthdayQuiz = () => {
    const { playPop, playReveal, playBoom } = useSoundManager();
    const { fireCannon, fireStars } = useConfetti();
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selected, setSelected] = useState<number | null>(null);
    const questions = QUESTIONS;
    const handleSelect = (index: number) => {
        if (selected !== null)
            return;
        setSelected(index);
        playPop();
        if (index === questions[currentIdx].correct) {
            setScore(prev => prev + 1);
            playReveal();
        }
        setTimeout(() => {
            if (currentIdx + 1 < questions.length) {
                setCurrentIdx(prev => prev + 1);
                setSelected(null);
            }
            else {
                setShowResult(true);
                playBoom();
                fireCannon();
            }
        }, 2200);
    };
    return (<section className="relative z-20 px-4 py-20 max-w-4xl mx-auto" aria-label="Quiz chúc mừng 20/10">
      <h2 className="sr-only">Quiz chúc mừng 20/10</h2>
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-8 md:p-12 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl text-center">
        {!showResult ? (<AnimatePresence mode="wait">
            <motion.div key={currentIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="flex justify-between items-center text-sm font-bold tracking-widest text-primary uppercase">
                <span>Câu {currentIdx + 1} / {questions.length}</span>
                <span>Điểm: {score}</span>
              </div>

              <h3 className="font-display text-2xl md:text-4xl font-bold leading-tight min-h-[4rem] flex items-center justify-center">
                {questions[currentIdx].q}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questions[currentIdx].options.map((opt, i) => {
                const isSelected = selected === i;
                const isCorrect = i === questions[currentIdx].correct;
                let btnStyle = "bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/50 text-foreground";
                if (selected !== null) {
                    if (isCorrect)
                        btnStyle = "bg-green-500/20 border-green-500 text-green-300 scale-102";
                    else if (isSelected)
                        btnStyle = "bg-red-500/20 border-red-500 text-red-300";
                    else
                        btnStyle = "bg-white/5 border-white/5 opacity-40";
                }
                return (<button key={i} type="button" aria-label={`Đáp án ${i + 1}: ${opt}`} aria-pressed={isSelected} disabled={selected !== null} onClick={() => handleSelect(i)} className={`p-5 rounded-2xl border text-lg md:text-xl font-medium transition-all duration-300 text-left flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${btnStyle}`}>
                      <span>{opt}</span>
                      {selected !== null && isCorrect && <CheckCircle2 className="text-green-400 shrink-0"/>}
                      {selected !== null && isSelected && !isCorrect && <XCircle className="text-red-400 shrink-0"/>}
                    </button>);
            })}
              </div>

              {selected !== null && (<motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-muted-foreground italic text-lg pt-4 border-t border-white/5">
                  {questions[currentIdx].reason}
                </motion.p>)}
            </motion.div>
          </AnimatePresence>) : (<motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 py-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Trophy size={100} className="text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]"/>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute -inset-4 border-2 border-dashed border-yellow-400/30 rounded-full"/>
              </div>
            </div>
            
            <h2 className="font-display text-4xl md:text-6xl font-black">ĐIỂM SỐ HUYỀN THOẠI! 🏆</h2>
            <p className="text-2xl md:text-3xl text-foreground/80">
              Các cậu đã đạt{" "}
              <span className="text-primary font-black">{score}/{questions.length}</span>
              {" "}điểm ở Quiz 20/10 của 12A5!
            </p>
            
            <div className="flex justify-center gap-4 text-primary">
              <Star className="animate-pulse"/>
              <Heart className="animate-bounce"/>
              <Flame className="animate-pulse"/>
              <Sparkles className="animate-bounce"/>
            </div>

            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => {
                setCurrentIdx(0);
                setScore(0);
                setShowResult(false);
                setSelected(null);
                fireStars();
            }} className="px-10 py-4 bg-primary text-white rounded-full font-black tracking-widest uppercase text-sm shadow-2xl shadow-primary/30">
              Chơi lại 🔄
            </motion.button>
          </motion.div>)}
      </motion.div>
    </section>);
};
