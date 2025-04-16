import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../ts/firebase'; // firebase.ts에서 가져오기
import '../css/LoginPage.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
    const [passwordVisible, setPasswordVisible] = useState(false); // 비밀번호 표시 토글

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); // 로그인 시 오류 메시지 초기화
        setIsLoading(true); // 로딩 시작

        // 이메일 형식 확인
        if (!email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) {
            setIsLoading(false);
            setError('올바른 이메일 주소를 입력하세요.');
            return;
        }

        // 비밀번호 길이 확인 (최소 6자 이상)
        if (password.length < 6) {
            setIsLoading(false);
            setError('비밀번호는 최소 6자 이상이어야 합니다.');
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/app');
        } catch (err: any) {
            setIsLoading(false); // 로그인 실패 시 로딩 종료
            if (err.code === 'auth/user-not-found') {
                setError('이메일 주소를 찾을 수 없습니다.');
            } else if (err.code === 'auth/wrong-password') {
                setError('잘못된 비밀번호입니다.');
            } else {
                setError('로그인 실패: ' + err.message);
            }
        }
    };

    return (
        <div className="login-page">
            <div className="login-box">
                <h2>로그인</h2>
                <form onSubmit={handleLogin}>
                    <label>이메일</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label>비밀번호</label>
                    <div className="password-container">
                        <input
                            type={passwordVisible ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setPasswordVisible(!passwordVisible)}
                        >
                            {passwordVisible ? '숨기기' : '보기'}
                        </button>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? '로그인 중...' : '로그인'}
                    </button>
                </form>

                <div className="login-links">
                    <span onClick={() => navigate('/signup')}>계정이 없으신가요? 회원가입</span>
                    <span onClick={() => alert('비밀번호 재설정 링크 발송')}>비밀번호를 잊으셨나요?</span>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
