import styles from './PpContainer.module.scss';

interface PpContainerProperties {
    containerBorderColor?: string;
    containerBoxShadow?: string;
    children?: React.ReactNode;
}

const PpContainer = ({
    children,
    containerBorderColor = 'var(--goa-color-greyscale-200)',
    containerBoxShadow = '6px 6px 6px 0px rgba(0,0,0,0.16)',
}: PpContainerProperties): React.ReactElement => {
    return (
        <div
            className={styles['pp-container']}
            style={{
                borderColor: containerBorderColor,
                boxShadow: containerBoxShadow,
            }}
        >
            {children}
        </div>
    );
};

export default PpContainer;
