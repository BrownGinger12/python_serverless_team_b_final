import { Loader } from "lucide-react";

interface Props {
	size?: number;
	color?: string;
}

const Loading = ({ size = 32, color = "#000000" }: Props) => {
	return (
		<Loader
			size={size}
			color={color}
			className="mx-auto animate-spin"
			style={{ animationDuration: "2s" }}
		/>
	);
};

export default Loading;
