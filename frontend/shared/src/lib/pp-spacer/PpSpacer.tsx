import React from 'react';
import styles from './PpSpacer.module.scss';

type VSpacing = '3xs' | '2xs' | 'xs' | 's' | 'm' | 'l' | 'xl' | '2xl' | '3xl' | '4xl';

interface PpSpacerProperties {
    vSpacing?: VSpacing;
}

export const PpSpacer: React.FC<PpSpacerProperties> = ({ vSpacing = 'm' }) => {
    const className = `${styles.spacer} ${styles[`spacer--${vSpacing}`]}`;
    return <div className={className} />;
};
