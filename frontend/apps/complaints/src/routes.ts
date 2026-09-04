import FileComplaint from './app/pages/secured/FileComplaint';
import ComplaintHistory from './app/pages/secured/ComplaintHistory';
import ComplaintLandingPage from './app/pages/public/ComplaintLandingPage';
import SigninRoute from 'shared/src/lib/authentication/SigninRoute';

const routes = [
    { path: '/', component: ComplaintLandingPage },
    { path: '/landingpage', component: ComplaintLandingPage },
    { path: '/complaint-history', component: ComplaintHistory },
    { path: '/file-complaint', component: FileComplaint },
    { path: '/signin', component: SigninRoute },
];

export default routes;
