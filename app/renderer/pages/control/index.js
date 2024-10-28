//控制器
const Controls = {
	typeSelect: document.getElementById("type"),
	categorySelect: document.getElementById("category"),
	startBtn: document.getElementById("start"),
	stopBtn: document.getElementById("stop"),
	contiBtn: document.getElementById("continue"),
	resetBtn: document.getElementById("reset"),
	outputBtn: document.getElementById("gen"),
	log: document.getElementById("log"),
	currentPage: document.getElementById("page"),
	tabTokenElm: document.getElementById('tabToken'),
	minPriceElm: document.getElementById('min-price'),
	maxPriceElm: document.getElementById('max-price'),
	progressElm: null, //进度显示元素
	Reptile: null, //爬虫对象
	typeList: [],
	typeId: 0,
	typeMap: new Map(),
	categoryList: [],
	categoryId: 0,
	cache: {}, //缓存
	categoryMap: new Map(),
	total: 1,
	totalPage: 1,
	maxLogs: 200, //最大日志条数（避免dom数过多导致内存泄露）
	//初始化
	async init(utils) {
		try {
			this.Reptile = utils;
			const data = await window.dbOperation.read();
			await this.genLog("欢迎使用爬虫脚本!");
			await this.initTypeList();
			await this.initType(data);
			await this.initCategoryList();
			await this.initCategory(data)
			await this.initStatus(data); //初始化价格排序，是否有货，页数
			await this.initLog(data)
			await this.initBtns();
			await this.bindEvent();
		} catch (err) {
			window.log.error(err)
			this.genLog("脚本初始化报错!", "red");
		}
	},
	//初始化一级类型列表
	async initTypeList() {
		try {
			const res = await this.Reptile.getType();
			this.typeList = res.data;
			this.genTypeMap()
			let frame = document.createDocumentFragment();
			for (let i = 0; i < this.typeList.length; i++) {
				this.cache[this.typeList[i].id] = [];
				let option = document.createElement("option");
				option.value = this.typeList[i].id;
				option.innerText = this.typeList[i].name;
				if (i === 0) {
					option.selected = true;
					this.typeId = option.value;
				}
				frame.appendChild(option);
			}
			this.typeSelect.appendChild(frame);
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
	//初始化二级类型列表
	async initCategoryList() {
		try {
			this.categorySelect.innerHTML = "";
			if (this.cache[this.typeId].length > 0) {
				this.categoryList = this.cache[this.typeId];
			} else {
				const res = await this.Reptile.getCategory(this.typeId);
				this.categoryList = res.data;
				this.genCategoryMap();
			}

			let frame = document.createDocumentFragment();
			this.cache[this.typeId] = this.categoryList;
			for (let i = 0; i < this.categoryList.length; i++) {
				let option = document.createElement("option");
				option.value = this.categoryList[i].id;
				option.innerText = this.categoryList[i].name;
				if (i === 0) {
					option.selected = true;
					this.categoryId = option.value;
				}
				frame.appendChild(option);
			}
			this.categorySelect.appendChild(frame);
		} catch (err) {
			throw err;
		}
	},
	async initStatus({
		sort,
		hasStock,
		current,
		minPrice,
		maxPrice
	}) {
		let sortGroup = document.querySelectorAll("input[name=sort]");
		let stockelm = document.getElementById("has_stock");
		Array.from(sortGroup).find((elm) => elm.value === sort).checked = true;
		if (hasStock === 1) stockelm.checked = true;
		this.currentPage.value = current;
		this.minPriceElm.value = minPrice;
		this.maxPriceElm.value = maxPrice;
	},
	async initType({
		parentId,
		products
	}) {
		if (products.length > 0) {
			this.typeSelect.value = parentId;
			this.typeId = parentId;
		}
	},
	async initCategory({
		id,
		products
	}) {
		if (products.length > 0) {
			this.categorySelect.value = id;
			this.categoryId = id;
		}
	},
	async initLog({
		totalPage,
		total,
		products
	}) {
		if (products.length > 0) {
			this.progressElm = null;
			this.total = +total;
			this.totalPage = totalPage
			this.reptileLog()
			this.genLog("已暂停");
		}
		products = null

	},
	async initBtns() {
		let {
			products,
			current,
			totalPage
		} = await window.dbOperation.read();
		if (products.length > 0) {
			this.outputBtn.removeAttribute('class')
		} else {
			this.outputBtn.setAttribute('class', 'disable')
		}
		if (products.length > 0) {
			this.contiBtn.style.display = 'inline-block';
			this.startBtn.style.display = 'none'
		} else {
			this.contiBtn.style.display = 'none';
			this.startBtn.style.display = 'inline-block'
		}
		this.stopBtn.style.display = 'none'
		products = null
	},
	scrollBottom() {
		this.log.scrollTop = this.log.scrollHeight;
	},
	//生成日志
	genLog(content, color = "#000") {
		const len = this.log.children.length;
		if (len >= this.maxLogs) {
			let firstNode = this.log.children[0];
			firstNode.remove();
			firstNode = null
		}
		let date = getDate(Date.now());
		let p = document.createElement("p");
		p.style.color = color;
		p.innerHTML = `[${date}] ${content}`;
		this.log.appendChild(p);
		this.scrollBottom();
		return p;
	},
	//事件绑定
	bindEvent() {
		this.bindStartEvent();
		this.bindContiEvent();
		this.bindStopEvent();
		this.bindOutputEvent();
		this.bindResetEvent()
		this.bindTypeEvent();
		this.bindCategoryEvent();
		this.bindReptileEvent();
		this.bindPriceAscEvent();
		this.bindhasStockEvent();
		this.bindPriceRangeEvent()
		this.bindPageEvent();
		this.bindTabToken()
	},
	getType() {
		const item = this.typeMap.get(this.typeId);
		const name = item.name;
		return name;
	},
	getCategory() {
		const item = this.categoryMap.get(this.categoryId);
		const name = item.name;
		return name;
	},
	getSort() {
		let sortGroup = document.querySelectorAll("input[name=sort]");
		let elm = Array.from(sortGroup).find((ele) => ele.checked);
		return elm.value;
	},
	getStock() {
		let stockelm = document.getElementById("has_stock");
		return stockelm.checked ? "1" : "0";
	},
	//爬虫日志
	reptileLog() {
		const typeName = this.getType();
		const category = this.getCategory();
		const minPrice = this.minPriceElm.value || 0;
		const maxPrice = this.maxPriceElm.value || 9999;
		this.genLog(`当前分类：${typeName}-${category}`);
		if (this.minPriceElm.value !== '' || this.maxPriceElm.value !== '') this.genLog(
			`当前价格区间：${minPrice}-${maxPrice}`);

		this.genLog(`总数：${this.total}`)
		this.genLog(`总页数：${this.totalPage}`)
	},
	//绑定开始按钮
	bindStartEvent() {
		this.startBtn.addEventListener("click", async () => {
			await window.dbOperation.reset()
			this.stopBtn.style.display = "inline-block";
			this.startBtn.style.display = "none";
			const categoryNames = this.getCategory();
			const hasStock = this.getStock();
			const sort = this.getSort();
			const minPrice = +this.minPriceElm.value || null;
			const maxPrice = +this.maxPriceElm.value || null;
			this.Reptile.setOption({
				page: this.currentPage.value / 1,
				categoryNames,
				sort,
				hasStock,
				minPrice,
				maxPrice
			});
			this.Reptile.clear();
			this.genLog("开始爬取数据...");
			await this.Reptile.start()
		});
	},
	//绑定继续按钮
	bindContiEvent() {
		this.contiBtn.addEventListener("click", () => {

			window.dbOperation.read().then(({
				products,
				current: page,
				categoryNames,
				sort,
				hasStock,
				minPrice,
				maxPrice,
				totalPage,
				total
			}) => {
				const num = products.length;
				const max = products[num - 1].market_price;
				if (page < totalPage) {
					this.stopBtn.style.display = "inline-block";
					this.contiBtn.style.display = "none";
					this.Reptile.setOption({
						page: page + 1,
						categoryNames,
						sort,
						hasStock,
						minPrice,
						maxPrice
					});
					this.genLog("继续爬取数据...");
					if (num >= 10000) {
						const gu = Math.floor(num / 10000) * 10000;
						this.genLog(`当前数据已满${gu}，正在爬取金额${max}以上的数据！`, '#ffa200');
					}
					this.Reptile.start()
				} else if (page === totalPage && total == 10000) {
					this.stopBtn.style.display = "inline-block";
					this.contiBtn.style.display = "none";
					let max = products[products.length - 1].market_price;
					this.Reptile.setOption({
						page: 1,
						categoryNames,
						sort,
						hasStock,
						minPrice: max,
						maxPrice: 9999
					});
					const gu = Math.floor(num / 10000) * 10000;
					this.genLog(`当前数据已满${gu}，开始爬取金额${max}以上的数据！`, '#ffa200');
					this.Reptile.start()
				} else {
					this.genLog("当前全部数据已爬取完毕，请及时导出！", 'red');
				}

			}).finally(() => {
				products = null
			})

		});

	},
	//绑定暂停按钮
	bindStopEvent() {
		this.stopBtn.addEventListener("click", () => {
			this.Reptile.pause();
			this.progressElm = null;
			this.genLog("已暂停");
			this.contiBtn.style.display = "inline-block";
			this.stopBtn.style.display = "none";
		});
	},
	//绑定导出Excel按钮
	bindOutputEvent() {
		this.outputBtn.addEventListener("click", () => {
			let cls = this.outputBtn.getAttribute('class');
			if (cls && !cls.includes('disable') || !cls) {
				window.dbOperation.read().then(({
					products
				}) => {
					const type = this.getType()
					const name = this.getCategory();
					this.Reptile.exportExcel(`${type}-${name}`, products);
					products = null
				})
			}

		});
	},

	//绑定重置按钮
	bindResetEvent() {
		this.resetBtn.addEventListener("click", async () => {
			const id = await window.notice.confirm('重置后将会清空本地存储的数据，是否重置？');
			if (id === 0) {
				await window.dbOperation.reset()
				window.location.reload()
			}
		});
	},
	//绑定切换一级类型事件
	bindTypeEvent() {
		this.typeSelect.addEventListener("change", (e) => {
			this.typeId = this.typeSelect.value;
			this.initCategoryList();
			this.reset();
			this.currentPage.value = 1;
		});
	},
	//绑定切换二级类型事件
	bindCategoryEvent() {
		this.categorySelect.addEventListener("change", () => {
			this.categoryId = this.categorySelect.value;
			this.reset();
			this.currentPage.value = 1;
		});
	},
	bindPriceAscEvent() {
		let sortGroup = document.querySelectorAll("input[name=sort]");
		Array.from(sortGroup).forEach(elm => {
			elm.oninput = () => {
				this.reset()
				this.currentPage.value = 1;
			}
		})
	},
	//绑定价格区间事件
	bindPriceRangeEvent() {
		const formatPrice = (e) => {
			if (e.target.value < 0) e.target.value = 0;
			if (this.minPriceElm.value != '' && this.maxPriceElm.value != '') {
				if (+this.maxPriceElm.value < +this.minPriceElm.value) {
					let temp = +this.maxPriceElm.value;
					this.maxPriceElm.value = +this.minPriceElm.value;
					this.minPriceElm.value = temp;
				}
			}
		}
		const reset = () => {
			this.reset();
			this.currentPage.value = 1;
		}
		this.minPriceElm.addEventListener('blur', formatPrice)
		this.maxPriceElm.addEventListener('blur', formatPrice)
		this.minPriceElm.addEventListener('input', reset)
		this.maxPriceElm.addEventListener('input', reset)

	},
	bindhasStockEvent() {
		let stockelm = document.getElementById("has_stock");
		stockelm.oninput = () => {
			this.reset()
			this.currentPage.value = 1;
		}
	},
	bindPageEvent() {
		this.currentPage.oninput = (e) => {
			this.reset()
		}
	},
	//绑定切换令牌事件
	bindTabToken() {
		this.tabTokenElm.addEventListener('click', () => {
			window.tabWindow.tabLogin()
		})

	},
	//绑定爬虫事件
	bindReptileEvent() {
		this.Reptile.on('start', ({
			total,
			totalPage
		}) => {
			this.total = total;
			this.totalPage = totalPage;
			this.reptileLog()
			this.outputBtn.removeAttribute('class')
		})
		this.Reptile.on("progress", (data) => {
			this.dbWrite({
				id: this.categoryId,
				parentId: this.typeId,
				...data
			})
			let val = data.current / data.totalPage;
			let progress = (val * 100).toFixed(2);
			if (this.progressElm) {
				let text = this.progressElm.innerHTML;
				this.progressElm.innerHTML = text.replace(
					/进度 .+%/,
					`进度 ${progress}%`
				);
			} else {
				this.progressElm = this.genLog(`进度 ${progress}%`);
			}

		});
		this.Reptile.on('finish', ({
			products
		}) => {
			//超过一万时
			if (this.total == 10000 && products) {
				const num = products.length;
				const max = products[num - 1].market_price;
				this.Reptile.setOption({
					page: 1,
					categoryNames: this.categoryNames,
					sort: this.sort,
					hasStock: this.hasStock,
					minPrice: max,
					maxPrice: 9999
				});
				this.progressElm = null;
				const gu = Math.floor(num / 10000) * 10000;
				this.genLog(`当前数据已满${gu}，开始爬取金额${max}以上的数据！`, '#ffa200');
				this.Reptile.start()
			} else {
				Promise.resolve().then(() => this.genLog("爬取完成"));
				this.progressElm = null;
				this.startBtn.style.display = "inline-block";
				this.stopBtn.style.display = "none";
				this.contiBtn.style.display = 'none'
			}
			products = null

		})
		this.Reptile.on('error', (err) => {
			this.progressElm = null;
			this.genLog(err, "red");
			this.initBtns()
		})
		this.Reptile.on('noData', () => {
			this.genLog('该类目暂无数据！', "red");
			this.progressElm = null;
			this.startBtn.style.display = "inline-block";
			this.stopBtn.style.display = "none";
		})
	},
	//重置
	reset() {
		window.dbOperation.reset()
		this.startBtn.style.display = 'inline-block';
		this.contiBtn.style.display = 'none';
		this.stopBtn.style.display = 'none';
		this.outputBtn.setAttribute('class', 'disable')
	},
	//写入本地数据库
	async dbWrite({
		products,
		current,
		total,
		totalPage,
		sort,
		hasStock,
		categoryNames,
		id,
		parentId,
		minPrice,
		maxPrice
	}) {
		let data = await window.dbOperation.read();
		data.current = current;
		data.total = total;
		data.totalPage = totalPage;
		data.sort = sort;
		data.hasStock = hasStock;
		data.id = id;
		data.parentId = parentId;
		data.categoryNames = categoryNames;
		data.minPrice = minPrice;
		data.maxPrice = maxPrice;
		data.products.push(...products)
		window.dbOperation.write(data)
	},
	genCategoryMap() {
		this.categoryList.forEach((item) => {
			if (!this.categoryMap.has(item.id)) {
				this.categoryMap.set(item.id, item);
			}
		});
	},
	genTypeMap() {
		this.typeList.forEach((item) => {
			if (!this.typeMap.has(item.id)) {
				this.typeMap.set(item.id, item);
			}
		});
	}
};

Controls.init(Reptile);


window.onerror = function(err) {
	window.log.error(err)
}