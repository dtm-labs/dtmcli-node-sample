# dtmcli-node-sample
dtmcli的node使用示例

## 快速开始

### 部署启动dtm

需要docker版本20.04以上
```
git clone https://github.com/yedf/dtm
cd dtm
docker-compose up
```

### 启动示例

```
npm install
node .
```

### 输出

可以从dtmcli-node-sample的日志里看到执行的顺序如下：

- TransOutTry
- TransInTry
- TransInConfirm
- TransOutConfirm

整个tcc事务执行成功
