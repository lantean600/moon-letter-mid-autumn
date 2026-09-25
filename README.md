# 把月光寄给你

中秋互动祝福 H5：赏月、写祝福、放飞孔明灯、生成可保存的竖版图片。

## 本地预览

项目无需安装依赖。在本目录运行：

```sh
python -m http.server 8000
```

浏览器打开 `http://localhost:8000/`。也可直接打开 `index.html`，但部分浏览器在 `file://` 下限制图片导出，因此推荐使用静态服务器。

## 发布到 GitHub Pages

将本目录所有文件提交到 GitHub 仓库根目录。在仓库 **Settings → Pages** 中选择 **Deploy from a branch**，分支选择 `main`，目录选择 `/ (root)`。等待页面给出站点地址后，用手机微信实际打开并测试保存图片。

## 说明

- 祝福只在当前浏览器内生成，不上传至服务器。
- 微信内长按结果图片保存；桌面浏览器可点「保存祝福图片」。
- 若要替换场景，保持 `assets/moon-festival.webp` 的 9:16 竖版比例即可。导出图片使用同一张素材。
- 上游代码来源及许可说明见 [ATTRIBUTION.md](./ATTRIBUTION.md)。

场景图使用内置 image_gen 编辑，保留上方居中的满月与山峦构图，采用暖墨色、茶褐、赭石与旧金的克制配色。桂花、如意云纹、团花月轮和边缘宫灯作为少量点缀；无文字或界面元素。编辑结果转换为 WebP。

视觉母题参考故宫博物院的[桂花玉兔八月花神衣](https://www.dpm.org.cn/collection/music/233230.html)与中国国家博物馆的[嫦娥月宫纹铜镜](https://www.chnmuseum.cn/zp/zpml/csp/202203/t20220322_254446.shtml)，均为文化元素参考，未直接复制文物图像。
