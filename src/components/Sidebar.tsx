import React from 'react';
import '../css/Sidebar.css';

function Sidebar({ openModal }: { openModal: (modalType: string) => void }) {
    return (
        <div className="sidebar">
            <h1 className="title">UML Constructor</h1>
            <div className="user-info">
                <p>이름: [내 이름]</p>
                <hr></hr>
                <p>조직: [내 조직]</p>
                <p>직급: [내 직급]</p>
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
