import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../ts/firebase'; // firebase.ts에서 가져오기
import { onAuthStateChanged } from 'firebase/auth'; // 로그인 상태 확인을 위한 Firebase 함수
import '../css/IntroPage.css';  // 스타일 연결
import umlTitle from '../resource/umlTitle.png';

const IntroPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null); // Firebase 사용자
    const [userInfo, setUserInfo] = useState<{ name: string, position: string } | null>(null); // Firestore 사용자 정보

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                // localStorage에서 사용자 정보 로드
                const storedData = localStorage.getItem("userData");
                if (storedData) {
                    const parsedData = JSON.parse(storedData);
                    setUserInfo({
                        name: parsedData.name || '사용자',
                        position: parsedData.position || '직급 없음'
                    });
                } else {
                    console.warn("localStorage에 사용자 정보가 없습니다.");
                }
            } else {
                setUserInfo(null);
            }
        });

        return () => unsubscribe();
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
                    <img src={umlTitle} alt="로고" className="logo" />
                    <span className="banner-text">무료 UML 도구로 언제든지 UML 다이어그램을 작성하세요</span>
                    <button className="get-app-btn" onClick={handleStartClick}>UML Tool 시작하기</button>
                </div>
            </header>

            <nav className="top-nav">
                <div className="nav-left">
                    <p id="title-logo">UML CONSTRUCTOR</p>
                    <ul>
                        <li>소개</li>
                        <li>기능</li>
                        <li>이용 방법</li>
                    </ul>
                </div>
                <div className="nav-right">
                    {user ? (
                        <div className="user-info">
                            <span className="user-name">
                                {userInfo?.name || '사용자'} ({userInfo?.position || '직급 없음'})
                            </span>
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
                </div>
                <div className="hero-image">
                    <img src="/images/uml-hero.png" alt="UML Tool 소개 이미지" />
                </div>
            </main>
        </div>
    );
};

export default IntroPage;
