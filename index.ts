import express from "express";
import type { NextFunction, Request, Response } from "express";
import client from "prom-client";

const RequestCounter = new client.Counter({
name:"http_requests",
help:"Totoal number of HTTP requests",
labelNames:['method', 'route', 'status_code']
}) 

const ActiveGuages = new client.Gauge({
    name: 'Active_requests',
    help:'number of acrtive requests'

})

const httpRequestsSeconds = new client.Histogram({
    name:"http_requests_time_taken_in_seconds",
    help:'duration of requests im seconds',
    labelNames:['method', 'route','code'],
    buckets:[0.1, 5,10,15,50, 100, 300, 500, 1000, 3000, 5000]
})

function TimeTookMiddleware(req: Request, res: Response, next: NextFunction) {
    ActiveGuages.inc()
    const startTime = Date.now();

    res.on("finish", () => {
        const EndTime = Date.now();     
        // console.log(`Time TOok ${EndTime - startTime} ms for method ${req.method} for Route ${req.route.path}`);

        RequestCounter.inc({
            method:req.method,
            route:req.route ? req.route.path : req.path,
            status_code:res.statusCode
        })
        ActiveGuages.dec()

        httpRequestsSeconds.observe({
            method:req.method,
            route:req.route ? req.route.path : req.path,
            code:res.statusCode
        }, EndTime-startTime)
    })

    next();


}

const app = express();

app.use(TimeTookMiddleware)

app.get("/cpu", (req, res) => {

    for (let i = 0; i < 1000000; i++) {
        Math.random();
    }

    res.json({ mess: "cpu route" })

})

app.get("/users", (req, res) => {
    res.status(200).json({
        user: "usersssss"
    })
})


app.get("/metrics", async(req, res) => {
const metrics = await client.register.metrics();
console.log(metrics);
res.set('Content-Type', client.register.contentType);
res.end(metrics);
})

app.listen(3000, () => {
    console.log("hello bro");
})