import React, { useState } from 'react';
import './css/App.css';
import Sidebar from './components/Sidebar';
import Schedule from './components/Schedule';
import CreateProjectModal from './components/CreateProjectModal'; // CreateProjectModal 컴포넌트 임포트
import ProjectList from './components/ProjectList'; // ProjectList 컴포넌트 임포트

function App() {
  const [showModal, setShowModal] = useState<string | null>(null); // 모달 상태 관리
  const [isBackgroundBlurred, setIsBackgroundBlurred] = useState(false); // 배경 흐림 상태

  const openModal = (modalType: string) => {
    setShowModal(modalType);  // 모달 열기
    setIsBackgroundBlurred(true); // 배경 흐림 상태
  };

  const closeModal = () => {
    setShowModal(null); // 모달 닫기
    setIsBackgroundBlurred(false); // 배경 흐림 해제
  };

  return (
    <div className="App">
      <div className={`container ${isBackgroundBlurred ? 'blurred' : ''}`}>
        <Sidebar openModal={openModal} />
        <div className="main-content">
          <div className="schedule-container">
            <Schedule />
          </div>
        </div>
      </div>

      {/* 모달 창 */}
      <div
        className={`modal ${showModal ? 'open' : ''}`}
        onClick={closeModal} // 바깥 영역 클릭 시 닫기
      >
        <div
          className="modal-content"
          onClick={(e) => e.stopPropagation()} // 내부 클릭 시 닫힘 방지
        >
          {/* 프로젝트 생성 모달 */}
          {showModal === 'create' && <CreateProjectModal closeModal={closeModal} />}
          
          {/* 프로젝트 열기 모달 */}
          {showModal === 'open' && (
            <>
              <h2>프로젝트 열기</h2>
              <p>프로젝트 파일을 불러오는 중...</p>
              <ProjectList /> {/* 프로젝트 목록 */}
              <button onClick={closeModal}>닫기</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
