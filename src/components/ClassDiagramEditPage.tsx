import React, { useState } from 'react';

interface ClassDiagramProps {
    diagram: {
        id: string;
        name: string;
        description: string;
    };
}

const ClassDiagramEditPage: React.FC<ClassDiagramProps> = ({ diagram }) => {
    const [name, setName] = useState(diagram.name);
    const [description, setDescription] = useState(diagram.description);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'name') setName(value);
        if (name === 'description') setDescription(value);
    };

    return (
        <div className="class-diagram-edit-page">
            <div className="form-group">
                {/* JOINT US 사용하여 클래스 다이어그램에 필요한 추가적인 필드를 추가합니다. */}
                
            </div>
        </div>
    );
};

export default ClassDiagramEditPage;
