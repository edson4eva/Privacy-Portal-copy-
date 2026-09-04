import { useEffect, useState } from 'react';
import PageTitle from 'shared/src/lib/page-title/PageTitle';
import PageSubTitle from 'shared/src/lib/page-sub-title/PageSubTitle';
import { GoabSpacer } from '@abgov/react-components';
import style from './FileComplaint.module.scss';
import ComplaintFormStepper from '../../components/complaint-form/complaint-form-wizard/ComplaintFormStepper';
import ComplaintCollectionNotice from '../../components/complaint-form/complaint-collection-notice-page/ComplaintCollectionNoticePage';
import ComplaintStartPage from '../../components/complaint-form/complaint-start-page/ComplaintStartPage';
import useWindowWidth from 'shared/src/lib/utils/useWindowWidth';
import { trackEvent } from 'shared/src/lib/api/tagManagerService';
import AlbertaAccountModal from 'shared/src/lib/alberta-account-modal/AlbertaAccountModal';
import { useAuth } from 'shared/src/lib/context/auth-provider';

const FileComplaint = (): React.ReactElement => {
    const [isFormWizardStarted, setIsFormWizardStarted] = useState<boolean>(false);
    const [isCollectionNoticePage, setIsCollectionNoticePage] = useState<boolean>(false);
    const windowWidth = useWindowWidth();
    const scrollToTop = () => {
        window.scrollTo(0, 0);
    };
    const { getCurrentUser } = useAuth();
    const user = getCurrentUser();
    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {
        if (user?.profile === 'guest') {
            setIsGuest(true);
        }
    }, [user]);

    const handleStart = () => {
        setIsCollectionNoticePage(true);
        scrollToTop();
    };

    const handleBackToCollectionNotice = () => {
        setIsFormWizardStarted(false);
        setIsCollectionNoticePage(true);
        scrollToTop();
    };

    const handleStartComplaint = () => {
        trackEvent({
            action: 'pp_file_complaint_btn_click',
            category: 'pp_file_complaint',
            label: 'pp_file_complaint_intro',
        });
        setIsFormWizardStarted(true);
        scrollToTop();
    };

    const handleBackToStartPage = () => {
        setIsFormWizardStarted(false);
        setIsCollectionNoticePage(false);
        scrollToTop();
    };

    return (
        <>
            <div className={style['container']}>
                {windowWidth > 624 && (
                    <>
                        <PageTitle title="PRIVACY COMPLAINT" fontColor="var(--goa-color-info-default)" />
                        <GoabSpacer vSpacing={'s'}></GoabSpacer>
                        <PageSubTitle subTitle="File a complaint" />
                    </>
                )}
                {isFormWizardStarted ? (
                    <ComplaintFormStepper onBack={handleBackToCollectionNotice}></ComplaintFormStepper>
                ) : isCollectionNoticePage ? (
                    <ComplaintCollectionNotice onStart={handleStartComplaint} onBack={handleBackToStartPage} />
                ) : (
                    <div>
                        <ComplaintStartPage onStart={handleStart} />
                        {!isGuest && <AlbertaAccountModal />}
                    </div>
                )}
            </div>
        </>
    );
};

export default FileComplaint;
