import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../ts/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import '../css/ProjectPage.css'; // CSS 따로 분리
import Calendar from 'react-calendar';

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
                // 사용자 정보 가져오기
                const userRef = doc(db, 'userData', uid);
                const userSnap = await getDoc(userRef);
                const userName = userSnap.exists() ? userSnap.data()?.name || '이름 없음' : '이름 없음';

                // 역할과 부서 정보 가져오기
                const workerRef = doc(db, 'organization', organizationId, 'workers', uid);
                const workerSnap = await getDoc(workerRef);
                const workerData = workerSnap.exists() ? workerSnap.data() : { role: '알 수 없음', department: '알 수 없음' };

                return {
                    uid,
                    name: userName,
                    role: workerData.role,
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

        fetchProject();
    }, [projectCode]);

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
                        <ul>
                            {participants.length > 0 ? (
                                participants.map(({ uid, name, role, department }) => (
                                    <li key={uid}>
                                        <span>{name}</span> - {role} | {department}
                                    </li>
                                ))
                            ) : (
                                <p>참여자가 없습니다.</p>
                            )}
                        </ul>
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
                        <button className="create-diagram-button">➕ 새 다이어그램 생성</button>
                        <div>[기존 다이어그램 리스트]</div>
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
