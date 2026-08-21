import { Helmet } from 'react-helmet-async';

const HelmetMeta = ({ title, description, keywords, noIndex = false }) => {
	return (
		<Helmet>
			<title>{title}</title>
			{description && <meta name="description" content={description} />}
			{keywords && <meta name="keywords" content={keywords} />}
			{noIndex && <meta name="robots" content="noindex, nofollow" />}
			<meta charSet="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
		</Helmet>
	);
};

export default HelmetMeta;