import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../ts/firebase';
import '../css/CreateDiagramForm.css';

const CreateDiagramForm: React.FC<{ diagramType: string }> = ({ diagramType }) => {
    const diagramList = [
        { type: 'class_diagram', name: '클래스 다이어그램' },
        { type: 'object_diagram', name: '오브젝트 다이어그램' },
        { type: 'package_diagram', name: '패키지 다이어그램' },
        { type: 'component_diagram', name: '컴포넌트 다이어그램' },
        { type: 'composite_diagram', name: '컴포짓 다이어그램' },
        { type: 'deployment_diagram', name: '디플로이 다이어그램' },
        { type: 'usecase_diagram', name: '유스케이스 다이어그램' },
        { type: 'state_diagram', name: '상태 다이어그램' },
        { type: 'activity_diagram', name: '활동 다이어그램' },
        { type: 'sequence_diagram', name: '시퀀스 다이어그램' },
        { type: 'communication_diagram', name: '통신 다이어그램' },
        { type: 'timing_diagram', name: '타이밍 다이어그램' },
    ];
    const [name, setName] = useState('');
    const [customId, setCustomId] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { projectCode } = useParams<{ projectCode: string }>();
    const selectedDiagram = diagramList.find(d => d.type === diagramType);
    
    const handleCreate = async () => {
        if (!name || !customId) {
            alert('이름과 식별코드를 모두 입력해주세요.');
            return;
        }

        const storedData = localStorage.getItem('userData');
        if (!storedData) return;

        const parsed = JSON.parse(storedData);
        const organizationId = parsed.organization?.id;
        if (!organizationId || !projectCode) return;

        const diagramRef = doc(
            db,
            'organization',
            organizationId,
            'project',
            projectCode,
            'diagrams',
            diagramType,
            'detail',
            customId
        );

        const diagramData = {
            name,
            createDate: serverTimestamp(),
            lastEdit: serverTimestamp(),
        };

        try {
            setLoading(true);
            await setDoc(diagramRef, diagramData);
            navigate(`/organization/${organizationId}/project/${projectCode}/diagrams/${diagramType}/detail/${customId}`);
        } catch (error) {
            console.error("다이어그램 생성 실패:", error);
            alert('다이어그램 생성에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="diagram-form-container" className="diagram-form-container">
    {loading && <div id="loading-overlay" className="loading-overlay">다이어그램 생성 중...</div>}

    {selectedDiagram ? (
        <h2 id="diagram-title" className="diagram-title">{selectedDiagram.name}</h2>
    ) : (
        <p id="unknown-diagram" className="unknown-diagram">알 수 없는 다이어그램 타입입니다.</p>
    )}
    <input
        id="diagram-name-input"
        className="diagram-input"
        type="text"
        placeholder="다이어그램 이름"
        value={name}
        onChange={(e) => setName(e.target.value)}
    />
    <input
        id="custom-id-input"
        className="diagram-input"
        type="text"
        placeholder="식별코드 (예: BUC-001)"
        value={customId}
        onChange={(e) => setCustomId(e.target.value)}
    />
    <button
        id="create-button"
        className="create-button"
        onClick={handleCreate}
    >
        생성
    </button>
</div>

    );
};

export default CreateDiagramForm;
