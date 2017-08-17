const { spawn } = require('child_process');

const events = require('events');

function FunctionNameException(value) {
   this.value = value;
   this.message = ' - Function being called must be a string.';
   this.toString = function() {
      return 'Error - ' + this.value + this.message;
   };

}



function PyRunner(){

    this.pyProc = spawn('python', ['command_proc.py']/*, { stdio: ['pipe', 'pipe', 'pipe', 'ipc']}*/);
    this.response_queue = {}
    this.nextId = 0;
    this.freeIds = [];
    this.endEmitter = new events.EventEmitter();



    this.pyProc.stdout.on('data', (data) => {
      var obj_strings = data.toString().split('\n');
      obj_strings.forEach(function(str){ // use Array.filter in the future
          if(str != ''){
              var resp = JSON.parse(str);
              var id = resp.id;
              var data = resp.return_val;
              if(id in this.response_queue){
                  this.response_queue[id](data);
                  delete this.response_queue[id];
                  this.freeIds.push(id);
              }
          }
      }.bind(this));
      if(Object.keys(this.response_queue).length === 0 ){
          this.endEmitter.emit('end');
      }
    });



    // Error checking stuff
    this.pyProc.stderr.on('data', (data) => {
      console.log(data.toString());
    });

    this.pyProc.on('error', (err) => {
      console.log('Failed to start child process.');
    });
}


/*
* First Param must be the name of function to be called by python process
* Last Param is optional callback
* Middle Params are arguments for function to be called by python process
*/
PyRunner.prototype.run = function () {
    //make sure that the first argument is a string
    if (arguments[0] == undefined || (!(arguments[0] instanceof String) && typeof arguments[0] != 'string')){
        console.log(typeof arguments[0]);
        throw new FunctionNameException(0);
    }
    var args = []


    // get function arguments
    var callback = undefined;
    var len = arguments.length;
    if(typeof arguments[arguments.length-1] === 'function'){
        len--; // If there is a callback function, don't send it to python runner
        callback = arguments[arguments.length-1];
    }
    for(var i = 1; i < len; i++){
        args[i-1] = arguments[i]
    }

    // Set up function call with argument data
    var data = {};
    // get next id
    if(this.freeIds.length != 0){
        data.id = this.freeIds.pop();
    }else{
        data.id = this.nextId; // Need new way of setting up the id!
        this.nextId++;
    }

    if(callback != undefined){
        this.response_queue[data.id] = callback; // add callback to queue
    }

    data.func_name = arguments[0]
    data.args = args;

    // Call Python function
    this.pyProc.stdin.write(JSON.stringify(data) + '\n');
}



PyRunner.prototype.end = function () {
    if(Object.keys(this.response_queue).length === 0 ){
        this.pyProc.stdin.end();
    }
    else{
        this.endEmitter.on('end', function(){
            this.pyProc.stdin.end();
        }.bind(this));
    }

}


module.exports = PyRunner;
