const NotFound: React.FC = (): React.ReactNode => {
	return (
		<div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-10 transition-colors duration-200 sm:px-6 lg:px-8">
			<div className="w-full max-w-5xl">
				<div className="mb-8 rounded-2xl border border-border-soft bg-surface p-8 shadow-sm sm:p-10">
					<h1 className="font-display text-center text-3xl font-semibold tracking-tight text-bgsm:text-4xl text-accent">
						Page not found
					</h1>
					<p className="mx-auto mt-3 max-w-xl text-center text-base text-muted sm:text-lg">
						The page you are looking for does not exist.
					</p>
				</div>
			</div>
		</div>
	);
};

export default NotFound;
