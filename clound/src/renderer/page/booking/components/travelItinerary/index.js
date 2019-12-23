import "./index.scss";

export default {
	template: require("./index.xtpl"),
	name: 'travelItinerary',
	data() {
		console.log(this.itinerary);
		return {}
	},
	props: {
		itinerary: {
			type: Object,
			required: true
		},
	}
}
