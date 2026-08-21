import { HashLoader } from "react-spinners";

const Spinner = ({ size = 120, color = "#333333", fullPage = true }) => {
	if (fullPage) {
		return (
			<div className="spinner-fullpage">
				<HashLoader color={color} size={size} />
			</div>
		);
	}

	return (
		<div className="spinner-container">
			<HashLoader color={color} size={size} />
		</div>
	);
};

export default Spinner;