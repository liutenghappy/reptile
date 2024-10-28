import express from "express";
import request from "../utils/request.mjs";
import fs from 'node:fs'
const app = express();

app.use(express.json())

app.all("*", (req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  next();
});

//根据分类查书
app.get("/searchProduct", (req, res) => {
  const query = req.query;
  if (query.current && query.size && query.categoryNames) {
    let params = `?current=${query.current}&size=${query.size}&categoryNames=${query.categoryNames}`;
    if (query.sort) params += `&sort=${query.sort}`;
    if (query.hasStock === "1") params += `&hasStock=${query.hasStock}`;
	if(query.minPrice!=null&&query.maxPrice!=null) params+=`&minPrice=${query.minPrice}&maxPrice=${query.maxPrice}`;
    request(`/mall/api/mall/product/search/searchProduct${params}`)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err.message);
      });
  } else {
    res.status(400).send("请求参数出错");
  }
});

//一级分类
app.get("/shopcategory", (req, res) => {
  request(`/mall/api/mall/product/shopcategory/listByParentId?parentId=0`)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err.message);
    });
});

//二级分类
app.get("/category/:id", (req, res) => {
  let id = req.params.id;
  request(`/mall/api/mall/product/shopcategory/listByParentId?parentId=${id}`)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err.message);
    });
});

app.post("/token", (req, res) => {
  const token = req.body.token;
  request.get(`/iam/api/account/info`, {
    headers: {
      Authorization: `bearer ${token}`,
    }
  }).then(resonse => {
    if (resonse.code == 0 && resonse.success) {
      fs.writeFileSync('./.token', token)
      request.defaults.headers.common['Authorization'] = `bearer ${token}`;
      res.status(200).send({
        code: 0,
        msg: '权限认证成功',
        success: true
      })
    }
  }).catch(err => {
    res.send({
      code: 1,
      msg: '权限认证失败',
      success: false
    })
  })
});

app.get('/auth/:code',(req,res)=>{
	let code = req.params.code;
	request.post(`/auth/oauth/token?grant_type=wechat_mini_program&code=${code}`,{},{
		headers:{
			Authorization:'Basic eGlhb2d1eWEtYXBwOmIwNzkyOThk',
			xweb_xhr:1
		}
	}).then(data=>{
		res.send(data)
	}).catch((err) => {
      console.log(err);
      res.status(500).send(err.message);
    });
})


app.listen(4444, () => {
  console.log("服务器启动");
});
