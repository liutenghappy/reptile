const request = axios.create({
	baseURL: "http://localhost:4444/",
	timeout: 10000,
	headers: {
		"Content-Type": "application/json"
	}
});

request.interceptors.response.use(
	(response) => {
		if (response.data && response.data.code == 0) {
			return response.data;
		} else {
			console.log(response.data)
			window.log.error(JSON.stringify(response.data))
			return Promise.reject(response.data);
		}
	},
	(error) => {
		window.log.error(JSON.stringify(error))
		return Promise.reject(error.response.data);
	}
);