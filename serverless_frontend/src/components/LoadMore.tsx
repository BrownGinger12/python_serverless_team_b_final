import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

const LoadMore = ({
	size = 30,
	color = "#000000",
}: {
	size?: number;
	color?: string;
}) => {
	const { ref, inView } = useInView();
	const [data, setData] = useState([]);

	useEffect(() => {
		if (inView) {
			// fetchProducts().then((res) => {
			// 	setData([...data, ...res]);
			// });
		}
	}, [inView, data]);

	return (
		<>
			<section>{/* more products here */}</section>
			<section
				ref={ref}
				className="w-full h-[10rem] flex justify-center items-center"
			>
				<Loader
					size={size}
					color={color}
					className="animate-spin"
					style={{
						animationDuration: "2s",
					}}
				/>
			</section>
		</>
	);
};

export default LoadMore;
