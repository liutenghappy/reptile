import {
	JSONFilePreset
} from 'lowdb/node'

import {
	dirname
} from '../utils/index.mjs'
import path from 'node:path'

export let defaultData = {
	"id": "1",
	"parentId": "1",
	"current": 1,
	"total": 1,
	"totalPage": 1,
	"categoryNames":'',
	"sort":"market_price-asc",
	"products": [],
	"minPrice":"",
	"maxPrice":""
}
export let db = await JSONFilePreset('db.json', defaultData);



