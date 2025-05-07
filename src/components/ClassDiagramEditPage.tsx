import React, { useEffect, useRef, useState } from 'react';
import { dia, shapes } from '@joint/core';
import { DiagramEditComponentProps } from './DiagramEditComponentProps';
import '../css/ClassDiagramEditPage.css';

const tools = [
    { id: 'move', label: '이동' },
    { id: 'class', label: '클래스' },
    { id: 'association', label: '직접 연관' },
    { id: 'include', label: 'Include 관계' },
    { id: 'exclude', label: 'Exclude 관계' },
];

const ClassDiagramEditPage: React.FC<DiagramEditComponentProps> = ({ diagram }) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<dia.Graph | null>(null);
    const paperRef = useRef<dia.Paper | null>(null);
    const [selectedTool, setSelectedTool] = useState<string | null>(null);
    const [isToolboxOpen, setIsToolboxOpen] = useState(true);
    const [drawingStart, setDrawingStart] = useState<{ x: number; y: number } | null>(null);
    const [tempRect, setTempRect] = useState<shapes.standard.Rectangle | null>(null);
    const [selectedClassForLink, setSelectedClassForLink] = useState<dia.Element | null>(null);

    const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
    const [rightClickedElement, setRightClickedElement] = useState<dia.Element | null>(null);

    useEffect(() => {
        // 그래프 객체를 한 번만 생성하여 유지
        if (!graphRef.current) {
            const graph = new dia.Graph();
            graphRef.current = graph;
        }

        const paper = new dia.Paper({
            el: canvasRef.current!,
            model: graphRef.current!,
            width: 1000,
            height: 600,
            gridSize: 10,
            drawGrid: true,
            background: { color: '#f8f9fa' },
            interactive: (cellView) => selectedTool !== 'move', // 'move' 툴일 때만 요소를 움직일 수 있음
        });

        // 연결 (클릭 시)
        paper.on('element:pointerclick', (elementView: dia.ElementView) => {
            const element = elementView.model;
            if (selectedTool === 'association' || selectedTool === 'include' || selectedTool === 'exclude') {
                if (!selectedClassForLink) {
                    setSelectedClassForLink(element);
                } else {
                    if (selectedClassForLink.id !== element.id) {
                        const link = new shapes.standard.Link();
                        link.source(selectedClassForLink);
                        link.target(element);
                        link.attr({
                            line: {
                                stroke:
                                    selectedTool === 'association' ? '#000' :
                                        selectedTool === 'include' ? 'blue' : 'red',
                                strokeWidth: 2,
                                targetMarker: {
                                    type: 'path',
                                    d: 'M 10 -5 0 0 10 5 z',
                                },
                            },
                        });
                        link.addTo(graphRef.current!);
                    }
                    setSelectedClassForLink(null);
                }
            }
        });

        // 우클릭 (컨텍스트 메뉴 열기)
        paper.on('element:contextmenu', (elementView: dia.ElementView, evt: JQuery.Event) => {
            evt.preventDefault();

            // JQuery.Event를 MouseEvent로 직접 캐스팅
            const mouseEvent = evt as unknown as MouseEvent;

            // x, y 좌표를 가져옵니다
            setRightClickedElement(elementView.model);
            setContextMenuPos({ x: mouseEvent.clientX, y: mouseEvent.clientY });
        });

        // 줌
        paper.on('blank:mousewheel', (evt, x, y, delta) => {
            evt.preventDefault();
            const currentScale = paper.scale().sx;
            const newScale = delta > 0 ? currentScale * 1.1 : currentScale * 0.9;
            const paperOrigin = paper.translate();
            const scaleFactor = newScale / currentScale;
            const newOriginX = x - scaleFactor * (x - paperOrigin.tx);
            const newOriginY = y - scaleFactor * (y - paperOrigin.ty);
            paper.scale(newScale, newScale);
            paper.translate(newOriginX, newOriginY);
        });

        // 배경 클릭 시 메뉴 닫기
        paper.on('blank:pointerdown', () => {
            setContextMenuPos(null);
            setRightClickedElement(null);
        });

        paperRef.current = paper;
    }, [selectedTool]);

    // 마우스 드래그로 클래스 그리기 (이동 모드에서는 그리지 않음)
    const handleMouseDown = (e: React.MouseEvent) => {
        if (selectedTool !== 'class') return; // 'class' 툴일 때만 그리기 시작

        const { left, top } = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;
        setDrawingStart({ x, y });

        const previewRect = new shapes.standard.Rectangle();
        previewRect.position(x, y);
        previewRect.resize(1, 1);
        previewRect.attr({
            body: {
                fill: 'rgba(100,100,100,0.2)',
                stroke: '#aaa',
                strokeDasharray: '5 2',
            },
            label: { text: '', fill: '#000000' },
        });

        previewRect.addTo(graphRef.current!);
        setTempRect(previewRect);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (selectedTool !== 'class' || !drawingStart || !tempRect) return;

        const { left, top } = canvasRef.current!.getBoundingClientRect();
        const x2 = e.clientX - left;
        const y2 = e.clientY - top;
        const x = Math.min(drawingStart.x, x2);
        const y = Math.min(drawingStart.y, y2);
        const width = Math.abs(drawingStart.x - x2);
        const height = Math.abs(drawingStart.y - y2);

        tempRect.position(x, y);
        tempRect.resize(width, height);
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (!selectedTool || !drawingStart) return;
        const { left, top } = canvasRef.current!.getBoundingClientRect();
        const x2 = e.clientX - left;
        const y2 = e.clientY - top;
        const x = Math.min(drawingStart.x, x2);
        const y = Math.min(drawingStart.y, y2);
        const width = Math.abs(drawingStart.x - x2);
        const height = Math.abs(drawingStart.y - y2);

        if (width >= 30 && height >= 30) {
            const rect = new shapes.standard.Rectangle();
            rect.position(x, y);
            rect.resize(width, height);
            rect.attr({
                body: { fill: '#fff', stroke: '#2c3e50', strokeWidth: 2 },
                label: { text: 'New Class', fill: '#2c3e50' },
            });
            rect.addTo(graphRef.current!);
        }

        tempRect?.remove();
        setTempRect(null);
        setDrawingStart(null);

        // 클래스 그리기 후 이동 모드로 전환
        setSelectedTool('move');
    };

    // 컨텍스트 메뉴 동작들
    const handleContextMenuAction = (action: string) => {
        if (!rightClickedElement) return;

        switch (action) {
            case 'rename':
                const newName = prompt('클래스 이름을 입력하세요:', rightClickedElement.attr('label/text'));
                if (newName !== null) {
                    rightClickedElement.attr('label/text', newName);
                }
                break;
            case 'addAttribute':
                alert('속성 추가는 향후 구현 예정입니다.');
                break;
            case 'addMethod':
                alert('메서드 추가는 향후 구현 예정입니다.');
                break;
            case 'delete':
                rightClickedElement.remove();
                break;
        }

        setContextMenuPos(null);
        setRightClickedElement(null);
    };

    return (
        <div className="diagram-editor">
            <div className={`toolbox ${isToolboxOpen ? 'open' : 'closed'}`}>
                <button onClick={() => setIsToolboxOpen(open => !open)}>
                    {isToolboxOpen ? '◀' : '▶'}
                </button>
                {isToolboxOpen && (
                    <div className="tools">
                        {tools.map((tool) => (
                            <button
                                key={tool.id}
                                className={selectedTool === tool.id ? 'selected' : ''}
                                onClick={() => {
                                    setSelectedTool(tool.id);
                                    setSelectedClassForLink(null);
                                }}
                            >
                                {tool.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div
                className="canvas"
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            />

            {contextMenuPos && (
                <ul className="context-menu" style={{ top: contextMenuPos.y, left: contextMenuPos.x }}>
                    <li onClick={() => handleContextMenuAction('rename')}>이름 변경</li>
                    <li onClick={() => handleContextMenuAction('addAttribute')}>속성 추가</li>
                    <li onClick={() => handleContextMenuAction('addMethod')}>메서드 추가</li>
                    <li onClick={() => handleContextMenuAction('delete')}>삭제</li>
                </ul>
            )}
        </div>
    );
};

export default ClassDiagramEditPage;
