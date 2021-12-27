# dtmcli-node-sample

dtmcli的node使用示例

## 快速开始

### 部署启动dtm

需要docker版本20.04以上

```bash
git clone https://github.com/yedf/dtm
cd dtm
docker-compose up
```

安装依赖

```bash
npm install
```

### Tcc

```bash
node index.js
```

#### 输出

可以从dtmcli-node-sample的日志里看到执行的顺序如下：

- TransOutTry
- TransInTry
- TransInConfirm
- TransOutConfirm

整个tcc事务执行成功

### 简单 saga

```bash
node saga.js
```

#### 输出

可以看到如下顺序输出:

- TransOut
- TransIn

整个 saga 事务执行成功

### 并发 saga

```bash
node saga.js concurrent
```

#### 输出

可以看到如下顺序输出:

- TransOut
- TransOut
- TransIn
- TransIn

整个 saga 事务并发执行, 并且符合指定顺序
