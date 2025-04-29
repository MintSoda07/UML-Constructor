import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../ts/firebase';
import { doc, getDoc, collection, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import '../css/ProjectPage.css'; // CSS 따로 분리
import Calendar from 'react-calendar';
import { useNavigate } from 'react-router-dom';
import CreateDiagramForm from '../components/CreateDiagramForm';

const tabs = [
    { key: '참여자', icon: '👥' },
    { key: '프로젝트 일정', icon: '📅' },
    { key: '마일스톤', icon: '🏁' },
    { key: '다이어그램', icon: '📝' },
    { key: '예산 관리', icon: '💰' },
    { key: '권한 관리', icon: '🔒' },
];

const ProjectPage: React.FC = () => {
    const { projectCode } = useParams<{ projectCode: string }>();
    const [selectedTab, setSelectedTab] = useState('참여자');
    const [projectData, setProjectData] = useState<any>(null);
    const [participants, setParticipants] = useState<{ uid: string, name: string, role: string, department: string }[]>([]); // 역할과 부서 추가
    const [scheduleData, setScheduleData] = useState<any[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [diagrams, setDiagrams] = useState<any[]>([]);
    const navigate = useNavigate();
    const handleDiagramClickCreate = (diagramType: string) => {
        setSelectedDiagramType(diagramType);
    };
    const handleDiagramClick = (diagramType: string, diagramId: string) => {
        navigate(`/organization/{organizationId}/project/${projectCode}/diagrams/${diagramType}/detail/${diagramId}`);
    };
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
    
    const [selectedDiagramType, setSelectedDiagramType] = useState<string | null>(null);
    useEffect(() => {
        const fetchProject = async () => {
            const storedData = localStorage.getItem('userData');
            if (!storedData) return;
            const parsed = JSON.parse(storedData);
            const organizationId = parsed.organization?.id;

            // 프로젝트 데이터 가져오기
            const projectRef = doc(db, 'organization', organizationId, 'project', projectCode!);
            const projectSnap = await getDoc(projectRef);

            if (projectSnap.exists()) {
                setProjectData(projectSnap.data());
            }

            // 참여자 목록 가져오기
            const participantCollection = collection(db, 'organization', organizationId, 'project', projectCode!, 'participant');
            const participantSnapshot = await getDocs(participantCollection);
            const participantList = participantSnapshot.docs.map(doc => doc.id); // UID만 가져옴

            // 참여자 UID에 해당하는 이름, 역할, 부서를 가져오기
            const participantDetails = await Promise.all(participantList.map(async (uid) => {
                // 사용자 이름 가져오기
                const userRef = doc(db, 'userData', uid);
                const userSnap = await getDoc(userRef);
                const userName = userSnap.exists() ? userSnap.data()?.name || '이름 없음' : '이름 없음';

                // 역할 ID 및 부서 가져오기
                const workerRef = doc(db, 'organization', organizationId, 'workers', uid);
                const workerSnap = await getDoc(workerRef);
                const workerData = workerSnap.exists() ? workerSnap.data() : { role: '알 수 없음', department: '알 수 없음' };

                // 역할 이름 가져오기
                let roleName = '알 수 없음';
                if (workerData.role && typeof workerData.role === 'string') {
                    const roleRef = doc(db, 'organization', organizationId, 'roles', workerData.role);
                    const roleSnap = await getDoc(roleRef);
                    if (roleSnap.exists()) {
                        roleName = roleSnap.data()?.name || '알 수 없음';
                    }
                }

                return {
                    uid,
                    name: userName,
                    role: roleName,  // 최종적으로 보여질 역할 이름
                    department: workerData.department,
                };
            }));

            // 직책(role) 기준으로 정렬
            const sortedParticipants = participantDetails.sort((a, b) => {
                if (a.role < b.role) return -1;
                if (a.role > b.role) return 1;
                return 0;
            });

            // 일정 데이터 가져오기
            const scheduleCollection = collection(db, 'organization', organizationId, 'project', projectCode!, 'schedule');
            const scheduleSnapshot = await getDocs(scheduleCollection);
            const scheduleList = scheduleSnapshot.docs.map(doc => doc.data());

            setScheduleData(scheduleList);  // 일정 데이터를 상태에 저장
            setParticipants(sortedParticipants);
        };
        const diagramTypes = [
            'class_diagram', 'object_diagram', 'package_diagram', 'component_diagram',
            'composite_diagram', 'deployment_diagram', 'usecase_diagram', 'state_diagram',
            'activity_diagram', 'sequence_diagram', 'communication_diagram', 'timing_diagram',
        ];
        const diagramTypeNames: { [key: string]: string } = {
            class_diagram: '클래스',
            object_diagram: '오브젝트',
            package_diagram: '패키지',
            component_diagram: '컴포넌트',
            composite_diagram: '컴포짓',
            deployment_diagram: '디플로이',
            usecase_diagram: '유스케이스',
            state_diagram: '상태',
            activity_diagram: '활동',
            sequence_diagram: '시퀀스',
            communication_diagram: '커뮤니케이션',
            timing_diagram: '타이밍',
        };
        const fetchDiagrams = async () => {
            const storedData = localStorage.getItem('userData');
            if (!storedData) return;
            const parsed = JSON.parse(storedData);
            const organizationId = parsed.organization?.id;
            if (!organizationId) return;

            const allDiagrams: any[] = [];

            for (const type of diagramTypes) {
                const detailCollection = collection(
                    db,
                    'organization',
                    organizationId,
                    'project',
                    projectCode!,
                    'diagrams',
                    type,
                    'detail'
                );

                const detailSnapshot = await getDocs(detailCollection);

                detailSnapshot.forEach(doc => {
                    const data = doc.data();
                    console.log(`다이어그램 - ${type} - ${doc.id}:`, data);

                    if (data?.name) {
                        allDiagrams.push({
                            type,
                            name: data.name,
                            displayType: diagramTypeNames[type] || type,  // "클래스" 등 한국어 이름
                            id: doc.id,
                            date: data.createDate,
                            edit: data.lastEdit,
                        });
                    }
                });
            }

            console.log("최종 수집된 다이어그램 리스트:", allDiagrams);
            setDiagrams(allDiagrams);
        };
        fetchDiagrams();
        fetchProject();
        
    }, [projectCode]);
    const groupedDiagrams = diagrams.reduce((acc: any, diagram) => {
        if (!acc[diagram.displayType]) {
            acc[diagram.displayType] = [];
        }
        acc[diagram.displayType].push(diagram);
        return acc;
    }, {});

    // 상태에 따른 클래스 반환 함수
    const getStatusClass = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'status-label ompleted';
            case 'inprogress':
                return 'status-label inprogress';
            case 'await':
                return 'status-label await';
            default:
                return 'status-label';
        }
    };
    return (
        <div className="project-page">
            <div className="project-header">
                <div className="header-card">
                    <h2>📁 프로젝트명</h2>
                    <p>{projectData?.name || '프로젝트명'}</p>
                </div>
                <div className="header-card">
                    <h2>🔑 프로젝트 코드</h2>
                    <p>{projectData?.code}</p>
                </div>
                <div className="header-card">
                    <h2>👤 책임자</h2>
                    <p>{projectData?.manager}</p>
                </div>
                <div className="header-card">
                    <h2>📅 생성일</h2>
                    <p>{projectData?.createdAt ? new Date(projectData.createdAt.seconds * 1000).toLocaleDateString() : '알 수 없음'}</p>
                </div>
            </div>

            <div className="tab-menu">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        className={selectedTab === tab.key ? 'active' : ''}
                        onClick={() => setSelectedTab(tab.key)}
                    >
                        <span className="tab-icon">{tab.icon}</span> {tab.key}
                    </button>
                ))}
            </div>

            <div className="tab-content">
                {selectedTab === '참여자' && (
                    <div className="card">
                        <h3>참여자 명단</h3>
                        {participants.length > 0 ? (
                            Object.entries(
                                participants.reduce((groups, p) => {
                                    const dept = p.department || '기타';
                                    if (!groups[dept]) groups[dept] = [];
                                    groups[dept].push(p);
                                    return groups;
                                }, {} as Record<string, typeof participants>)
                            ).map(([dept, group], index) => (
                                <details key={dept} className="department-accordion" open={index === 0}>
                                    <summary className="department-summary">
                                        <span className="department-name">{dept}</span>
                                        <span className="department-count">{group.length}명</span>
                                    </summary>
                                    <ul className="participant-list">
                                        {group.map(({ uid, name, role }) => (
                                            <li key={uid} className="participant-item">
                                                <div className="participant-avatar">
                                                    <span>{name.slice(0, 1)}</span>
                                                </div>
                                                <div className="participant-info">
                                                    <span className="participant-name">{name}</span>
                                                    <span className="participant-role">{role}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </details>
                            ))
                        ) : (
                            <p>참여자가 없습니다.</p>
                        )}
                    </div>
                )}
                {selectedTab === '프로젝트 일정' && (
                    <div className="card">
                        <h3>프로젝트 일정</h3>

                        {/* 일정 보기 모드 선택 */}
                        <div className="view-mode-buttons">
                            <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'active' : ''}>리스트 보기</button>
                            <button onClick={() => setViewMode('calendar')} className={viewMode === 'calendar' ? 'active' : ''}>달력 보기</button>
                        </div>

                        {viewMode === 'list' ? (
                            <div className="schedule-list">
                                <table className="schedule-table-list">
                                    <thead>
                                        <tr>
                                            <th>제목</th>
                                            <th>날짜</th>
                                            <th>상태</th>
                                            <th>담당자</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {scheduleData.length > 0 ? (
                                            scheduleData
                                                .slice()
                                                .sort((a, b) => a.date.seconds - b.date.seconds)
                                                .map((schedule, index) => (
                                                    <tr key={index}>
                                                        <td>{schedule.title}</td>
                                                        <td>{new Date(schedule.date.seconds * 1000).toLocaleDateString()}</td>
                                                        <td>
                                                            <span className={getStatusClass(schedule.status)}>
                                                                {schedule.status}
                                                            </span>
                                                        </td>
                                                        <td>{schedule.assignee}</td>
                                                    </tr>
                                                ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                                                    일정이 없습니다.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="schedule-calendar">
                                <Calendar
                                    value={new Date()}
                                    tileContent={({ date, view }) => {
                                        // 일정이 해당 날짜에 있을 경우 표시
                                        const hasSchedule = scheduleData.some((schedule) => {
                                            const scheduleDate = new Date(schedule.date.seconds * 1000);
                                            return scheduleDate.toDateString() === date.toDateString();
                                        });
                                        return hasSchedule ? <div className="has-schedule"></div> : null;
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )}
                {selectedTab === '마일스톤' && (
                    <div className="card">[마일스톤 목록] - (추후 연결 예정)</div>
                )}
                {selectedTab === '다이어그램' && (
                    <div className="card">
                        <h1>다이어그램 생성</h1>
                        <div className="diagram-grid">
                            {diagramList.map((diagram, index) => (
                                <div
                                    key={index}
                                    className="diagram-card"
                                    onClick={() => handleDiagramClickCreate(diagram.type)}
                                >
                                    <h4>{diagram.name}</h4>
                                    <p>UML 다이어그램</p>
                                </div>
                            ))}
                        </div>

                        {/* 다이어그램 생성 폼 표시 */}
                        {selectedDiagramType && (
                            <div className="diagram-form-wrapper">
                                <CreateDiagramForm diagramType={selectedDiagramType} />
                            </div>
                        )}

                        {diagrams.length > 0 ? (
                            <div className="card">
                                <div><h1>다이어그램 목록</h1></div>
                                <div className="diagram-list-container">
                                    {Object.entries(groupedDiagrams).map(([displayType, items]: any) => (
                                        <div key={displayType} className="diagram-group">
                                            <div className="diagram-group-title">{displayType} 다이어그램</div>
                                            <div className="diagram-group-list">
                                                {items.map((diagram: any) => (
                                                    <div
                                                        key={diagram.id}
                                                        className="diagram-list-item"
                                                        onClick={() => handleDiagramClick(diagram.type, diagram.id)}
                                                    >
                                                        <span className="diagram-list-bullet">ㄴ</span>
                                                        <div className="diagram-list-info">
                                                            <span className="diagram-list-name">{diagram.name}</span>
                                                            <div className="diagram-list-meta">
                                                                <span className="meta-label">생성: </span>
                                                                <span className="meta-value">
                                                                    {diagram.date?.toDate().toLocaleDateString('ko-KR')}
                                                                </span>
                                                                <span className="meta-separator">|</span>
                                                                <span className="meta-label">수정: </span>
                                                                <span className="meta-value">
                                                                    {diagram.edit?.toDate().toLocaleDateString('ko-KR')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div>다이어그램이 존재하지 않습니다.</div>
                        )}
                        <div>[버전 관리 기능]</div>
                    </div>
                )}
                {selectedTab === '예산 관리' && (
                    <div className="card">
                        <h3>프로젝트 예산 요약</h3>
                        <p>[총 예산] - (추후 연결 예정)</p>
                        <p>[사용된 금액] - (추후 연결 예정)</p>
                        <p>[잔여 예산] - (추후 연결 예정)</p>
                        <div>[지출 내역 테이블]</div>
                    </div>
                )}
                {selectedTab === '권한 관리' && (
                    <div className="card">
                        <h3>프로젝트 권한 관리</h3>
                        <p>[참여자 목록 + 권한 (읽기/편집/관리자)]</p>
                        <p>[권한 변경 기능 (예정)]</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectPage;
