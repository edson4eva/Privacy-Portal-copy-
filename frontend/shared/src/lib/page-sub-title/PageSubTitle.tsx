import styles from './PageSubTitle.module.scss';

interface PageSubTitleProperties {
    subTitle: string;
    fontWeight?: string;
}

const PageSubTitle = ({ subTitle, fontWeight }: PageSubTitleProperties): React.ReactElement => {
    return (
        <div className={styles['page-sub-title']} style={{ fontWeight: fontWeight }} data-testid="page-sub-title">
            {subTitle}
        </div>
    );
};

export default PageSubTitle;
