import axios from "axios";
import fs from 'node:fs'

const request = axios.create({
  baseURL: "https://api.xiaoguya.com:9898/",
  timeout: 10000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090c11)XWEB/11275",
  },
});

let token;
try {
  token = fs.readFileSync('./.token', 'utf-8')
  request.defaults.headers.common['Authorization'] = `bearer ${token}`;
} catch (err) { }

request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default request;
