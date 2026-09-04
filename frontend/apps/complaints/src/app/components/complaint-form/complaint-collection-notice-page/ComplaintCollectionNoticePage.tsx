import { GoabButton, GoabButtonGroup, GoabSpacer } from '@abgov/react-components';
import style from './ComplaintCollectionNoticePage.module.scss';
import PageTitle from 'shared/src/lib/page-title/PageTitle';
import PageSubTitle from 'shared/src/lib/page-sub-title/PageSubTitle';
import useWindowWidth from 'shared/src/lib/utils/useWindowWidth';

interface StartPageProperties {
    onStart: () => void;
    onBack: () => void;
}
const ComplaintCollectionNotice = ({ onStart, onBack }: StartPageProperties): React.ReactElement => {
    const windowWidth = useWindowWidth();

    return (
        <>
            <div className={style['container']}>
                {windowWidth <= 623 && (
                    <>
                        <GoabSpacer vSpacing="xl"></GoabSpacer>
                        <PageTitle title="PRIVACY COMPLAINT" fontColor="var(--goa-color-info-default)" />
                        <GoabSpacer vSpacing={'s'}></GoabSpacer>
                        <PageSubTitle subTitle="File a complaint" />
                    </>
                )}
                <GoabSpacer vSpacing="m"></GoabSpacer>
                <div className={style['tertiary-title']}>Collection notice</div>
                <p style={{ marginBottom: '10px' }}>
                    The personal information collected through the file a complaint form is for the purpose of
                    investigating your privacy concern involving your personal information.
                </p>
                <p>
                    This collection is authorized by section 4(c) of the <i>Protection of Privacy Act</i>. For
                    questions about the collection of personal information, contact Privacy Services by email at{' '}
                    <a href="mailto:privacy@gov.ab.ca">privacy@gov.ab.ca</a>.
                </p>
                <GoabSpacer vSpacing="l"></GoabSpacer>
                <GoabButtonGroup alignment="start">
                    <GoabButton type="secondary" leadingIcon="arrow-back" onClick={onBack} testId="back-button">
                        Back
                    </GoabButton>
                    <GoabButton trailingIcon="arrow-forward" onClick={onStart} testId="start-complaint-button">
                        Start complaint
                    </GoabButton>
                </GoabButtonGroup>
                <GoabSpacer vSpacing="l"></GoabSpacer>
            </div>
        </>
    );
};

export default ComplaintCollectionNotice;
