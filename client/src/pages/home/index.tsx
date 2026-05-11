import { useEffect } from "react";

import { useAuth } from "@/hooks/useAuth";
import { fetchLastVisitedPosts, fetchMostViewedPosts } from "@/store/api/postsApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import PostCard from "@/components/custom-components/post-card";

const HomeComponent = () => {
	const mostViewed = useAppSelector((state) => state.posts.mostViewed);
	const lastVisited = useAppSelector((state) => state.posts.lastVisited);
	const mostViewedStatus = useAppSelector((state) => state.posts.mostViewedStatus);
	const lastVisitedStatus = useAppSelector((state) => state.posts.lastVisitedStatus);

	const dispatch = useAppDispatch();
	const { isAuthenticated } = useAuth();

	useEffect(() => {
		if (isAuthenticated) {
			dispatch(fetchMostViewedPosts(3));
			dispatch(fetchLastVisitedPosts(3));
		}
	}, [isAuthenticated, dispatch]);

	return (
		<section className="home-component">
			<div className="hero container mx-auto px-6 py-10">
				<div className="hero-content">
					<div className="swatch-banner anim-fade-in delay-1">
						<div className="sw-dark"></div>
						<div className="sw-light"></div>
						<div className="sw-red"></div>
					</div>
					<div className="hero-label anim-fade-up delay-1">New platform — 2026</div>
					<h1 className="anim-fade-up delay-2">
						Design that <em>moves</em>
						<br />
						with intent
					</h1>
					<p className="hero-sub anim-fade-up delay-3">
						A minimal foundation built on three tones. Deep black, warm white, and a single
						razor-sharp red — nothing more, nothing less.
					</p>
					<div className="hero-actions anim-fade-up delay-4">
						<a href="register.html" className="btn btn-primary">
							Start building →
						</a>
						<a href="#features" className="btn btn-ghost">
							See features
						</a>
					</div>
					<p className="hero-note anim-fade-in delay-5">
						No credit card required · Free for 14 days
					</p>
				</div>

				<div className="hero-visual anim-fade-in delay-3">
					<div className="position-relative w-full">
						<div className="floating-badge badge-top">🔥 Trending now</div>
						<div className="social-mockup">
							<div className="mockup-header">
								<div className="mockup-logo">
									<div className="mockup-logo-dot"></div>
									Forma
								</div>
								<div className="mockup-actions">
									<a href="login.html" className="btn mockup-btn btn-ghost">
										Sign in
									</a>
									<a href="register.html" className="btn mockup-btn btn-primary">
										Join
									</a>
								</div>
							</div>
							<div className="mockup-feed" id="mockupFeed"></div>
						</div>
						<div className="floating-badge badge-bottom">✦ 2.4k live now</div>
					</div>
				</div>

				{isAuthenticated && (
					<div className="grid gap-6 md:grid-cols-2">
						<PostCard
							title="Most Viewed Posts"
							posts={mostViewed}
							link="/posts/most-viewed"
							status={mostViewedStatus}
						/>
						<PostCard
							title="Last Visited Posts"
							posts={lastVisited}
							link="/posts/last-visited"
							status={lastVisitedStatus}
						/>
					</div>
				)}
			</div>
		</section>
	);
};

export default HomeComponent;
