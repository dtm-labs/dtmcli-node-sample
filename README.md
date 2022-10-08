# dtmcli-node-sample

dtmcli的node使用示例

## 快速开始

### 安装运行dtm

参考[dtm安装运行](https://dtm.pub/guide/install.html)

## 运行示例
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

### 二阶段消息
#### 前置准备
准备`dtm_busi`库，新增`user_account`、`barrier`两张表。[具体sql参考](https://github.com/dtm-labs/dtm/tree/main/sqls)。
***注意barrier表同样需要建在dtm_busi库里***。
#### 普通消息
```bash
node msg.js
```

可看到日志中的sql执行语句并有如下顺序输出：
- TransOut 30
- TransIn 30

#### 二阶段消息

```bash
node msg.js local
```
可看到日志中的sql执行语句，并输出TransIn 30，
连接数据库可看到两个user的转账结果。