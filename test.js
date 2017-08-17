// TESTING CODE
const PyRunner = require('./python-runner');



// Create a new python process
proc = new PyRunner();


setTimeout(function(){

    // run the function test.addArrays, with two array arguments, and a callback function
    proc.run("test.addArrays", [1,2,3], [2,3,4], function(data){
        console.log(data);
    });


    for(var i = 0; i < 100; i++){
        // run the function test.hello with no arguments and one callback function
        proc.run("test.hello", function(data){
            console.log("goodbye "+ this.i + " " + data);
        }.bind({i : i}));
    }
    // run without a callback function
    proc.run("test.hello");


    // End python process after all function calls on queue are clompleted
    proc.end();

}, 1000);
