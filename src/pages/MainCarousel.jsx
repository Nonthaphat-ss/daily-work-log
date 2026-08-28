import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ColorBends from '../components/ColorBends';
import { useAuth } from '../contexts/AuthContext';

export default function MainCarousel() {
    const navigate = useNavigate();

    const { currentUser, login, logout } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(loginEmail, loginPassword);
            setShowLoginModal(false);
            alert("เข้าสู่ระบบเรียบร้อย ");
        } catch (error) {
            alert("เข้าสู่ระบบล้มเหลว: " + error.message);
        }
    };

    // ตัวแปรเช็ค Responsive
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const images = import.meta.glob('../assets/torii/*.{png,jpg,jpeg}', { eager: true });

    // ข้อมูลการ์ด 10 ใบ
    const cards = [
        { uid: 0, title: 'Daily Work', subtitle: 'ระบบบันทึกงานประจำวัน', path: '/work-log', img: images['../assets/torii/Gate1.jpg']?.default },
        { uid: 1, title: 'Notes Board', subtitle: 'กระดานโน้ตแปะไอเดีย', path: '/notes', img: images['../assets/torii/Gate2.jpg']?.default },
        { uid: 2, title: 'Nebula', subtitle: 'จัดเก็บดวงดาว', path: '/galaxy', img: images['../assets/torii/Gate3.jpg']?.default },
        { uid: 3, title: 'Analytics', subtitle: 'สถิติและรายงานผล', path: '#', img: images['../assets/torii/Gate4.jpg']?.default },
        { uid: 4, title: 'Coming Soon', subtitle: 'รออัปเดตฟีเจอร์ใหม่', path: '#', img: images['../assets/torii/Gate5.jpg']?.default },
        { uid: 5, title: 'Coming Soon', subtitle: 'รออัปเดตฟีเจอร์ใหม่', path: '#', img: images['../assets/torii/Gate6.jpg']?.default },
        { uid: 6, title: 'Coming Soon', subtitle: 'รออัปเดตฟีเจอร์ใหม่', path: '#', img: images['../assets/torii/Gate7.jpg']?.default },
        { uid: 7, title: 'Coming Soon', subtitle: 'รออัปเดตฟีเจอร์ใหม่', path: '#', img: images['../assets/torii/Gate8.jpg']?.default },
        { uid: 8, title: 'Coming Soon', subtitle: 'รออัปเดตฟีเจอร์ใหม่', path: '#', img: images['../assets/torii/Gate9.jpg']?.default },
        { uid: 9, title: 'Coming Soon', subtitle: 'รออัปเดตฟีเจอร์ใหม่', path: '#', img: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=800&q=80' }
    ];

    const totalCards = cards.length;
    const angleStep = 360 / totalCards;

    // State สำหรับ Desktop
    const [carouselAngle, setCarouselAngle] = useState(0);
    const targetAngleRef = useRef(0);
    const currentAngleRef = useRef(0);
    const isDraggingRef = useRef(false);
    const isHoveredRef = useRef(false);
    const startXRef = useRef(0);
    const startAngleRef = useRef(0);

    // State สำหรับ Mobile
    const [mobileIndex, setMobileIndex] = useState(0);
    const mobileStartXRef = useRef(0);

    // State สำหรับ Intro
    const [introProgress, setIntroProgress] = useState(0);
    const [isIntroDone, setIsIntroDone] = useState(false);
    const isIntroDoneRef = useRef(false);

    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    let normalizedAngle = carouselAngle % 360;
    if (normalizedAngle > 0) normalizedAngle -= 360;
    const activeIndex = Math.round(Math.abs(normalizedAngle) / angleStep) % totalCards;
    const activeTitle = cards[activeIndex].title;

    useEffect(() => {
        let start = null;
        const duration = 2000;
        const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 4);
            setIntroProgress(easeOut);

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                setIsIntroDone(true);
                isIntroDoneRef.current = true;
            }
        };
        requestAnimationFrame(step);
    }, []);

    useEffect(() => {
        if (!isIntroDone) return;
        setIsTyping(true);
        let i = 0;
        const speed = 60;
        const typingInterval = setInterval(() => {
            setDisplayedText(activeTitle.substring(0, i + 1));
            i++;
            if (i >= activeTitle.length) {
                clearInterval(typingInterval);
                setIsTyping(false);
            }
        }, speed);
        return () => clearInterval(typingInterval);
    }, [activeTitle, isIntroDone]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        let animationFrameId;
        const animate = () => {
            if (!isMobile) {
                if (isIntroDoneRef.current && !isDraggingRef.current && !isHoveredRef.current) {
                    targetAngleRef.current -= 0.15;
                }
                currentAngleRef.current += (targetAngleRef.current - currentAngleRef.current) * 0.08;
                setCarouselAngle(currentAngleRef.current);
            }
            animationFrameId = requestAnimationFrame(animate);
        };
        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, [isMobile]);

    const handleStart = (clientX) => {
        isDraggingRef.current = true;
        startXRef.current = clientX;
        startAngleRef.current = targetAngleRef.current;
    };
    const handleMove = (clientX) => {
        if (!isDraggingRef.current) return;
        const deltaX = clientX - startXRef.current;
        targetAngleRef.current = startAngleRef.current + deltaX * 0.25;
    };
    const handleEnd = () => { isDraggingRef.current = false; };

    const handleMobileStart = (clientX) => { mobileStartXRef.current = clientX; };
    const handleMobileEnd = (clientX) => {
        const deltaX = clientX - mobileStartXRef.current;
        if (deltaX < -40) {
            setMobileIndex((prev) => (prev + 1) % totalCards);
        } else if (deltaX > 40) {
            setMobileIndex((prev) => (prev - 1 + totalCards) % totalCards);
        }
    };

    const handleCardClick = (index, path) => {
        if (Math.abs(targetAngleRef.current - startAngleRef.current) > 10) return;
        if (index === activeIndex) {
            if (path !== '#') navigate(path);
        } else {
            const currentMod = Math.floor(targetAngleRef.current / 360) * 360;
            let target1 = currentMod - index * angleStep;
            let target2 = target1 > targetAngleRef.current ? target1 - 360 : target1 + 360;
            const d1 = Math.abs(target1 - targetAngleRef.current);
            const d2 = Math.abs(target2 - targetAngleRef.current);
            targetAngleRef.current = d1 < d2 ? target1 : target2;
        }
    };

    const orbitRadius = 580;

    return (
        <div
            className="min-h-screen bg-[#fcfcfc] overflow-hidden relative select-none"
            style={{ fontFamily: "'New York', 'Times New Roman', serif" }}
            onMouseDown={(e) => isMobile ? handleMobileStart(e.clientX) : handleStart(e.clientX)}
            onMouseMove={(e) => !isMobile && handleMove(e.clientX)}
            onMouseUp={(e) => isMobile ? handleMobileEnd(e.clientX) : handleEnd()}
            onMouseLeave={() => !isMobile && handleEnd()}
            onTouchStart={(e) => isMobile ? handleMobileStart(e.touches[0].clientX) : handleStart(e.touches[0].clientX)}
            onTouchMove={(e) => !isMobile && handleMove(e.touches[0].clientX)}
            onTouchEnd={(e) => isMobile ? handleMobileEnd(e.changedTouches[0].clientX) : handleEnd()}
        >

            {/* พื้นหลัง ColorBends */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <ColorBends
                    colors={['#FFB6C1', '#A0C4FF', '#E0BBE4']}
                    transparent={true} speed={0} mouseInfluence={0} iterations={1} noise={0.05}
                />
            </div>

            {!isMobile ? (
                <>
                    {/* โซนล้อหมุน (Desktop) */}
                    <div
                        className="absolute top-[85%] left-1/2 w-0 h-0 z-10 pointer-events-none"
                        style={{ transform: `rotate(${carouselAngle}deg)` }}
                        onMouseEnter={() => (isHoveredRef.current = true)}
                        onMouseLeave={() => (isHoveredRef.current = false)}
                    >
                        {cards.map((card, index) => {
                            const isActive = index === activeIndex;
                            return (
                                <div
                                    key={card.uid}
                                    className="absolute pointer-events-auto cursor-pointer"
                                    style={{
                                        marginLeft: '-110px',
                                        marginTop: '-150px',
                                        transform: `rotate(${index * angleStep * introProgress}deg) translateY(-${orbitRadius}px)`,
                                        opacity: introProgress,
                                    }}
                                    onClick={() => handleCardClick(index, card.path)}
                                >
                                    <div className={`relative overflow-hidden bg-white rounded-[32px] transition-all duration-300 ease-out w-[220px] h-[300px] ${isActive ? 'scale-110 shadow-2xl ring-[6px] ring-white brightness-100 z-50' : 'scale-95 shadow-lg brightness-90 hover:brightness-100 z-10'}`}>
                                        <img src={card.img} alt={card.title} className="w-full h-full object-cover pointer-events-none transition-transform duration-700 hover:scale-110" />
                                        <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
                                        <div className={`absolute inset-0 flex flex-col justify-end items-center pb-5 transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                                            <div className="bg-[#1d1d1f] text-white px-5 py-2.5 rounded-full font-bold flex items-center gap-2 text-sm shadow-xl hover:scale-105 transition-transform">
                                                Enter <ArrowRight size={14} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* โซนข้อความหลัก (Desktop) */}
                    <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center w-full max-w-4xl px-6 pointer-events-none">
                        <div className="text-center w-full pointer-events-auto mt-15">
                            <h1 className="text-[52px] font-serif text-[#1d1d1f] tracking-tight mb-4 drop-shadow-sm leading-[1.1] min-h-[120px]">
                                {displayedText}
                                {isTyping && <span className="animate-pulse font-light opacity-60">|</span>}
                                {!isIntroDone && !isTyping && <span className="opacity-0">_</span>}
                                <br /> Instantly
                            </h1>
                            <p className="text-gray-500 font-medium text-base max-w-md mx-auto mb-3 transition-all duration-300">
                                {cards[activeIndex].subtitle}
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-10 mt-5 pt-5 border-t border-gray-200 w-3/4 mx-auto px-8 pointer-events-auto">
                            <div className="text-center">
                                <h3 className="text-[#1d1d1f] font-serif font-bold text-lg mb-2">Smart Organization</h3>
                                <p className="text-[12px] text-gray-400 leading-relaxed">จัดระเบียบข้อมูลและงานประจำวันให้เป็นระบบ</p>
                            </div>
                            <div className="text-center relative">
                                <div className="absolute left-[-24px] top-1/2 -translate-y-1/2 w-[1px] h-12 bg-gray-200"></div>
                                <h3 className="text-[#1d1d1f] font-serif font-bold text-lg mb-2">Real-time Tracking</h3>
                                <p className="text-[12px] text-gray-400 leading-relaxed">ตรวจสอบและติดตามสถานะงานได้ทันที</p>
                                <div className="absolute right-[-24px] top-1/2 -translate-y-1/2 w-[1px] h-12 bg-gray-200"></div>
                            </div>
                            <div
                                className="text-center cursor-pointer hover:opacity-70 transition-opacity"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    currentUser ? logout() : setShowLoginModal(true);
                                }}
                            >
                                <h3 className="text-[#1d1d1f] font-serif font-bold text-lg mb-2">
                                    {currentUser ? "Connected to Cloud" : "Secure & Reliable"}
                                </h3>
                                <p className="text-[12px] text-gray-400 leading-relaxed">
                                    {currentUser ? "เข้าสู่ระบบในฐานะ Admin แล้ว (คลิกเพื่อออก)" : "มั่นใจความถูกต้องและปลอดภัยของข้อมูล"}
                                </p>
                            </div>
                        </div>
                    </div>
                </>

            ) : (

                /* โซนจอมือถือ (กองการ์ด) */
                <>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 z-20 pointer-events-none">
                        <div className="relative w-[260px] h-[360px] pointer-events-auto mt-[-40px]">
                            {cards.map((card, i) => {
                                const offset = (i - mobileIndex + totalCards) % totalCards;
                                let transformStyle = '';
                                let opacity = 1;
                                let zIndex = totalCards - offset;

                                if (offset === 0) {
                                    transformStyle = 'translateX(0) translateY(0) rotate(0deg)';
                                } else if (offset === totalCards - 1) {
                                    transformStyle = 'translateX(-150%) rotate(-20deg)';
                                    opacity = 0;
                                } else {
                                    transformStyle = `translateY(${offset * 18}px) scale(${1 - offset * 0.06})`;
                                    opacity = offset > 3 ? 0 : 1;
                                }

                                return (
                                    <div
                                        key={card.uid}
                                        className="absolute inset-0 bg-white rounded-[32px] shadow-2xl overflow-hidden cursor-pointer border border-gray-100"
                                        style={{
                                            transform: transformStyle,
                                            opacity,
                                            zIndex,
                                            transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
                                        }}
                                        onClick={() => {
                                            if (offset === 0 && card.path !== '#') navigate(card.path);
                                        }}
                                    >
                                        <img src={card.img} alt={card.title} className="w-full h-full object-cover pointer-events-none" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                                        <div className={`absolute inset-x-0 bottom-0 p-6 flex flex-col items-center transition-opacity duration-300 ${offset === 0 ? 'opacity-100' : 'opacity-0'}`}>
                                            <div className="bg-[#1d1d1f] text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 text-sm shadow-xl">
                                                Enter <ArrowRight size={14} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-14 text-center px-6 pointer-events-auto">
                            <h1 className="text-[32px] font-serif text-[#1d1d1f] mb-2 drop-shadow-sm transition-all duration-300">
                                {cards[mobileIndex].title}
                            </h1>
                            <p className="text-gray-500 font-medium text-sm transition-all duration-300 max-w-[250px] mx-auto">
                                {cards[mobileIndex].subtitle}
                            </p>
                            <p
                                className="text-gray-400 font-semibold text-[11px] mt-8 tracking-[0.2em] uppercase cursor-pointer hover:text-gray-600 transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    currentUser ? logout() : setShowLoginModal(true);
                                }}
                            >
                                {currentUser ? "☁️ Cloud Connected (Tap to Logout)" : "← Swipe to explore → (Login)"}
                            </p>
                        </div>
                    </div>
                </>
            )}

            {showLoginModal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md"
                    onClick={() => setShowLoginModal(false)} // กดพื้นที่ว่างด้านนอกเพื่อปิด
                >
                    <div
                        className="bg-white/95 backdrop-blur-xl border border-white/40 p-8 rounded-3xl shadow-2xl w-[340px] flex flex-col gap-4 pointer-events-auto transition-all"
                        onClick={(e) => e.stopPropagation()} // ป้องกันไม่ให้คลิกข้างในกล่องแล้ว Modal ปิด
                    >
                        <h2 className="text-2xl font-serif font-bold text-center text-[#1d1d1f] mb-1">System Access</h2>
                        <p className="text-xs text-gray-400 text-center -mt-3 mb-2">เข้าสู่ระบบเพื่อเชื่อมต่อข้อมูล Cloud</p>

                        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3">
                            <input
                                type="email"
                                placeholder="Email"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-black transition-colors"
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleLoginSubmit(e);
                                }}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-black transition-colors"
                                required
                            />

                            <div className="flex gap-2 mt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowLoginModal(false)}
                                    className="flex-1 py-2.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl text-sm font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-[#1d1d1f] text-white rounded-xl text-sm font-semibold hover:bg-black transition-colors shadow-lg active:scale-95"
                                >
                                    Login
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}