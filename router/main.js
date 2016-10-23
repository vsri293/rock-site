module.exports = function(app, router)
{
    router.use(function (req,res,next) {
        console.log('/' + req.method);
        next();
    });

    router.get("/",function(req,res){
        res.sendFile(path + "index.html");
    });

    router.get("/about",function(req,res){
        res.sendFile(path + "about.html");
    });

    router.get("/contact",function(req,res){
        res.sendFile(path + "contact.html");
    });

    app.post("/user-data", function(req, res){
        console.log(req.body);
    });


    app.use("/", router);
}