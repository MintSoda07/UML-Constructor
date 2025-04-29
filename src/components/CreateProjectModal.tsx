import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../ts/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // ✅ 추가

interface CreateProjectModalProps {
    closeModal: () => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ closeModal }) => {
    const [projectName, setProjectName] = useState('');
    const [projectCode, setProjectCode] = useState('');
    const [projectManager, setProjectManager] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const navigate = useNavigate();

    const handleCreateProject = async () => {
        if (!projectName.trim() || !projectCode.trim() || !projectManager.trim()) {
            alert('모든 항목을 입력해주세요.');
            return;
        }

        setIsCreating(true);

        try {
            const storedData = localStorage.getItem('userData');
            if (!storedData) throw new Error('유저 데이터가 없습니다.');

            const parsedUserData = JSON.parse(storedData);
            const organizationId = parsedUserData.organization?.id;
            if (!organizationId) throw new Error('조직 ID가 없습니다.');

            const auth = getAuth();
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error('로그인된 사용자가 없습니다.');

            const userId = currentUser.uid;

            // 프로젝트 생성
            const projectRef = doc(db, 'organization', organizationId, 'project', projectCode);
            await setDoc(projectRef, {
                name: projectName,
                code: projectCode,
                manager: projectManager,
                createdAt: serverTimestamp(),
            });

            // 프로젝트 참여자(생성자) 추가
            const participantRef = doc(db, 'organization', organizationId, 'project', projectCode, 'participant', userId);
            await setDoc(participantRef, {
                name: projectManager,
                role: '관리자',
                status: '활성',
                permissions: {
                    read: true,
                    write: true,
                    admin: true,
                },
                joinedAt: serverTimestamp(),
            });

            // ✅ 프로젝트 최초 일정 추가
            const scheduleId = `init-${Date.now()}`; // 고유 ID 생성 (ex. init-1714412341234)
            const scheduleRef = doc(db, 'organization', organizationId, 'project', projectCode, 'schedule', scheduleId);
            await setDoc(scheduleRef, {
                title: '프로젝트 생성 완료',
                date: serverTimestamp(),
                status: 'Completed',
                assignee: projectManager,
                createdAt: serverTimestamp(),
                description: '이 프로젝트가 성공적으로 생성되었습니다.',
            });

            alert('프로젝트가 성공적으로 생성되었습니다!');
            closeModal();
            navigate(`/project/${projectCode}`);
        } catch (error) {
            console.error('프로젝트 생성 중 오류:', error);
            alert('프로젝트 생성에 실패했습니다.');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>프로젝트 생성</h2>

            <label>프로젝트명</label>
            <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                disabled={isCreating}
            />

            <label>프로젝트 식별코드</label>
            <input
                type="text"
                value={projectCode}
                onChange={(e) => setProjectCode(e.target.value)}
                disabled={isCreating}
            />

            <label>책임자</label>
            <input
                type="text"
                value={projectManager}
                onChange={(e) => setProjectManager(e.target.value)}
                disabled={isCreating}
            />

            <button onClick={handleCreateProject} disabled={isCreating}>
                {isCreating ? (
                    <>
                        <span className="spinner" /> 생성 중...
                    </>
                ) : (
                    '생성 확인'
                )}
            </button>
            <button onClick={closeModal} disabled={isCreating}>닫기</button>
        </div>
    );
};

export default CreateProjectModal;
