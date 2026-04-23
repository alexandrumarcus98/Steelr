interface Props {
	title: string;
}

function Greeting({ title }: Props) {
	return (
		<h2 data-testid="greeting" className="greeting text-gray-700">
			{title}
		</h2>
	);
}

export default Greeting;
