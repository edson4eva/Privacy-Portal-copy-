import { useEffect, useState } from 'react';
import { GoabButton, GoabIcon, GoabSpacer, GoabTable } from '@abgov/react-components';
import { IComplaintHistory, IComplaintResponse } from '@complaints/interfaces/IComplaintHistory';
import style from './ComplaintHistory.module.scss';
import { format } from 'date-fns';
import { get } from 'shared/src/lib/api/dataService';
import PageTitle from 'shared/src/lib/page-title/PageTitle';
import PageSubTitle from 'shared/src/lib/page-sub-title/PageSubTitle';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'shared/src/lib/context/auth-provider';

const ComplaintHistory = (): React.ReactElement => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const [complaints, setComplaints] = useState<IComplaintHistory[]>([]);

    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const getComplaints = async () => {
            setLoading(true);
            try {
                const result: IComplaintResponse = await get<IComplaintResponse>('v1/complaints');
                if (result && Array.isArray(result.complaints)) {
                    const sortedComplaints = result.complaints.sort(
                        (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
                    );
                    setComplaints(sortedComplaints);
                } else {
                    console.error('unexpected response format', result);
                }
            } catch (error) {
                console.error('Error fetching complaints:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            getComplaints();
        }
    }, [isAuthenticated]);

    const handleBackClick = () => {
        navigate('/file-complaint');
    };

    return (
        <>
            <div className={style['container']}>
                <div className={style['title-spacing']} />
                <PageTitle title="PRIVACY COMPLAINT" />
                <GoabSpacer vSpacing="s"></GoabSpacer>
                <PageSubTitle subTitle="Complaint history" />
                <GoabSpacer vSpacing="l"></GoabSpacer>
                {loading && <div>Loading...</div>}
                {!loading && complaints.length === 0 && (
                    <>
                        <div className={style['no-complaint-img']}>
                            <img alt="" src="./assets/GoA_Illustration-Privacy-portal_Complaint-history.png"></img>
                        </div>
                        <GoabSpacer vSpacing={'xl'} />
                        <div className={style['no-complaints-alert']} data-testid="no-complaints-alert">
                            <div className={style['alert-header']}>
                                <div className={style['alert-icon']}>
                                    <GoabIcon type="alert-circle" theme="outline" testId="no-complaints-alert-icon" />
                                </div>
                                <div className={style['alert-title']}>
                                    <span>Complaint history unavailable</span>
                                </div>
                            </div>
                            <div className={style['alert-content']}>
                                <p>
                                    Our records indicate that you have not filed a privacy complaint yet. If you believe
                                    this is an error, please contact{' '}
                                    <a href="mailto:goa.privacyportal@gov.ab.ca">goa.privacyportal@gov.ab.ca</a>.
                                </p>
                            </div>
                        </div>
                    </>
                )}

                {!loading && complaints.length > 0 && (
                    <div>
                        <p className={style['spacing']}>
                            Here is a log of your submitted privacy complaints, including the date and time of
                            submission and the service the complaint was against.
                        </p>
                        {complaints.map((complaint, index) => (
                            <div key={index} className={style['complaint-box']}>
                                <GoabTable key={index} width="100%">
                                    <thead>
                                        <tr>
                                            <th style={{ backgroundColor: 'white', alignItems: 'start' }} colSpan={2}>
                                                Submitted complaint
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className={style['left-column']} style={{ backgroundColor: 'white' }}>
                                                Service
                                            </td>
                                            <td className={style['right-column']} style={{ backgroundColor: 'white' }}>
                                                {complaint.service}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className={style['left-column']} style={{ backgroundColor: 'white' }}>
                                                Submitted on
                                            </td>
                                            <td className={style['right-column']} style={{ backgroundColor: 'white' }}>
                                                {format(new Date(complaint.createdDate), "MMMM d, yyyy 'at' h:mm aaa")}
                                            </td>
                                        </tr>
                                    </tbody>
                                </GoabTable>
                            </div>
                        ))}
                    </div>
                )}
                <GoabSpacer vSpacing="xl" />
                <GoabButton
                    type="secondary"
                    leadingIcon="arrow-back"
                    onClick={handleBackClick}
                    data-testid="back-to-privacy-complaint-button"
                >
                    Back to privacy complaint
                </GoabButton>
                <GoabSpacer vSpacing="2xl"></GoabSpacer>
            </div>
        </>
    );
};

export default ComplaintHistory;
