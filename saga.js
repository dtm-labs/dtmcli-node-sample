const Koa = require('koa')
const koaBody = require('koa-body')
const Router = require('@koa/router')
const dtmcli = require('dtmcli')

const args = process.argv.slice(2)

const testConcurrent = args.includes('concurrent')

// 简单 SAGA
async function FireSaga() {
  let dtm = 'http://localhost:36789/api/dtmsvr' // dtm服务地址
  let svc = 'http://localhost:4005/api' // 本地服务前缀
  let req = { amount: 30 } // 子事务需要的负荷

  const saga = new dtmcli.Saga(dtm, await dtmcli.mustGenGid(dtm))
  // 添加一个TransOut的子事务，正向操作为url: svc+"/TransOut"， 逆向操作为url: svc+"/TransOutCompensate"
  saga.add(svc + '/TransOut', svc + '/TransOutCompensate', req)
  // 添加一个TransIn的子事务，正向操作为url: svc+"/TransIn"， 逆向操作为url: svc+"/TransInCompensate"
  saga.add(svc + '/TransIn', svc + '/TransInCompensate', req)
  // 提交saga事务，dtm会完成所有的子事务/回滚所有的子事务
  await saga.submit()
}

// 并发 SAGA
async function FireSagaConcurrent() {
  let dtm = 'http://localhost:36789/api/dtmsvr' // dtm服务地址
  let svc = 'http://localhost:4005/api' // 本地服务前缀
  let req = { amount: 30 } // 子事务需要的负荷
  const saga = new dtmcli.Saga(dtm, await dtmcli.mustGenGid(dtm))

  saga.add(svc + '/TransOut', svc + '/TransOutCompensate', req)
  saga.add(svc + '/TransOut', svc + '/TransOutCompensate', req)
  saga.add(svc + '/TransIn', svc + '/TransInCompensate', req)
  saga.add(svc + '/TransIn', svc + '/TransInCompensate', req)
  saga.addBranchOrder(2, [0, 1]) // 这里指定 branch 2 需要在 branch 0, branch 1之后执行
  saga.addBranchOrder(3, [0, 1]) // 这里指定 branch 3 需要在 branch 0, branch 1之后执行
  saga.enableConcurrent() // 打开并发开关

  await saga.submit()
}

const app = new Koa()
const router = new Router()

router
  .post('/api/TransOut', (ctx, next) => {
    console.log('TransOut')
    ctx.body = { dtm_result: 'SUCCESS' }
  })
  .post('/api/TransOutCompensate', (ctx, next) => {
    console.log('TransOutCompensate')
    ctx.body = { dtm_result: 'SUCCESS' }
  })
  .post('/api/TransIn', (ctx, next) => {
    console.log('TransIn')
    ctx.body = { dtm_result: 'SUCCESS' }
  })
  .post('/api/TransInCompensate', (ctx, next) => {
    console.log('TransInCompensate')
    ctx.body = { dtm_result: 'SUCCESS' }
  })
  .get('/api/FireSaga', async (ctx, next) => {
    await FireSaga()
    ctx.body = { dtm_result: 'SUCCESS' }
  })
  .get('/api/FireSagaConcurrent', async (ctx, next) => {
    await FireSagaConcurrent()
    ctx.body = { dtm_result: 'SUCCESS' }
  })

app
  .use(
    koaBody({
      jsonLimit: '100kb',
    })
  )
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(4005, async () => {
  if (testConcurrent) {
    await FireSagaConcurrent()
  } else {
    await FireSaga()
  }
})
