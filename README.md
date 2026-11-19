# webgl2-glsl-experiments

[在线体验「潮汐干涉」](https://fance-rest.github.io/webgl2-glsl-experiments/)

一个原生 WebGL2 / GLSL ES 3.00 着色器实验。移动鼠标或在触屏上拖动，可以改变一处波源的位置。暂停动画后也能调整波形。

[顶点着色器](shaders/fullscreen.vert) 用单个三角形覆盖视口。[片元着色器](shaders/tides.frag) 叠加两个径向波场，再沿等值线绘制青绿与琥珀色的纹路。线宽通过屏幕空间导数抗锯齿。系统启用减少动态效果时，首帧默认静止。

## 本地运行

在仓库根目录启动静态服务器，然后访问 http://localhost:8000/ 。

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

页面使用原生 JavaScript，直接从 main 分支根目录发布到 GitHub Pages，无需安装依赖或构建。
