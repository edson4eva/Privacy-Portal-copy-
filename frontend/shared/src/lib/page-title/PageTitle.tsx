import styles from './PageTitle.module.scss';

interface PageTitleProperties {
    title: string;
    fontColor: string;
}

const PageTitle = ({ title, fontColor }: PageTitleProperties): React.ReactElement => {
    return (
        <div className={styles['page-title']} style={{ color: fontColor }} data-testid="page-title">
            {title}
        </div>
    );
};

export default PageTitle;
