import React from "react";

import { Link } from "react-router-dom";

const FooterComponent: React.FC = (): React.ReactElement => {
	return (
		<footer className="footer-component">
			<div className="container mx-auto px-6 py-10">
				<div className="footer-inner">
					<div className="logo">
						<Link to="/">
							<span />
							Steelr
						</Link>
					</div>

					<div className="footer-links">
						{["Privacy", "Terms", "Docs", "GitHub"].map((label) => (
							<a
								key={label}
								href="#"
								onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
								onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-faint)")}
							>
								{label}
							</a>
						))}
					</div>

					<p className="footer-copy">© 2026 Steelr. All rights reserved.</p>
				</div>
			</div>
		</footer>
	);
};

export default FooterComponent;
