const getInitials = (username?: string) => (username ? username.slice(0, 2).toUpperCase() : "?");

const formatRelativeTime = (dateStr?: string): string => {
	if (!dateStr) return "";
	const diff = Date.now() - new Date(dateStr).getTime();
	const mins = Math.floor(diff / 60_000);
	if (mins < 1) return "just now";
	if (mins < 60) return `${mins}m`;
	const hrs = Math.floor(mins / 60);
	if (hrs < 24) return `${hrs}h`;
	return `${Math.floor(hrs / 24)}d`;
};
export { getInitials, formatRelativeTime };
