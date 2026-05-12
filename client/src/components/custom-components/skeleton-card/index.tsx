const SkeletonCard: React.FC = (): React.ReactNode => (
	<div className="animate-pulse rounded-2xl border border-border-soft bg-surface p-5">
		<div className="mb-4 flex items-center gap-3">
			<div className="h-10 w-10 rounded-full bg-slate-200" />
			<div className="space-y-2">
				<div className="h-3 w-24 rounded-full bg-slate-200" />
				<div className="h-2.5 w-16 rounded-full bg-slate-200" />
			</div>
		</div>
		<div className="space-y-2">
			<div className="h-3 w-3/4 rounded-full bg-slate-200" />
			<div className="h-3 w-full rounded-full bg-slate-200" />
			<div className="h-3 w-1/2 rounded-full bg-slate-200" />
		</div>
	</div>
);

export default SkeletonCard;
