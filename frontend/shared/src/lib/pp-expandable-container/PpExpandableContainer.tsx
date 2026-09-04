import React, { useState } from 'react';
import style from './PpExpandalbleContainer.module.scss';

interface PpExpandableContainerProperties {
    text: string;
    charLimit?: number;
}

const PpExpandableContainer = ({ text = '', charLimit = 200 }: PpExpandableContainerProperties) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleText = () => {
        setIsExpanded(!isExpanded);
    };
    return (
        <div className={style['read-more-container']}>
            <div className={`${style['read-more-text']} ${isExpanded ? style['expanded'] : style['collapsed']}`}>
                {text}
            </div>
            {text.length > charLimit && (
                <button className={style['toggle-button']} onClick={toggleText}>
                    {isExpanded ? 'Read Less' : 'Read More'}
                </button>
            )}
        </div>
    );
};

export default PpExpandableContainer;
