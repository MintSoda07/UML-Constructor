import React, { useEffect, useState } from 'react';
import { db } from '../ts/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../css/ProjectList.css'; // CSS 분리 권장

interface Project {
    id: string;
    name: string;
    code: string;
    manager: string;
    createdAt: any;
}

const ProjectList: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const storedData = localStorage.getItem('userData');
                if (!storedData) throw new Error('유저 데이터가 없습니다.');

                const parsedUserData = JSON.parse(storedData);
                const organizationId = parsedUserData.organization?.id;
                if (!organizationId) throw new Error('조직 ID가 없습니다.');

                const projectCollection = collection(db, 'organization', organizationId, 'project');
                const projectSnapshot = await getDocs(projectCollection);

                const projectList = projectSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Project, 'id'>),
                }));

                setProjects(projectList);
            } catch (error) {
                console.error('프로젝트 불러오기 오류:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const handleOpenProject = (code: string) => {
        navigate(`/project/${code}`);
    };

    if (loading) return <p>로딩 중...</p>;
    if (projects.length === 0) return <p>프로젝트가 없습니다.</p>;

    return (
        <div>
            <h2>프로젝트 목록</h2>
            <ul className="project-list">
                {projects.map((project) => (
                    <li key={project.id} className="project-item">
                        <div className="project-info">
                            <strong>{project.name}</strong> (코드: {project.code}) - 담당자: {project.manager}
                        </div>
                        <button
                            className="open-button"
                            onClick={() => handleOpenProject(project.code)}
                        >
                            열기
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProjectList;
