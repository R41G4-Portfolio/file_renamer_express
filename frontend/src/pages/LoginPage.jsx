import Login from '../components/auth/Login';
import HelmetMeta from '../components/common/HelmetMeta';
import { PAGE_META } from '../constants/meta';

const LoginPage = () => {
	return (
		<>
			<HelmetMeta {...PAGE_META.LOGIN} />
			<Login />
		</>
	);
};

export default LoginPage;