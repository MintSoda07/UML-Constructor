
export interface DiagramData {
    id: string;
    name: string;
    description: string;
}

export interface DiagramEditComponentProps {
    diagram: DiagramData;
    onSave?: () => void;
    onUndo?: () => void;
}
