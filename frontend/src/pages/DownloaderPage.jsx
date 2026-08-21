import Header from '../components/Layout/Header';
import DownloaderPanel from '../components/Downloader/DownloaderPanel';
import HelmetMeta from '../components/common/HelmetMeta';
import { PAGE_META } from '../constants/meta';

const DownloaderPage = () => {
	return (
		<>
			<HelmetMeta {...PAGE_META.DOWNLOADER} />
			<div className="container py-4">
				<main>
					<DownloaderPanel />
				</main>
			</div>
		</>
	);
};

export default DownloaderPage;