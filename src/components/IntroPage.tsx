import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../ts/firebase'; // firebase.ts에서 가져오기
import { onAuthStateChanged } from 'firebase/auth'; // 로그인 상태 확인을 위한 Firebase 함수
import '../css/IntroPage.css';  // 스타일 연결

const IntroPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null); // 로그인한 사용자 정보

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser); // 현재 사용자 상태를 업데이트
        });

        return () => unsubscribe(); // 컴포넌트 언마운트 시 구독 해제
    }, []);

    const handleStartClick = () => {
        if (user) {
            navigate('/app'); // 로그인된 사용자는 바로 /app으로 이동
        } else {
            navigate('/login'); // 로그인되지 않은 사용자는 로그인 페이지로 이동
        }
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            setUser(null); // 로그아웃 후 사용자 상태 초기화
            navigate('/'); // 로그아웃 후 메인 페이지로 이동
        } catch (error) {
            console.error('로그아웃 실패:', error);
        }
    };

    return (
        <div className="intro-page">
            <header className="top-banner">
                <div className="banner-content">
                    <img src="/logo.png" alt="로고" className="logo" />
                    <span className="banner-text">무료 UML 도구로 언제든지 UML 다이어그램을 작성하세요</span>
                    <button className="get-app-btn" onClick={handleStartClick}>UML Tool 시작하기</button>
                </div>
            </header>

            <nav className="top-nav">
                <div className="nav-left">
                    <img src="/logo.png" alt="logo" className="nav-logo" />
                    <ul>
                        <li>소개</li>
                        <li>기능</li>
                        <li>이용 방법</li>
                    </ul>
                </div>
                <div className="nav-right">
                    {user ? (
                        <div className="user-info">
                            <span className="user-name">{user.displayName || '사용자'}</span>
                            <button className="logout-btn" onClick={handleLogout}>로그아웃</button>
                        </div>
                    ) : (
                        <button className="login-btn" onClick={() => navigate('login')}>로그인</button>
                    )}
                </div>
            </nav>

            <main className="hero-section">
                <div className="hero-text">
                    <h1><strong>UML Constructor</strong>로 더 빠르고 정확한 설계</h1>
                    <p>쉽고 강력한 UML 도구를 통해 요구사항 정의부터 설계까지 한 번에 처리해보세요.</p>
                    <button className="cta-btn" onClick={handleStartClick}>지금 시작하기</button>
                </div>
                <div className="hero-image">
                    <img src="/images/uml-hero.png" alt="UML Tool 소개 이미지" />
                </div>
            </main>
        </div>
    );
};

export default IntroPage;
