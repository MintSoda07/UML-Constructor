import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../ts/firebase';
import { doc, getDoc } from 'firebase/firestore';
import '../css/LoginPage.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) {
            setIsLoading(false);
            setError('올바른 이메일 주소를 입력하세요.');
            return;
        }

        if (password.length < 6) {
            setIsLoading(false);
            setError('비밀번호는 최소 6자 이상이어야 합니다.');
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("로그인 성공, UID:", user.uid);

            const userDocRef = doc(db, "userData", user.uid);
            const userSnapshot = await getDoc(userDocRef);

            if (userSnapshot.exists()) {
                const userData = userSnapshot.data();

                let organizationData = { id: '', name: '' };

                if (userData.organization) {
                    const orgRef = userData.organization; // DocumentReference
                    const orgSnap = await getDoc(orgRef);
                    if (orgSnap.exists()) {
                        organizationData = {
                            id: orgRef.id,
                            name: (orgSnap.data() as { name: string }).name,
                        };
                    }
                }

                const fullUserData = {
                    name: userData.name,
                    position: userData.position,
                    description: userData.description,
                    organization: organizationData,
                };

                localStorage.setItem("userData", JSON.stringify(fullUserData));
            } else {
                console.warn("Firestore에 사용자 정보가 존재하지 않습니다.");
            }

            navigate('/app');
        } catch (err: any) {
            setIsLoading(false);
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
