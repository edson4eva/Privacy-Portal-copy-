import styles from './PageTitle.module.scss';

interface PageTitleProperties {
    title: string;
    /**
     * Overrides the informational colour the eyebrow takes by default. Pages
     * should not need this; it exists for a page that has a reason to differ.
     */
    fontColor?: string;
}

const PageTitle = ({ title, fontColor }: PageTitleProperties): React.ReactElement => {
    return (
        <div
            className={styles['page-title']}
            style={fontColor ? { color: fontColor } : undefined}
            data-testid="page-title"
        >
            {title}
        </div>
    );
};

export default PageTitle;
