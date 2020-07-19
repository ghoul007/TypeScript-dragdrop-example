namespace App {

     //Project State Managment
     export type Listener<T> = (items: T[]) => void

     export class State<T> {
         protected listeners: Listener<T>[] = [];
 
         addListener(lisnerFn: Listener<T>) {
             this.listeners.push(lisnerFn)
         }
 
     }
    export  class Projectstate extends State<Project> {
         private projects: Project[] = [];
         private static instance: Projectstate;
 
         private constructor() {
             super()
         }
 
         static getInstance() {
             if (this.instance) {
                 return this.instance
             }
             this.instance = new Projectstate();
             return this.instance;
         }
 
 
 
         addProject(title: string, description: string, numPeople: number) {
             const newProject = new Project(
                 Math.random().toString(),
                 title,
                 description,
                 numPeople,
                 ProjectStatus.Active
             )
 
             this.projects.push(newProject);
             this.updateListeners();
 
         }
 
 
 
         moveProject(projectId: string, newstatus: ProjectStatus) {
             const project = this.projects.find(prj => prj.id === projectId);
             console.log(project, newstatus);
             if (project && project.status != newstatus) {
                 project.status = newstatus;
                 this.updateListeners();
             }
         }
 
 
 
         private updateListeners() {
             for (const lisnerFn of this.listeners) {
                 lisnerFn(this.projects.slice())
             }
         }
 
 
     }

     
}