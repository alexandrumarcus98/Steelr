import React from "react";

interface PageHeaderProps {
	title: string;
	subtitle?: string;
	actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
	title,
	subtitle,
	actions,
}) => {
	return (
		<header className="mb-8 text-slate-900 dark:text-slate-100">
			<div className="flex flex-col gap-4 rounded-2xl bg-slate-900 p-6 text-white dark:bg-slate-100 dark:text-slate-900 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold">{title}</h1>
					{subtitle && <p className="mt-2 text-lg text-slate-300 dark:text-slate-600">{subtitle}</p>}
				</div>
				{actions && <div className="shrink-0">{actions}</div>}
			</div>
		</header>
	);
};

export default PageHeader;
