import create from "zustand";
import { devtools } from "zustand/middleware";

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string | null;
};

type TaskMap = { [id: string]: Task };

type TaskState = {
  tasks: TaskMap;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
  setAll: (tasks: Task[]) => void;
};

export const useTaskStore = create(
  devtools(function (set) {
    return {
      tasks: {} as TaskMap,
      addTask: function (task) {
        set(function (state) {
          var newTasks = Object.assign({}, state.tasks);
          newTasks[task.id] = task;
          return { tasks: newTasks };
        });
      },
      updateTask: function (task) {
        set(function (state) {
          var newTasks = Object.assign({}, state.tasks);
          newTasks[task.id] = task;
          return { tasks: newTasks };
        });
      },
      removeTask: function (taskId) {
        set(function (state) {
          var newTasks = Object.assign({}, state.tasks);
          delete newTasks[taskId];
          return { tasks: newTasks };
        });
      },
      setAll: function (tasks) {
        set(function () {
          var map = {} as TaskMap;
          var i = tasks.length;
          while (i--) {
            var t = tasks[i];
            map[t.id] = t;
          }
          return { tasks: map };
        });
      }
    };
  })
);
