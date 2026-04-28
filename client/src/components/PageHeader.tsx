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
		<header className="mb-8 text-gray-100">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-gray-900 rounded-2xl">
				<div>
					<h1 className="text-3xl font-bold">{title}</h1>
					{subtitle && <p className="mt-2 text-lg text-gray-300">{subtitle}</p>}
				</div>
				{actions && <div className="shrink-0">{actions}</div>}
			</div>
		</header>
	);
};

export default PageHeader;
