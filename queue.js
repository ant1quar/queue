export class Queue {

      constructor (name, callback, maxTasks = 1){
            this._name = name;
            this._callback = callback;
            this._maxTasks = maxTasks;
            this._activeTasks = 0;
            this._tasks = [];
            this.itWorks = false;
      }

      get name() {
            return this._name;
        }
      
      _canWork() {
            return !this.itWorks || this._activeTasks < this._maxTasks;
      }

      addTask(task) {
            this._tasks.push(task);
            if(this._canWork()){
                  this.crawl();
            }
        }

      crawl() {
            if(this._tasks.length > 0) {
                  this.itWorks = true;
                  this._activeTasks++;
                  this._callback(this._tasks.shift()).finally(() => {
                        this.itWorks = false;
                        this._activeTasks--;
                        this.crawl();
                  });
            } 
        }
}
