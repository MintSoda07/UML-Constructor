import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DiagramData } from '../components/DiagramEditComponentProps';
import ClassDiagramEditPage from '../components/ClassDiagramEditPage';
import '../css/DiagramEditPage.css'

const DiagramDetailPage: React.FC = () => {
    const { organizationId, projectCode, diagramType, diagramId } = useParams();
    const navigate = useNavigate();
    const [diagram, setDiagram] = useState<DiagramData>({
        id: diagramId || '',
        name: '클래스 다이어그램',
        description: '기본 설명입니다.',
    });

    const handleSave = () => {
        console.log('💾 다이어그램 저장', diagram);
    };

    const handleVersion = () => {
        console.log('🧬 버전 생성', diagram);
    };

    const handleBack = () => {
        navigate(-1); // 이전 페이지로
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (diagram) {
            const { name, value } = e.target;
            setDiagram({ ...diagram, [name]: value });
        }
    };

    const renderDiagramEditPage = () => {
        switch (diagramType) {
            case 'class_diagram':
                return  <ClassDiagramEditPage diagram={diagram} />;
            default:
                return <div>지원되지 않는 다이어그램 타입입니다.</div>;
        }
    };
    const handleUndo = () => {
        console.log('↩ 실행 취소 (undo)');
        // undo 관련 로직 작성
    };

    // 우클릭 방지 (useEffect에서 처리)
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        // 컴포넌트가 마운트될 때 우클릭 방지 이벤트 리스너 추가
        document.addEventListener('contextmenu', handleContextMenu);

        // 컴포넌트가 언마운트될 때 이벤트 리스너 제거
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

    return (
        <div className="editor-container">
    <div className="editor-toolbar">
        <div className="editor-info-container">
            <div>
                <span className="label">프로젝트:</span> {projectCode}
            </div>
            <div>
                <span className="label">버전:</span> v1.0.0
            </div>
            <div>
                <span className="label">다이어그램:</span> {diagram.name}
            </div>
        </div>

        <div className="editor-buttons">
            <button className="button" onClick={handleSave}>💾 저장</button>
            <button className="button" onClick={handleVersion}>🧬 버전 생성</button>
            <button className="button secondary" onClick={handleUndo}>↩ 실행 취소</button>
        </div>
    </div>

    <div className="diagram-canvas">
        {renderDiagramEditPage()}
    </div>
</div>
    );
};

export default DiagramDetailPage;
