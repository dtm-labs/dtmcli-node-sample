const Koa = require('koa')
const koaBody = require('koa-body')
const Router = require('@koa/router')
const dtmcli = require("dtmcli")

async function FireTcc() {
  let dtm = "http://localhost:8080/api/dtmsvr" // dtm服务地址
  let svc = "http://localhost:4005/api" // 本地服务前缀
  // 开启一个tcc事务，第二个参数里面，写全局事务的逻辑
  await dtmcli.tccGlobalTransaction(dtm, async (t) => {
    let req = { amount: 30 } // 子事务需要的负荷
    console.log("calling trans out")
    // 注册事务分支，并调用分支中的Try
    await t.callBranch(req, svc + "/TransOutTry", svc + "/TransOutConfirm", svc + "/TransOutCancel")
    console.log("calling trans in")
    // 注册事务分支，并调用分支中的Try
    await t.callBranch(req, svc + "/TransInTry", svc + "/TransInConfirm", svc + "/TransInCancel")
  })
}


const app = new Koa()
const router = new Router()

router.post('/api/TransOutTry', (ctx, next) => {
  console.log("TransOutTry")
  ctx.body = { result: "SUCCESS" }
}).post('/api/TransOutConfirm', (ctx, next) => {
  console.log("TransOutConfirm")
  ctx.body = { result: "SUCCESS" }
}).post('/api/TransOutCancel', (ctx, next) => {
  console.log("TransOutCancel")
  ctx.body = { result: "SUCCESS" }
}).post('/api/TransInTry', (ctx, next) => {
  console.log("TransInTry")
  ctx.body = { result: "SUCCESS" }
}).post('/api/TransInConfirm', (ctx, next) => {
  console.log("TransInConfirm")
  ctx.body = { result: "SUCCESS" }
}).post('/api/TransInCancel', (ctx, next) => {
  console.log("TransInCancel")
  ctx.body = { result: "SUCCESS" }
}).get('/api/FireTcc', async (ctx, next) => {
  await FireTcc()
  ctx.body = { result: "SUCCESS" }
})

app.use(koaBody({
  jsonLimit: '100kb'
})).use(router.routes())
  .use(router.allowedMethods())

app.listen(4005, FireTcc)
