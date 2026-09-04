import React, { useState } from 'react';
import styles from './Accordion.module.scss';
import { GoabAccordion } from '@abgov/react-components';
import { AccessedServiceSection } from '../types/AccessedServiceDetailsModel';

interface AccordionProperties {
    items: AccessedServiceSection[];
}

const Accordion: React.FC<AccordionProperties> = ({ items }) => {
    const [openIndex, setOpenIndex] = useState<number>(-1);

    const updateAccordion = (openValue: boolean, index: number) => {
        if (openValue) setOpenIndex(index);
    };

    return (
        <div className={styles.accordion}>
            {items.map((item, index) => (
                <GoabAccordion
                    heading={item.title}
                    key={index}
                    iconPosition="right"
                    open={openIndex === index}
                    onChange={(openValue: boolean) => updateAccordion(openValue, index)}
                    testId={'accordion-' + index}
                >
                    <div className={styles['accordion-body']}>
                        <div
                            className={styles['raw-section-content']}
                            dangerouslySetInnerHTML={{ __html: item.content }}
                        />
                    </div>
                </GoabAccordion>
            ))}
        </div>
    );
};

export default Accordion;
