const Koa = require('koa')
const koaBody = require('koa-body')
const Router = require('@koa/router')
const dtmcli = require('dtmcli')
const { getDB, initModel, getUserAccount } = require('./db')


const args = process.argv.slice(2)

const localTx = args.includes('local')

const dtm = "http://localhost:36789/api/dtmsvr" // dtm服务地址
const svc = "http://localhost:4005/api" // 本地服务前缀

const transOutUid = '1'
const transInUid = '2'

async function FireMsg() {
  let req = { amount: 30 } // 子事务需要的负荷
  const gid = await dtmcli.mustGenGid(dtm)
  const msg = new dtmcli.Msg(dtm, gid).add(`${svc }/TransOut`, req).add(`${svc }/TransIn`, req)
  await msg.prepare(`${svc }/query`)
  await msg.submit()
}


async function FireMsgWithLocalTransaction() {
  const req = { amount: 30 }
  const gid = await dtmcli.mustGenGid(dtm)
  const seuqelize = await getDB()
  const msg = new dtmcli.Msg(dtm, gid).add(`${svc }/TransIn`, req)
  await msg.doAndSubmitDB(`${svc }/query`, seuqelize, async (tx) => {
    await transUserBalance(tx, transOutUid, -req.amount)
  })
}

async function transUserBalance(tx, uid, amount) {
  const account = await getUserAccount().findOne(
    {
      where: {
        userId: uid,
      },
      transaction: tx,
    }
  )
  if (!account) {
    throw new Error('not found')
  }

  await account.increment({
    balance: amount,
  })
}

const app = new Koa()
const router = new Router()

router
  .get('/api/query', (ctx, next) => {
    console.log('query prepare')
    ctx.body = { dtm_result: 'SUCCESS' }
  })
  .post('/api/TransOut', async (ctx, next) => {
    console.log('TransOut', ctx.request.body.amount)
    await transUserBalance(undefined, transOutUid, -ctx.request.body.amount)
    ctx.body = { dtm_result: 'SUCCESS' }
  })
  .post('/api/TransIn', async (ctx, next) => {
    console.log('TransIn', ctx.request.body.amount)
    await transUserBalance(undefined, transInUid, ctx.request.body.amount)
    ctx.body = { dtm_result: 'SUCCESS' }
  })
  .get('/api/FireMsg', async (ctx, next) => {
    await FireMsg()
    ctx.body = { dtm_result: 'SUCCESS' }
  })
  .get('/api/FireLocalMsg', async (ctx, next) => {
    await FireMsgWithLocalTransaction()
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


async function startup() {
  const sequelize = await getDB()
  initModel(sequelize)
  dtmcli.init({
    sequelize,
  })
}

startup().then(() => {
  app.listen(4005, async () => {
    if (localTx) {
      await FireMsgWithLocalTransaction()
    } else {
      await FireMsg()
    }
  })
})
