import Register from '../components/auth/Register';
import HelmetMeta from '../components/common/HelmetMeta';
import { PAGE_META } from '../constants/meta';

const RegisterPage = () => {
	return (
		<>
			<HelmetMeta {...PAGE_META.REGISTER} />
			<Register />
		</>
	);
};

export default RegisterPage;