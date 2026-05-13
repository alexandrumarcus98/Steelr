import React from "react";

interface IPageHeaderProps {
	title: string;
	subtitle?: string;
	actions?: React.ReactNode;
}

const PageHeader: React.FC<IPageHeaderProps> = ({ title, subtitle, actions }) => {
	return (
		<header className="mb-8 text-text">
			<div className="flex flex-col gap-4 rounded-2xl border border-border-soft bg-surface p-6 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="font-display text-3xl font-bold text-text">{title}</h1>
					{subtitle && <p className="mt-2 text-lg text-muted">{subtitle}</p>}
				</div>
				{actions && <div className="shrink-0">{actions}</div>}
			</div>
		</header>
	);
};

export default PageHeader;
