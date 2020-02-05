const got = require('got');

const storeListJSON = (async function () {
	try {
		const response = await got('https://raw.githubusercontent.com/Level/awesome/master/modules/stores.json');
		return response.body;
	} catch (e) {
		console.error(e);
		console.error('An error occuered during querying for the store list.')
	}
})
