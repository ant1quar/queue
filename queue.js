export class Queue {
      tasks = [];

      constructor (_name, _callback, _maxTasks = 1){

      }

      get name() {
            return this._name;
        }

      addTask(task) {
            this.tasks.push(task);
            this.crawl();
        }

      crawl() {
            this._callback(this.tasks.shift());
        }
}
