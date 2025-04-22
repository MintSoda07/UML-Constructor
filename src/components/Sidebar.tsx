import React, { useEffect, useState } from 'react';
import '../css/Sidebar.css';

interface Organization {
    id: string;
    name: string;
}

interface UserData {
    name: string;
    organization: Organization;
    position: string;
}

function Sidebar({ openModal }: { openModal: (modalType: string) => void }) {
    const [userData, setUserData] = useState<UserData | null>(null);

    useEffect(() => {
        const storedData = localStorage.getItem('userData');
        if (storedData) {
            const parsed = JSON.parse(storedData);
            setUserData({
                name: parsed.name || '알 수 없음',
                organization: parsed.organization || { id: '', name: '알 수 없음' },
                position: parsed.position || '알 수 없음',
            });
        }
    }, []);

    return (
        <div className="sidebar">
            <h1 className="title">UML Constructor</h1>
            <div className="user-info">
                <p>이름: {userData?.name || '로딩 중...'}</p>
                <p>조직: {userData?.organization?.name || '로딩 중...'}</p>
                <p>직급: {userData?.position || '로딩 중...'}</p>
            </div>
            <div className="menu">
                <button onClick={() => openModal('create')}>프로젝트 생성</button>
                <button onClick={() => openModal('open')}>프로젝트 열기</button>
                <button>개발 조직 관리</button>
                <button>비즈니스 관리</button>
            </div>
        </div>
    );
}

export default Sidebar;
