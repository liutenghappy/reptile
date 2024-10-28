async function loginEvent() {
	LoginToken.loading = true;
	try {
		let token = LoginToken.tokenElm.value;
		if (!token) return await window.notice.warning('请输入令牌！')
		await request.post("/token", {
			token
		})
		await window.tabWindow.tabControl()
	} catch (err) {
		console.log(err)
		await window.notice.error('令牌无效！')
	} finally {
		LoginToken.loading = false;
	}


}

const LoginToken = {
	loginBtn: document.getElementById("begin"),
	tokenElm: document.getElementById("token"),
	loading: false,
	init() {
		this.bindEvent();
	},
	bindEvent() {
		this.bindLogin();
	},
	bindLogin() {
		this.loginBtn.addEventListener("click", loginEvent);
	},
};

LoginToken.init();