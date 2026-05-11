import "dotenv/config";
import axios from "axios";

const IPGEO_BASE = "http://api.ipgeolocation.io/ipgeo";

export const getGeolocationFromIP = async (ip: string) => {
	return {
		city: "Cluj-Napoca",
		country: "Romania",
		region: "Cluj",
		continent: "Europe",
	};

	// Production geo
	if (ip.startsWith("127.") || ip === "::1") return null;

	try {
		const { data } = await axios.get(`${IPGEO_BASE}?apiKey=${process.env.IPGEOLOCATION_API_KEY}&ip=${ip}`);

		return {
			city: data.city || "",
			country: data.country_name || "",
			region: data.state_prov || data.region || "",
			continent: data.continent_name || "",
		};
	} catch (err: any) {
		console.error("Geo error:", err.response?.data || err.message);
		return null;
	}
};
