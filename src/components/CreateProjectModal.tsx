// src/components/CreateProjectModal.tsx
import React, { useState } from 'react';

interface CreateProjectModalProps {
    closeModal: () => void; // 함수 타입 정의
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ closeModal }) => {
    const [projectName, setProjectName] = useState('');
    const [projectCode, setProjectCode] = useState('');
    const [projectManager, setProjectManager] = useState('');

    const handleCreateProject = () => {
        // Firestore에 데이터 저장 작업
        console.log("프로젝트 생성 완료");
        closeModal();
    };

    return (
        <div className="modal-content">
            <h2>프로젝트 생성</h2>
            <label>프로젝트명</label>
            <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
            />
            <label>프로젝트 식별코드</label>
            <input
                type="text"
                value={projectCode}
                onChange={(e) => setProjectCode(e.target.value)}
            />
            <label>책임자</label>
            <input
                type="text"
                value={projectManager}
                onChange={(e) => setProjectManager(e.target.value)}
            />
            <button onClick={handleCreateProject}>생성 확인</button>
            <button onClick={closeModal}>닫기</button>
        </div>
    );
};

export default CreateProjectModal;
