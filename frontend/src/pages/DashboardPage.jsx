import Dashboard from '../components/Dashboard/Dashboard';
import HelmetMeta from '../components/common/HelmetMeta';
import { PAGE_META } from '../constants/meta';

const DashboardPage = () => {
	return (
		<>
			<HelmetMeta {...PAGE_META.DASHBOARD} />
			<div className="container py-4">
				<main>
					<Dashboard />
				</main>
			</div>
		</>
	);
};

export default DashboardPage;