import React from 'react';
import '../css/Schedule.css';

function Schedule() {
    return (
        <div className="schedule">
            <h2>개발 일정</h2>
            <ul>
                <li>프로젝트 시작: 2025-04-17</li>
                <li>기획 완료: 2025-04-24</li>
                <li>개발 중: 2025-04-30</li>
                <li>배포 예정: 2025-05-10</li>
            </ul>
        </div>
    );
}

export default Schedule;
