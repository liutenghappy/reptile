//默认配置
const defaultOption = {
	categoryNames: "工学",
	sort: "market_price-asc",
	hasStock: "1",
	size: 50,
	page: 1,
	minPrice: null,
	maxPrice: null
};
//爬虫
let Reptile = {
	...defaultOption,
	progress: 0,
	excelData: [],
	timer: null,
	total: 1,
	totalPage: 1,
	isFirst: true,
	isPause: true,
	//获取一级分类
	async getType() {
		try {
			const res = await request.get(`/shopcategory`);
			return res;
		} catch (err) {
			throw err;
		}
	},
	//获取二级分类
	async getCategory(id) {
		try {
			const res = await request.get(`/category/${id}`);
			return res;
		} catch (err) {
			throw err;
		}
	},
	//清空数据
	clear() {
		this.excelData = [];
	},
	//配置选项
	setOption({
		sort = defaultOption.sort,
		categoryNames = defaultOption.categoryNames,
		hasStock = defaultOption.hasStock,
		size = defaultOption.size,
		page = defaultOption.page,
		minPrice = defaultOption.minPrice,
		maxPrice = defaultOption.maxPrice
	} = defaultOption) {
		this.sort = sort;
		this.categoryNames = categoryNames;
		this.hasStock = hasStock;
		this.size = size;
		this.page = page;
		this.minPrice = minPrice;
		this.maxPrice = maxPrice
	},
	//抓取数据
	async getData() {
		try {
			let restUrl = ``;
			if (this.minPrice != null && this.maxPrice != null) restUrl =
				`&minPrice=${this.minPrice}&maxPrice=${this.maxPrice}`;
			if (this.minPrice == null && this.maxPrice != null) restUrl =
				`&minPrice=0&maxPrice=${this.maxPrice}`;
			if (this.minPrice != null && this.maxPrice == null) restUrl =
				`&minPrice=${this.minPrice}&maxPrice=9999`;
			const res = await request.get(
				`/searchProduct?current=${this.page}&size=${this.size}&categoryNames=${this.categoryNames}&hasStock=${this.hasStock}&sort=${this.sort}${restUrl}`
			);
			this.totalPage = res.data.totalPage;
			this.total = +res.data.total;
			if (this.total < 1) {
				this.pause()
				this.emit("noData", res);
				return res
			}
			const products = res.data.products;
			this.progress = this.page / this.totalPage;
			if (this.isFirst) {
				this.emit("start", {
					totalPage: this.totalPage,
					total: this.total
				});
				this.isFirst = false;
			}
			this.emit("progress", {
				...res.data,
				sort: this.sort,
				categoryNames: this.categoryNames,
				hasStock: this.hasStock,
				minPrice: this.minPrice,
				maxPrice: this.maxPrice
			});
			if (res.data.current >= res.data.totalPage) {
				this.pause()
				this.emit("finish", res.data);
				return res
			}
			this.page += 1;
			return res;
		} catch (err) {
			this.pause();
			throw err.msg || err;
		}
	},
	//处理数据
	handleData(products) {
		let set = new Set();
		let excelData = [];
		for (let i = 0; i < products.length; i++) {
			if (!set.has(products[i].isbn)) {
				let temp = [];
				temp.push(products[i].name, products[i].market_price, products[i].isbn);
				excelData.push(temp);
				set.add(products[i].isbn)
			} 
		}
		set = null;
		return excelData
	},
	//导出excel
	exportExcel(name, products) {
		const data = this.handleData(products);
		// console.log(products.length)
		let workbook = XLSX.utils.book_new();
		let ws_data = [
			["书名", "价格", "ISBN"], ...data
		];
		let ws = XLSX.utils.aoa_to_sheet(ws_data);
		XLSX.utils.book_append_sheet(workbook, ws, "Sheet1");
		XLSX.writeFile(workbook, `${name}.xlsx`);
	},
	//暂停
	pause() {
		clearInterval(this.timer);
		this.timer = null;
		this.isFirst = true;
		this.isPause = true;
		return true;
	},
	//开始
	async start() {
		this.isPause = false;
		try {
			let res = await this.getData();
			if (this.isPause) return res;
			this.timer = setInterval(async () => {
				try {
					await this.getData();
				} catch (err) {
					this.emit('error', err)
				}
			}, 5000);
		} catch (err) {
			this.emit('error', err)
		}

	}
};

Object.setPrototypeOf(Reptile, eventEmit);