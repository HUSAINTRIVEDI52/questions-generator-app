import React from 'react';

const labelStyles = "block text-sm font-semibold text-slate-600 mb-1";
const inputStyles = "w-full p-2 bg-white text-slate-800 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

interface PaperDetailsProps {
    institutionName: string;
    title: string;
    onInstitutionNameChange: (value: string) => void;
    onTitleChange: (value: string) => void;
}

export const PaperDetails: React.FC<PaperDetailsProps> = ({ institutionName, title, onInstitutionNameChange, onTitleChange }) => {
    return (
        <>
            <div>
                <label htmlFor="institutionName" className={labelStyles}>Institution Name</label>
                <input
                    type="text"
                    id="institutionName"
                    value={institutionName}
                    onChange={e => onInstitutionNameChange(e.target.value)}
                    className={inputStyles}
                />
            </div>
            <div>
                <label htmlFor="title" className={labelStyles}>Paper Title</label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={e => onTitleChange(e.target.value)}
                    className={inputStyles}
                    placeholder="e.g., Annual Examination"
                />
            </div>
        </>
    );
};
